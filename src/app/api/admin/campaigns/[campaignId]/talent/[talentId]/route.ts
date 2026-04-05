import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { createNotification } from "@/lib/notifications";

type Ctx = { params: Promise<{ campaignId: string; talentId: string }> };

/** PATCH — replace this talent with another, or update status/notes */
export async function PATCH(req: Request, { params }: Ctx) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { campaignId, talentId } = await params;
  const { action, replacementTalentId, reason, status, notes, rate } = await req.json().catch(() => ({}));

  if (action === "replace") {
    if (!replacementTalentId) return NextResponse.json({ error: "replacementTalentId required" }, { status: 400 });
    const replacement = await db.creatorProfile.findUnique({ where: { id: replacementTalentId } });
    if (!replacement) return NextResponse.json({ error: "Replacement talent not found" }, { status: 404 });

    // Cancel the old assignment
    await db.$executeRawUnsafe(`UPDATE creatorhive.campaign_talents SET status = 'CANCELLED', "availabilityNote" = $3, "updatedAt" = NOW() WHERE "campaignId" = $1 AND "talentId" = $2`, campaignId, talentId, reason ?? "Talent unavailable");

    // Add replacement
    await db.campaignTalent.upsert({
      where: { campaignId_talentId: { campaignId, talentId: replacementTalentId } },
      create: { campaignId, talentId: replacementTalentId, status: "ASSIGNED", notes: `Replaces talent ${talentId}` },
      update: { status: "ASSIGNED" },
    });

    // Notify the original talent of removal
    const removedTalent = await db.creatorProfile.findUnique({ where: { id: talentId } });
    if (removedTalent?.userId) {
      await createNotification({ userId: removedTalent.userId, type: "talent_removed", campaignId,
        title: "Campaign assignment ended", message: `Your assignment to this campaign has been concluded. ${reason ? `Reason: ${reason}` : ""}` });
    }

    // Notify replacement talent of assignment
    if (replacement.userId) {
      await createNotification({ userId: replacement.userId, type: "talent_added", campaignId,
        title: "You've been added to a campaign", message: "You've been assigned to a new campaign. Check your dashboard.", data: { campaignId } });
    }

    // Notify client of replacement
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { agency: { include: { user: { select: { id: true, email: true, name: true } } } } },
    });
    if (campaign?.agency?.user?.id) {
      await createNotification({
        userId: campaign.agency.user.id, type: "talent_replaced", campaignId,
        title: "A talent in your campaign has been updated",
        message: `${removedTalent?.name ?? "A creator"} has been replaced by ${replacement.name} in your campaign. Please review.`,
        data: { removedTalentId: talentId, removedTalentName: removedTalent?.name, replacementTalentId, replacementName: replacement.name, replacementAvatar: replacement.avatarUrl, reason },
      });
    }

    return NextResponse.json({ ok: true, action: "replaced", replacedBy: replacement.name });
  }

  // Simple update — status, notes, rate
  await db.campaignTalent.update({
    where: { campaignId_talentId: { campaignId, talentId } },
    data: {
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(rate !== undefined ? { rate } : {}),
    },
  });
  return NextResponse.json({ ok: true, action: "updated" });
}

/** DELETE — remove talent from campaign */
export async function DELETE(req: Request, { params }: Ctx) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { campaignId, talentId } = await params;
  const { reason } = await req.json().catch(() => ({}));

  await db.$executeRawUnsafe(`UPDATE creatorhive.campaign_talents SET status = 'CANCELLED', "availabilityNote" = $3, "updatedAt" = NOW() WHERE "campaignId" = $1 AND "talentId" = $2`, campaignId, talentId, reason ?? "Removed by admin");

  const talent = await db.creatorProfile.findUnique({ where: { id: talentId } });
  if (talent?.userId) {
    await createNotification({ userId: talent.userId, type: "talent_removed", campaignId,
      title: "Campaign assignment ended", message: `Your assignment to this campaign has been concluded. ${reason ? `Reason: ${reason}` : ""}` });
  }

  return NextResponse.json({ ok: true, action: "removed" });
}
