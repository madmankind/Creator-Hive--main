import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { curatedTalent } from "@/lib/curatedTalent";
import type { BookingState, Deliverable, PaymentState, TalentCampaignCard, TalentCampaignStatus } from "@/components/campaigns/types";

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
  ,
  contract?: {
    id: string;
    status: string;
    milestones: Array<{ status: string; dueDate: Date | null }>;
  },
) {
  const curated = curatedTalent.find((t) => t.id === ct.talentId);

  const milestones = contract?.milestones ?? [];
  const hasDisputed = milestones.some((m) => m.status === "DISPUTED");
  const hasApproved = milestones.some((m) => m.status === "APPROVED" || m.status === "RELEASED");
  const deliverableStatus: Deliverable["status"] = hasDisputed
    ? "NeedsRevision"
    : hasApproved
      ? "Approved"
      : "Pending";

  // Payment status derived from milestone progression.
  // - RELEASED: any milestone released
  // - FUNDED / PARTIALLY_FUNDED: any milestone funded-related but not fully released
  // - UNFUNDED: no milestones funded-related yet
  const totalMilestones = milestones.length;
  const hasReleased = milestones.some((m) => m.status === "RELEASED");
  const fundedLike = milestones.filter((m) =>
    ["FUNDED", "IN_PROGRESS", "SUBMITTED", "APPROVED"].includes(m.status),
  );
  let paymentStatus: PaymentState = "UNFUNDED";
  if (hasReleased) {
    paymentStatus = "RELEASED";
  } else if (fundedLike.length > 0) {
    paymentStatus = totalMilestones > 0 && fundedLike.length < totalMilestones ? "PARTIALLY_FUNDED" : "FUNDED";
  }

  // Booking state is a simplified view of contract signature lifecycle.
  let bookingState: BookingState = "PENDING";
  if (ct.status === "CANCELLED") {
    bookingState = "EXPIRED";
  } else if (!contract) {
    bookingState = "PENDING";
  } else if (contract.status === "AGENCY_SIGNED") {
    bookingState = "ACCEPTED";
  } else if (contract.status === "FULLY_SIGNED" || contract.status === "COMPLETED") {
    bookingState = "CONFIRMED";
  } else if (contract.status === "CANCELLED") {
    bookingState = "DECLINED";
  }

  // UI status: use milestone progression as the source of truth where possible.
  let status: TalentCampaignStatus = "BOOKED";
  if (ct.status === "CANCELLED") {
    status = "UNAVAILABLE";
  } else if (paymentStatus === "RELEASED") {
    status = "PAID";
  } else if (milestones.some((m) => m.status === "APPROVED")) {
    status = "APPROVED";
  } else if (milestones.some((m) => m.status === "SUBMITTED")) {
    status = "SUBMITTED";
  } else if (ct.status === "IN_PROGRESS") {
    status = "IN_PRODUCTION";
  }

  return {
    id: ct.id,
    campaignId,
    talentId: ct.talentId,
    talentName: ct.talent.name,
    talentRole: (ct.talent.skills ?? [])[0] ?? "Creator",
    talentAvatar: ct.talent.avatarUrl ?? undefined,
    talentBio: curated?.shortBio ?? ct.talent.bio ?? "",
    // Deliverables are currently not modeled per campaign in DB.
    // To keep Track/Manage/Pay UI coherent, we render lightweight placeholders
    // driven by contract milestone status (pending vs needs revision vs approved).
    deliverables: [
      { id: `del-${ct.id}-1`, type: "Reel", files: [], status: deliverableStatus, revisionCount: 0 } satisfies Deliverable,
      { id: `del-${ct.id}-2`, type: "Story", files: [], status: deliverableStatus, revisionCount: 0 } satisfies Deliverable,
    ],
    agreedRate: ct.rate ?? ct.talent.dayRate ?? ct.talent.hourlyRate ?? 0,
    currency: "AED",
    engagementRate: curated?.engagementRate
      ? parseFloat((curated.engagementRate * 100).toFixed(1))
      : 0,
    status,
    paymentStatus,
    bookingState,
    contractId: contract?.id,
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

  const talentIds = campaign.talents.map((ct) => ct.talentId);
  const contracts = await db.contract.findMany({
    where: {
      campaignId,
      creatorProfileId: { in: talentIds },
    },
    include: { milestones: true },
  });
  const contractByCreatorId = new Map<string, (typeof contracts)[number]>();
  for (const c of contracts) contractByCreatorId.set(c.creatorProfileId, c);

  const cards: TalentCampaignCard[] = campaign.talents.map((ct) =>
    mapCampaignTalentToCard(
      campaign.id,
      {
        ...ct,
        talent: ct.talent,
      },
      contractByCreatorId.get(ct.talentId),
    )
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

  const talentIds = campaign.talents.map((ct) => ct.talentId);
  const contracts = await db.contract.findMany({
    where: {
      campaignId,
      creatorProfileId: { in: talentIds },
    },
    include: { milestones: true },
  });
  const contractByCreatorId = new Map<string, (typeof contracts)[number]>();
  for (const c of contracts) contractByCreatorId.set(c.creatorProfileId, c);

  const cards: TalentCampaignCard[] = campaign.talents.map((ct) =>
    mapCampaignTalentToCard(campaign.id, ct as any, contractByCreatorId.get(ct.talentId))
  );

  return NextResponse.json({ cards });
}
