import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { computeLineTotal } from "@/lib/podPricing";

const schema = z.object({
  talentIds: z.array(z.string()).min(1),
});

async function assertCampaignAccess(campaignId: string, user: { id: string; email: string; name?: string | null; role: string }) {
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (user.role === "ADMIN") return { campaign };
  const agency = await getOrCreateAgency(user);
  if (campaign.agencyId !== agency.id) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { campaign };
}

export async function POST(req: Request, context: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await context.params;
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const access = await assertCampaignAccess(campaignId, user);
  if ("error" in access) return access.error;

  let payload: z.infer<typeof schema>;
  try {
    payload = await schema.parseAsync(await req.json());
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues.map((i) => i.message).join(", ") : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const pod = await (db as any).campaignPod.upsert({
    where: { campaignId },
    update: { talentIds: payload.talentIds, updatedAt: new Date() },
    create: {
      campaignId,
      talentIds: payload.talentIds,
    },
  });

  const existingConfigs = await db.campaignPodSelectionConfig.findMany({
    where: { campaignId },
  });
  const existingMap = new Map(existingConfigs.map((c) => [c.creatorProfileId, c]));

  // Remove configs for removed talents
  const removedIds = existingConfigs
    .map((c) => c.creatorProfileId)
    .filter((id) => !payload.talentIds.includes(id));
  if (removedIds.length) {
    await db.campaignPodSelectionConfig.deleteMany({
      where: {
        campaignId,
        creatorProfileId: { in: removedIds },
      },
    });
  }

  // Upsert configs for added talents
  const addedIds = payload.talentIds.filter((id) => !existingMap.has(id));
  if (addedIds.length) {
    const creators = await db.creatorProfile.findMany({
      where: { id: { in: addedIds } },
      select: {
        id: true,
        dayRate: true,
        hourlyRate: true,
      },
    });
    const byId = new Map(creators.map((c) => [c.id, c]));

    await Promise.all(
      addedIds.map(async (creatorProfileId) => {
        const creator = byId.get(creatorProfileId);
        const dayRate = creator?.dayRate ?? 0;
        const hourlyRate = creator?.hourlyRate ?? 0;
        const monthlyRate = creator?.dayRate ? creator.dayRate * 20 : 0;
        const estimatedDays = 1;
        const lineTotal = computeLineTotal({
          hireType: "PROJECT",
          estimatedDays,
          dayRate,
          usageRightsFee: 0,
        });
        await db.campaignPodSelectionConfig.upsert({
          where: {
            campaignId_creatorProfileId: {
              campaignId,
              creatorProfileId,
            },
          },
          update: {
            hireType: "PROJECT",
            estimatedDays,
            dayRate,
            hourlyRate,
            monthlyRate,
            lineTotal,
          },
          create: {
            campaignId,
            creatorProfileId,
            hireType: "PROJECT",
            estimatedDays,
            dayRate,
            hourlyRate,
            monthlyRate,
            lineTotal,
          },
        });
      }),
    );
  }

  return NextResponse.json({ ok: true, pod });
}
