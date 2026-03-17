import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { curatedTalent } from "@/lib/curatedTalent";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const { campaignId } = await params;

  const agency = user.role === "ADMIN" ? null : await getOrCreateAgency(user);

  const campaign = await db.campaign.findFirst({
    where: {
      id: campaignId,
      ...(agency ? { agencyId: agency.id } : {}),
    },
    select: {
      id: true,
      title: true,
      status: true,
      talents: {
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              instagram: true,
              skills: true,
              avatarUrl: true,
              bio: true,
              hourlyRate: true,
              dayRate: true,
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const cards = campaign.talents.map((ct) => {
    // Find the matching curatedTalent profile to get engagement rate + bio
    const curated = curatedTalent.find(t => t.id === ct.talentId);
    return {
      id: ct.id,
      campaignId: campaign.id,
      talentId: ct.talentId,
      talentName: ct.talent.name,
      talentRole: (ct.talent.skills ?? [])[0] ?? "Creator",
      talentAvatar: ct.talent.avatarUrl ?? undefined,
      talentBio: curated?.shortBio ?? ct.talent.bio ?? "",
      deliverables: [],
      agreedRate: ct.rate ?? ct.talent.dayRate ?? ct.talent.hourlyRate ?? 0,
      currency: "AED",
      engagementRate: curated?.engagementRate
        ? parseFloat((curated.engagementRate * 100).toFixed(1))
        : 0,
      status: ct.status === "IN_PROGRESS" ? "IN_PRODUCTION" : ct.status,
      paymentStatus: "UNFUNDED",
      bookingState: "CONFIRMED",
      contractId: undefined,
      createdAt: ct.assignedAt.toISOString(),
    };
  });

  return NextResponse.json({ cards });
}
