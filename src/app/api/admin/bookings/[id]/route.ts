import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  let body: { status?: "PENDING" | "REVIEWING" | "CONFIRMED" } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await db.bookingRequest.update({
    where: { id },
    data: body.status !== undefined ? { status: body.status } : {},
  });

  return NextResponse.json({ booking: updated });
}

// Convert a booking into a Campaign (admin action)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const body = await req.json().catch(() => ({ action: "" }));

  if (body.action !== "convert") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const booking = await db.bookingRequest.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Find or create an agency account for this user
  let agencyId = booking.agencyId;
  if (!agencyId) {
    const existing = await db.agencyAccount.findFirst({ where: { userId: booking.userId } });
    if (existing) {
      agencyId = existing.id;
    } else {
      const created = await db.agencyAccount.create({
        data: {
          userId: booking.userId,
          name: booking.user.name ?? booking.contactEmail,
        },
      });
      agencyId = created.id;
    }
  }

  const campaign = await db.campaign.create({
    data: {
      agencyId,
      title: `Campaign from booking — ${new Date(booking.createdAt).toLocaleDateString("en-GB")}`,
      brief: booking.description,
      status: "ACTIVE",
      budget: booking.budgetRange ? parseInt(booking.budgetRange.replace(/\D/g, ""), 10) * 100 : null,
    },
  });

  await db.bookingRequest.update({ where: { id }, data: { status: "CONFIRMED" } });

  return NextResponse.json({ campaign });
}
