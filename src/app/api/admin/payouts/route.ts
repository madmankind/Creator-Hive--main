import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  // Pending wallet payouts (DEBIT transactions awaiting processing)
  const payouts = await db.walletTransaction.findMany({
    where: { direction: "DEBIT", status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, amount: true, currency: true, type: true, status: true,
      createdAt: true, stripeObjectId: true, metadata: true,
      creator: { select: { id: true, name: true, userId: true } },
      user: { select: { name: true, email: true } },
    },
  });
  const totalPending = payouts.reduce((s, p) => s + p.amount, 0);
  return NextResponse.json({ payouts, totalPending });
}

export async function PATCH(req: Request) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { id, action } = await req.json().catch(() => ({}));
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "id and action (approve|reject) required" }, { status: 400 });
  }
  const newStatus = action === "approve" ? "SUCCEEDED" : "FAILED";
  await db.walletTransaction.update({ where: { id }, data: { status: newStatus } });
  return NextResponse.json({ ok: true, id, status: newStatus });
}
