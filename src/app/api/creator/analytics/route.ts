import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET() {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;

  const profile = await db.creatorProfile.findUnique({
    where: { userId: auth.user.id },
    select: {
      id: true, profileViews: true, totalEarned: true,
      responseRate: true, avgResponseHours: true,
      invites: { select: { status: true, createdAt: true } },
      invoices: { select: { amount: true, status: true, createdAt: true } },
    },
  });

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const totalInvites = profile.invites.length;
  const acceptedInvites = profile.invites.filter(i => i.status === "ACCEPTED").length;
  const bookingRate = totalInvites > 0 ? acceptedInvites / totalInvites : 0;

  const paidInvoices = profile.invoices.filter(i => i.status === "PAID");
  const totalEarned = paidInvoices.reduce((sum, i) => sum + i.amount, 0);

  // Monthly earnings for the last 6 months
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthlyEarnings: Record<string, number> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyEarnings[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`] = 0;
  }
  paidInvoices
    .filter(inv => inv.createdAt >= sixMonthsAgo)
    .forEach(inv => {
      const key = `${inv.createdAt.getFullYear()}-${String(inv.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyEarnings) monthlyEarnings[key] += inv.amount;
    });

  const earningsChart = Object.entries(monthlyEarnings)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));

  return NextResponse.json({
    profileViews: profile.profileViews,
    totalEarned: Math.max(totalEarned, profile.totalEarned),
    bookingRate: Math.round(bookingRate * 100),
    responseRate: profile.responseRate ? Math.round(profile.responseRate * 100) : null,
    avgResponseHours: profile.avgResponseHours,
    totalInvites,
    acceptedInvites,
    earningsChart,
  });
}
