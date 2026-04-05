import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { createNotification } from "@/lib/notifications";
import { resend, FROM_EMAIL } from "@/lib/resend";

export async function GET(_req: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { campaignId } = await params;

  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      talents: {
        include: { talent: { select: { id: true, name: true, instagram: true, avatarUrl: true, skills: true, primaryRole: true } } },
      },
      agency: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ campaign });
}

export async function POST(req: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { campaignId } = await params;
  const { talentId, rate, notes } = await req.json().catch(() => ({}));
  if (!talentId) return NextResponse.json({ error: "talentId required" }, { status: 400 });

  const talent = await db.creatorProfile.findUnique({ where: { id: talentId } });
  if (!talent) return NextResponse.json({ error: "Talent not found" }, { status: 404 });

  const ct = await db.campaignTalent.upsert({
    where: { campaignId_talentId: { campaignId, talentId } },
    create: { campaignId, talentId, status: "ASSIGNED", rate: rate ?? null, notes: notes ?? null },
    update: { status: "ASSIGNED", rate: rate ?? null, notes: notes ?? null },
  });

  // Notify the campaign's client
  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: { agency: { include: { user: { select: { id: true, email: true } } } } },
  });
  if (campaign?.agency?.user?.id) {
    await createNotification({
      userId: campaign.agency.user.id,
      type: "talent_added",
      title: "Talent added to your campaign",
      message: `${talent.name} has been added to your campaign by Creator Hive.`,
      campaignId,
      data: { talentId, talentName: talent.name, avatarUrl: talent.avatarUrl },
    });
  }

  // Notify the talent themselves if they have a user account
  if (talent.userId) {
    await createNotification({
      userId: talent.userId,
      type: "talent_added",
      title: "You've been added to a campaign",
      message: `You've been assigned to a new campaign. Check your dashboard for details.`,
      campaignId,
      data: { campaignId },
    });
  }

  return NextResponse.json({ ok: true, campaignTalent: ct });
}
