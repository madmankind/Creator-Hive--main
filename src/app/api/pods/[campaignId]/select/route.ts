import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";

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

export async function POST(req: Request, { params }: { params: { campaignId: string } }) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const access = await assertCampaignAccess(params.campaignId, user);
  if ("error" in access) return access.error;

  let payload: z.infer<typeof schema>;
  try {
    payload = await schema.parseAsync(await req.json());
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues.map((i) => i.message).join(", ") : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const pod = await (db as any).campaignPod.upsert({
    where: { campaignId: params.campaignId },
    update: { talentIds: payload.talentIds, updatedAt: new Date() },
    create: {
      campaignId: params.campaignId,
      talentIds: payload.talentIds,
    },
  });

  return NextResponse.json({ ok: true, pod });
}
