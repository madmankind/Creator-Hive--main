import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const since7d  = new Date(Date.now() - 7  * 86400000);
  const since30d = new Date(Date.now() - 30 * 86400000);
  const since14d = new Date(Date.now() - 14 * 86400000);

  const [
    totalUsers, agencyUsers, creatorUsers,
    usersLast7d, usersLast30d,
    creatorsActive, creatorsPending, creatorsRejected,
    agenciesWithCampaigns, totalCampaigns, campaignsActive,
    totalBookings, bookingsPending, bookingsConfirmed,
    usersNoProfile, creatorsUnverified,
    briefsTotal, briefsComplete,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "AGENCY" } }),
    db.user.count({ where: { role: "CREATOR" } }),
    db.user.count({ where: { createdAt: { gte: since7d } } }),
    db.user.count({ where: { createdAt: { gte: since30d } } }),
    db.creatorProfile.count({ where: { talentStatus: "active" } }),
    db.creatorProfile.count({ where: { talentStatus: "pending" } }),
    db.creatorProfile.count({ where: { talentStatus: "rejected" } }),
    db.agencyAccount.count({ where: { campaigns: { some: {} } } }),
    db.campaign.count(),
    db.campaign.count({ where: { status: { in: ["IN_PROGRESS", "ACTIVE", "BRIEF_SENT"] } } }),
    db.bookingRequest.count(),
    db.bookingRequest.count({ where: { status: "PENDING" } }),
    db.bookingRequest.count({ where: { status: "CONFIRMED" } }),
    db.user.count({ where: { agencyAccount: null, creatorProfile: null, role: { not: "ADMIN" } } }),
    db.creatorProfile.count({ where: { isVerified: false, talentStatus: "pending" } }),
    db.discoveryBrief.count(),
    db.discoveryBrief.count({ where: { status: "COMPLETE" } }),
  ]);

  // Daily signups last 14 days
  const recentSignups = await db.user.findMany({
    where: { createdAt: { gte: since14d } },
    select: { createdAt: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  const byDay: Record<string, { clients: number; creators: number }> = {};
  for (const u of recentSignups) {
    const day = u.createdAt.toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = { clients: 0, creators: 0 };
    if (u.role === "AGENCY")  byDay[day].clients++;
    if (u.role === "CREATOR") byDay[day].creators++;
  }

  return NextResponse.json({
    totals: { users: totalUsers, agencies: agencyUsers, creators: creatorUsers, newLast7d: usersLast7d, newLast30d: usersLast30d },
    funnel: {
      clientsSignedUp: agencyUsers, clientsWithCampaigns: agenciesWithCampaigns,
      campaignsActive, totalCampaigns,
      bookingsTotal: totalBookings, bookingsPending, bookingsConfirmed,
      discoveryBriefs: briefsTotal, discoveryComplete: briefsComplete,
      creatorsTotal: creatorUsers, creatorsPending, creatorsActive, creatorsRejected, creatorsUnverified,
    },
    partialSignups: { noProfile: usersNoProfile, talentPendingReview: creatorsPending },
    dailySignups: byDay,
  });
}
