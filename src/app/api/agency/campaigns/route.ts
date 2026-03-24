import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";
import { ensureCuratedCreatorProfile } from "@/server/curated";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

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
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const agency = await getOrCreateAgency(user);

  const schema = z.object({
    title: z.string().min(2),
    brief: z.string().min(2),
    startDate: z.string().datetime().optional(),
    dueDate: z.string().datetime().optional(),
    talentIds: z.array(z.string()).optional(),
    status: z.enum([
      "DRAFT",
      "PROVISIONAL",
      "CONFIRMED_BRIEF_PENDING",
      "BRIEF_SENT",
      "ACTIVE",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ]).optional(),
    budget: z.number().int().nonnegative().optional(),
  });
  let payload: z.infer<typeof schema>;

  try {
    payload = await schema.parseAsync(await req.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError ? err.issues.map((i) => i.message).join(", ") : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
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
        title: payload.title,
        brief: payload.brief,
        agencyId: agency.id,
        status: payload.status ?? "DRAFT",
        budget: payload.budget,
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
