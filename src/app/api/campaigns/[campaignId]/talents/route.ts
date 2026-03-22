import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { curatedTalent } from "@/lib/curatedTalent";

function mapCampaignTalentToCard(
  campaignId: string,
  ct: {
    id: string;
    talentId: string;
    status: string;
    rate: number | null;
    assignedAt: Date;
    talent: {
      id: string;
      name: string;
      instagram: string | null;
      skills: string[];
      avatarUrl: string | null;
      bio: string | null;
      hourlyRate: number | null;
      dayRate: number | null;
    };
  }
) {
  const curated = curatedTalent.find((t) => t.id === ct.talentId);
  return {
    id: ct.id,
    campaignId,
    talentId: ct.talentId,
    talentName: ct.talent.name,
    talentRole: (ct.talent.skills ?? [])[0] ?? "Creator",
    talentAvatar: ct.talent.avatarUrl ?? undefined,
    talentBio: curated?.shortBio ?? ct.talent.bio ?? "",
    deliverables: [] as { id: string; type: string; files: unknown[]; status: string; revisionCount: number }[],
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
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const { campaignId } = await params;

  const talentSelect = {
    id: true,
    name: true,
    instagram: true,
    skills: true,
    avatarUrl: true,
    bio: true,
    hourlyRate: true,
    dayRate: true,
  } as const;

  if (user.role === "CREATOR") {
    const profile = await db.creatorProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      return NextResponse.json({ cards: [] });
    }

    const campaign = await db.campaign.findFirst({
      where: {
        id: campaignId,
        talents: { some: { talentId: profile.id } },
      },
      select: {
        id: true,
        talents: {
          where: { talentId: profile.id },
          include: { talent: { select: talentSelect } },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const cards = campaign.talents.map((ct) =>
      mapCampaignTalentToCard(campaign.id, {
        ...ct,
        talent: ct.talent,
      })
    );
    return NextResponse.json({ cards });
  }

  if (user.role !== "AGENCY" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
            select: talentSelect,
          },
        },
      },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const cards = campaign.talents.map((ct) => mapCampaignTalentToCard(campaign.id, ct));

  return NextResponse.json({ cards });
}
