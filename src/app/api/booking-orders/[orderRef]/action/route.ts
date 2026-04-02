import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";

type ClientAction = "approve" | "replace" | "cancel";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const { orderRef } = await params;
  const token = req.nextUrl.searchParams.get("token");
  const action = req.nextUrl.searchParams.get("action") as ClientAction | null;

  if (!token || !action || !["approve", "replace", "cancel"].includes(action)) {
    return NextResponse.redirect(new URL("/booking/invalid", req.url));
  }

  const order = await (db as any).bookingOrder.findUnique({ where: { orderRef } });
  if (!order || order.clientActionToken !== token) {
    return NextResponse.redirect(new URL("/booking/invalid", req.url));
  }
  if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
    return NextResponse.redirect(new URL(`/booking/${orderRef}/expired`, req.url));
  }
  if (order.clientAction) {
    // Already acted — show status page
    return NextResponse.redirect(new URL(`/booking/${orderRef}/status`, req.url));
  }

  const statusMap: Record<ClientAction, string> = {
    approve: "CLIENT_APPROVED",
    replace: "CLIENT_REPLACEMENT_REQUESTED",
    cancel: "CANCELLED",
  };

  await (db as any).bookingOrder.update({
    where: { orderRef },
    data: {
      status: statusMap[action],
      clientAction: action,
      clientActionAt: new Date(),
      clientActionToken: null, // consume token
    },
  });

  // On approve: advance campaign to CONFIRMED_BRIEF_PENDING
  if (action === "approve" && order.campaignId) {
    await db.campaign.update({
      where: { id: order.campaignId },
      data: { status: "CONFIRMED_BRIEF_PENDING" },
    }).catch(() => null);
  }

  // On cancel: mark campaign cancelled
  if (action === "cancel" && order.campaignId) {
    await db.campaign.update({
      where: { id: order.campaignId },
      data: { status: "CANCELLED" },
    }).catch(() => null);
  }

  return NextResponse.redirect(new URL(`/booking/${orderRef}/status?action=${action}`, req.url));
}
