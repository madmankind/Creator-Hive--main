import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { assertCampaignAccess } from "@/server/campaignAccess";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN", "CREATOR"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const { campaignId } = await params;

  const denied = await assertCampaignAccess(user, campaignId);
  if (denied) return denied;

  const payments = await db.campaignPayment.findMany({
    where: { campaignId },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ payments });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const { campaignId } = await params;

  const denied = await assertCampaignAccess(user, campaignId);
  if (denied) return denied;

  const body = await req.json();
  const { amount, dueDate } = body;

  if (!amount || !dueDate) {
    return NextResponse.json({ error: "amount and dueDate are required" }, { status: 400 });
  }

  const payment = await db.campaignPayment.create({
    data: {
      campaignId,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      status: "COMMITTED",
    },
  });

  return NextResponse.json({ ok: true, payment });
}
