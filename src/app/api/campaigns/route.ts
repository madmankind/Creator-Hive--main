import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";
import { requireUser } from "@/server/authz";
import { getCreatorProfileIdForUser } from "@/server/campaignAccess";

export async function GET() {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN", "CREATOR"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  if (user.role === "CREATOR") {
    const profileId = await getCreatorProfileIdForUser(user.id);
    if (!profileId) {
      return NextResponse.json({ campaigns: [] });
    }
    const rows = await db.campaignTalent.findMany({
      where: { talentId: profileId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            dueDate: true,
            budget: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    return NextResponse.json({
      campaigns: rows.map((r) => ({
        id: r.campaign.id,
        name: r.campaign.title,
        status: r.campaign.status,
        startDate: r.campaign.startDate,
        dueDate: r.campaign.dueDate,
        budget: r.campaign.budget,
        talentIds: [profileId],
        talentNames: [user.name ?? "You"],
      })),
    });
  }

  const agency = user.role === "ADMIN" ? null : await getOrCreateAgency(user);

  const campaigns = await db.campaign.findMany({
    where: agency ? { agencyId: agency.id } : undefined,
    select: {
      id: true,
      title: true,
      status: true,
      startDate: true,
      dueDate: true,
      budget: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    campaigns: campaigns.map((c) => ({
      id: c.id,
      name: c.title,
      status: c.status,
      startDate: c.startDate,
      dueDate: c.dueDate,
      budget: c.budget,
    })),
  });
}
