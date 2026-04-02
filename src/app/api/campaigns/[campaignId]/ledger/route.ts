import { NextResponse } from "next/server";
import { db } from "@/server/db";
import type { Invoice, Payout } from "@/components/campaigns/types";
import { requireUser } from "@/server/authz";
import { assertCampaignAccess } from "@/server/campaignAccess";

type DbInvoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
};

type DbPayment = {
  id: string;
  amount: unknown;
  status: string;
  dueDate: Date;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN", "CREATOR"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const { campaignId } = await params;

  const denied = await assertCampaignAccess(user, campaignId);
  if (denied) return denied;

  const [dbInvoices, dbPayments, dbCampaign] = await Promise.all([
    db.invoice.findMany({
      where: { campaignId },
      include: { talent: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.campaignPayment.findMany({
      where: { campaignId },
      orderBy: { dueDate: "desc" },
    }),
    db.campaign.findUnique({
      where: { id: campaignId },
      select: { title: true },
    }),
  ]);

  const campaignName = dbCampaign?.title ?? campaignId;

  const invoices: Invoice[] = dbInvoices.map((inv: DbInvoice) => ({
    id: inv.id,
    campaignId: campaignId,
    invoiceNumber: inv.invoiceNumber,
    campaign: campaignName,
    amount: inv.amount / 100,
    status: mapInvoiceStatus(inv.status),
    dueDate: inv.dueDate ?? inv.createdAt,
  }));

  const payouts: Payout[] = dbPayments.map((p: DbPayment) => ({
    id: p.id,
    campaignId: campaignId,
    creator: "—",
    amount: Number(p.amount),
    status: mapPaymentStatus(p.status),
    scheduledDate: p.dueDate,
    method: "Bank Transfer",
  }));

  return NextResponse.json({ invoices, payouts, earnings: [], contracts: [] });
}

function mapInvoiceStatus(s: string): Invoice["status"] {
  if (s === "PAID") return "Paid";
  if (s === "OVERDUE") return "Overdue";
  if (s === "SENT") return "Sent";
  return "Draft";
}

function mapPaymentStatus(s: string): Payout["status"] {
  if (s === "PAID") return "Paid";
  if (s === "PROCESSING") return "Processing";
  return "Scheduled";
}
