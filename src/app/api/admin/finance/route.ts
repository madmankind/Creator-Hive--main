import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const [invoices, bookings, walletTxns] = await Promise.all([
    db.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        campaign: { select: { title: true } },
        talent: { select: { name: true } },
      },
    }),
    db.bookingRequest.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, budgetRange: true, bookingType: true, status: true,
        createdAt: true, contactEmail: true,
        user: { select: { name: true, email: true } },
      },
    }),
    db.walletTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true, amount: true, currency: true, type: true,
        direction: true, status: true, createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  // Aggregate invoice stats
  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const paid          = invoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const pending       = invoices.filter(i => i.status === "PENDING").reduce((s, i) => s + i.amount, 0);
  const overdue       = invoices.filter(i => i.status === "OVERDUE").reduce((s, i) => s + i.amount, 0);

  // Wallet aggregates — SUCCEEDED is the completed status
  const grossIn  = walletTxns.filter(t => t.direction === "CREDIT" && t.status === "SUCCEEDED").reduce((s, t) => s + t.amount, 0);
  const grossOut = walletTxns.filter(t => t.direction === "DEBIT"  && t.status === "SUCCEEDED").reduce((s, t) => s + t.amount, 0);
  const netRevenue = grossIn - grossOut;

  // Monthly breakdown (last 6 months)
  const now = new Date();
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString("en", { month: "short", year: "2-digit" });
    const monthInvoices = invoices.filter(inv => {
      const c = new Date(inv.createdAt);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    });
    const gross = monthInvoices.reduce((s, inv) => s + inv.amount, 0);
    const paidM = monthInvoices.filter(inv => inv.status === "PAID").reduce((s, inv) => s + inv.amount, 0);
    return { label, gross, paid: paidM, invoiceCount: monthInvoices.length };
  });

  // Normalise invoices for frontend (title -> name alias)
  const normInvoices = invoices.slice(0, 100).map(inv => ({
    ...inv,
    campaign: inv.campaign ? { name: inv.campaign.title } : null,
  }));

  return NextResponse.json({
    summary: { totalInvoiced, paid, pending, overdue, grossIn, grossOut, netRevenue },
    monthly,
    invoices: normInvoices,
    walletTxns: walletTxns.slice(0, 100),
    bookings: bookings.slice(0, 100),
  });
}
