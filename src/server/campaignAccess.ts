import { NextResponse } from "next/server";
import type { User } from "@prisma/client";
import { db } from "@/server/db";

const jsonError = (status: number, message: string) =>
  NextResponse.json({ error: message }, { status });

export async function getCreatorProfileIdForUser(userId: string): Promise<string | null> {
  const p = await db.creatorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return p?.id ?? null;
}

/** Returns whether the user may read this campaign for dashboard APIs. */
export async function userCanAccessCampaign(
  user: Pick<User, "id" | "role">,
  campaignId: string,
): Promise<boolean> {
  if (user.role === "ADMIN") {
    const c = await db.campaign.findUnique({ where: { id: campaignId }, select: { id: true } });
    return !!c;
  }
  if (user.role === "AGENCY") {
    const agency = await db.agencyAccount.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!agency) return false;
    const c = await db.campaign.findFirst({
      where: { id: campaignId, agencyId: agency.id },
      select: { id: true },
    });
    return !!c;
  }
  if (user.role === "CREATOR") {
    const profileId = await getCreatorProfileIdForUser(user.id);
    if (!profileId) return false;
    const ct = await db.campaignTalent.findFirst({
      where: { campaignId, talentId: profileId },
      select: { id: true },
    });
    return !!ct;
  }
  return false;
}

export async function assertCampaignAccess(
  user: Pick<User, "id" | "role">,
  campaignId: string,
): Promise<NextResponse | null> {
  const ok = await userCanAccessCampaign(user, campaignId);
  if (!ok) return jsonError(403, "Forbidden");
  return null;
}

/** Ensure every id in the list is accessible (prevents IDOR on batched metrics/payments). */
export async function assertCampaignIdsAccess(
  user: Pick<User, "id" | "role">,
  campaignIds: string[],
): Promise<NextResponse | null> {
  for (const id of campaignIds) {
    const err = await assertCampaignAccess(user, id);
    if (err) return err;
  }
  return null;
}
