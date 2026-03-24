import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { assertCampaignAccess } from "@/server/campaignAccess";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const { campaignId } = await params;

  const denied = await assertCampaignAccess(user, campaignId);
  if (denied) return denied;

  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      talents: { select: { talentId: true }, take: 1 },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const talentId = campaign.talents[0]?.talentId;
  if (!talentId) {
    return NextResponse.json({ error: "No talent assigned to campaign" }, { status: 400 });
  }

  const invoice = await db.invoice.create({
    data: {
      campaignId,
      talentId,
      invoiceNumber: `INV-${Date.now()}`,
      amount: campaign.budget ?? 0,
      status: "PENDING",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ ok: true, invoice });
}
