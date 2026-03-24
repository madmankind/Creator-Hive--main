import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const [
    totalCreators,
    pendingTalent,
    activeCampaigns,
    totalBookings,
    pendingBookings,
    totalAgencies,
    pendingInvites,
  ] = await Promise.all([
    db.creatorProfile.count(),
    db.creatorProfile.count({ where: { talentStatus: "pending" } }),
    db.campaign.count({ where: { status: { in: ["ACTIVE", "IN_PROGRESS"] } } }),
    db.bookingRequest.count(),
    db.bookingRequest.count({ where: { status: "PENDING" } }),
    db.agencyAccount.count(),
    db.campaignInvite.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({
    totalCreators,
    pendingTalent,
    activeCampaigns,
    totalBookings,
    pendingBookings,
    totalAgencies,
    pendingInvites,
  });
}
