import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { assertCampaignAccess } from "@/server/campaignAccess";

const campaignInclude = {
  talents: {
    include: {
      talent: {
        select: {
          id: true,
          name: true,
          instagram: true,
          skills: true,
          avatarUrl: true,
          hourlyRate: true,
          dayRate: true,
        },
      },
    },
  },
  metrics: {
    orderBy: { date: "desc" as const },
    take: 90,
  },
  payments: {
    orderBy: { dueDate: "asc" as const },
  },
  invites: {
    include: {
      creator: {
        select: { id: true, name: true, instagram: true, avatarUrl: true },
      },
    },
  },
  invoices: {
    select: {
      id: true,
      invoiceNumber: true,
      amount: true,
      status: true,
      createdAt: true,
      paidAt: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
  campaignBrief: {
    select: { sentAt: true },
  },
} as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const { campaignId } = await params;

  const denied = await assertCampaignAccess(user, campaignId);
  if (denied) return denied;

  const campaign = await db.campaign.findFirst({
    where: { id: campaignId },
    include: campaignInclude,
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const { campaignId } = await params;

  const agency = user.role === "ADMIN" ? null : await getOrCreateAgency(user);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const campaign = await db.campaign.findFirst({
    where: {
      id: campaignId,
      ...(agency ? { agencyId: agency.id } : {}),
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const updated = await db.campaign.update({
    where: { id: campaignId },
    data: {
      ...(body.title ? { title: String(body.title) } : {}),
      ...(body.status ? { status: body.status as never } : {}),
      ...(body.budget !== undefined ? { budget: Number(body.budget) } : {}),
      ...(body.startDate ? { startDate: new Date(String(body.startDate)) } : {}),
      ...(body.dueDate ? { dueDate: new Date(String(body.dueDate)) } : {}),
    },
  });

  return NextResponse.json({ campaign: updated });
}

export async function DELETE(
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
    select: { id: true, title: true, status: true, startDate: true, dueDate: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Deletion window:
  // - allowed: campaigns that have not started yet
  // - allowed: campaigns that have ended (completed/cancelled/past due date)
  // - blocked: anything currently active/in flight
  const now = new Date();
  const PRE_START_STATUSES = new Set(["DRAFT", "PROVISIONAL", "CONFIRMED_BRIEF_PENDING", "BRIEF_SENT"]);
  const hasStarted = campaign.startDate ? campaign.startDate <= now : false;
  const hasEnded =
    campaign.status === "COMPLETED" ||
    campaign.status === "CANCELLED" ||
    (campaign.dueDate ? campaign.dueDate < now : false);
  const isNotStarted = PRE_START_STATUSES.has(campaign.status) && !hasStarted;
  const isTimingEligible = isNotStarted || hasEnded;

  // Financial/workflow guardrails.
  const [
    activeTalentCount,
    assetCount,
    duePaymentCount,
    openInvoiceCount,
    signedContractCount,
  ] = await Promise.all([
    db.campaignTalent.count({
      where: {
        campaignId,
        status: { in: ["ASSIGNED", "IN_PROGRESS"] },
      },
    }),
    db.campaignFile.count({ where: { campaignId } }),
    db.campaignPayment.count({
      where: {
        campaignId,
        status: { in: ["COMMITTED", "INVOICED"] },
      },
    }),
    db.invoice.count({
      where: {
        campaignId,
        status: { in: ["PENDING", "SENT", "OVERDUE"] },
      },
    }),
    db.contract.count({
      where: {
        campaignId,
        status: { in: ["AGENCY_SIGNED", "FULLY_SIGNED"] },
      },
    }),
  ]);

  const reasons: string[] = [];
  if (!isTimingEligible) reasons.push(`campaign has already started and has not ended (${campaign.status})`);
  if (activeTalentCount > 0) reasons.push("active talent assignments exist");
  if (assetCount > 0) reasons.push("campaign assets/files exist");
  if (duePaymentCount > 0) reasons.push("talent payments are still due");
  if (openInvoiceCount > 0) reasons.push("open invoices are pending");
  if (signedContractCount > 0) reasons.push("signed contracts exist");

  if (reasons.length > 0) {
    return NextResponse.json(
      {
        error: "Campaign cannot be deleted while active payment or workflow records exist.",
        reasons,
      },
      { status: 409 }
    );
  }

  await db.campaign.delete({ where: { id: campaignId } });
  return NextResponse.json({ ok: true, deletedCampaignId: campaignId, deletedCampaignTitle: campaign.title });
}
