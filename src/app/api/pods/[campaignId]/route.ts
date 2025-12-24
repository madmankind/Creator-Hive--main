import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";

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

export async function GET(_: Request, { params }: { params: { campaignId: string } }) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const access = await assertCampaignAccess(params.campaignId, user);
  if ("error" in access) return access.error;

  const pod = await (db as any).campaignPod.findUnique({
    where: { campaignId: params.campaignId },
  });

  const invites = await (db as any).campaignInvite.findMany({
    where: { campaignId: params.campaignId },
    include: { creator: true },
    orderBy: { createdAt: "desc" },
  });

  const talentIds = pod?.talentIds ?? [];
  const creators = await db.creatorProfile.findMany({
    where: { id: { in: talentIds } },
  });
  const creatorMap = new Map(creators.map((c) => [c.id, c]));

  return NextResponse.json({
    pod: {
      campaignId: params.campaignId,
      talentIds,
    },
    invites: invites.map((invite: any) => ({
      id: invite.id,
      talentId: invite.creatorProfileId,
      status: invite.status,
      note: invite.note,
      talent: creatorMap.get(invite.creatorProfileId) || invite.creator,
    })),
  });
}
