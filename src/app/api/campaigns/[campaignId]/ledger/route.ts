import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Invoice, Payout } from "@/components/campaigns/types";

export async function GET(
  _req: Request,
  { params }: { params: { campaignId: string } }
) {
  const { campaignId } = params;

  const [dbInvoices, dbPayments] = await Promise.all([
    db.invoice.findMany({
      where: { campaignId },
      include: { talent: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.campaignPayment.findMany({
      where: { campaignId },
      orderBy: { dueDate: "desc" },
    }),
  ]);

  const invoices: Invoice[] = dbInvoices.map((inv) => ({
    id: inv.id,
    campaignId: campaignId,
    invoiceNumber: inv.invoiceNumber,
    campaign: campaignId,
    amount: inv.amount / 100,
    status: mapInvoiceStatus(inv.status),
    dueDate: inv.dueDate ?? inv.createdAt,
  }));

  const payouts: Payout[] = dbPayments.map((p) => ({
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
