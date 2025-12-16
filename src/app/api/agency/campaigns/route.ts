import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";
import { ensureCuratedCreatorProfile } from "@/server/curated";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const agency = await getOrCreateAgency(user);
  const campaigns = await db.campaign.findMany({
    where: { agencyId: agency.id },
    include: {
      talents: {
        include: {
          talent: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: campaigns });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const agency = await getOrCreateAgency(user);

  let payload: {
    title?: string;
    brief?: string;
    startDate?: string;
    dueDate?: string;
    talentIds?: string[];
  } = {};

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!payload.title || !payload.brief) {
    return NextResponse.json({ error: "Title and brief are required" }, { status: 400 });
  }

  const talentIds = payload.talentIds ?? [];
  const creators = await Promise.all(
    talentIds.map(async (talentId) => {
      return ensureCuratedCreatorProfile(talentId);
    }),
  );

  const campaign = await db.$transaction(async (tx) => {
    const createdCampaign = await tx.campaign.create({
      data: {
        title: payload.title!,
        brief: payload.brief!,
        agencyId: agency.id,
        startDate: payload.startDate ? new Date(payload.startDate) : undefined,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      },
    });

    if (creators.length > 0) {
      await tx.campaignTalent.createMany({
        data: creators.map((creator) => ({
          campaignId: createdCampaign.id,
          talentId: creator.id,
        })),
      });
    }

    return createdCampaign;
  });

  const hydrated = await db.campaign.findUnique({
    where: { id: campaign.id },
    include: {
      talents: { include: { talent: true } },
    },
  });

  return NextResponse.json({ data: hydrated }, { status: 201 });
}
