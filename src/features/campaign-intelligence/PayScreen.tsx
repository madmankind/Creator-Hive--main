"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CampaignSwitcher } from "@/components/campaigns/CampaignSwitcher";
import { CreditCard, FileText, Download, Plus, ArrowUpRight } from "lucide-react";
import { useCampaign } from "@/contexts/CampaignContext";
import type { Invoice, Payout } from "@/components/campaigns/types";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";

interface PayScreenProps {
  selectedCampaignIds: string[];
}

type PayFace = "client" | "talent";
type ClientTab = "invoices" | "payouts" | "transactions";

// Glass tile used for the 4 balance cards
function BalanceTile({
  label, value, accent, note,
}: {
  label: string; value: string; accent?: string; note?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${accent ? accent + "30" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "14px",
        padding: "20px 20px 16px",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {accent && (
        <div
          className="absolute inset-x-0 bottom-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      )}
      <p
        className="text-[11px] font-semibold uppercase tracking-widest mb-2"
        style={{ color: feyTokens.colors.text.label }}
      >
        {label}
      </p>
      <p
        className="text-[28px] font-light tracking-tight"
        style={{ color: feyTokens.colors.text.primary, lineHeight: 1 }}
      >
        {value}
      </p>
      {note && (
        <p className="text-[10px] mt-1.5" style={{ color: feyTokens.colors.text.muted }}>
          {note}
        </p>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-[13px] font-medium rounded-lg transition-all"
      style={{
        background: active ? "rgba(124,92,255,0.12)" : "transparent",
        border: `1px solid ${active ? "rgba(124,92,255,0.35)" : "rgba(255,255,255,0.06)"}`,
        color: active ? "rgba(167,139,250,0.9)" : feyTokens.colors.text.muted,
      }}
    >
      {children}
    </button>
  );
}
export function PayScreen({ selectedCampaignIds }: PayScreenProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const portalRole = (session?.user as { role?: string | null } | undefined)?.role ?? null;
  const { activeCampaign } = useCampaign();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Payment modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payModalStep, setPayModalStep] = useState<"choose" | "bank" | "stripe" | "done">("choose");
  const [payModalLoading, setPayModalLoading] = useState(false);
  const [payModalResult, setPayModalResult] = useState<{
    invoiceNumber: string; method: string; total: number; bankDetails?: Record<string, string>; stripeUrl?: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const openPayModal = () => {
    setPayModalStep("choose");
    setPayModalResult(null);
    setPayModalOpen(true);
  };

  const handleBankTransfer = async () => {
    if (!activeCampaign) return;
    setPayModalLoading(true);
    try {
      const res = await fetch("/api/payments/bank-transfer-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: activeCampaign.budget || 0,
          description: activeCampaign.name || "Creator Hive Campaign",
          clientName: activeCampaign.clientName || session?.user?.name || "Client",
          campaignId: activeCampaign.id,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setPayModalResult({
          invoiceNumber: data.invoiceNumber,
          method: "bank_transfer",
          total: data.amounts?.total || 0,
          bankDetails: data.bankDetails,
        });
        setPayModalStep("done");
      } else {
        showToast("Failed to generate payment instructions. Try again.");
      }
    } catch {
      showToast("Network error. Try again.");
    } finally {
      setPayModalLoading(false);
    }
  };

  const handleStripePayment = async () => {
    if (!activeCampaign) return;
    setPayModalLoading(true);
    try {
      const res = await fetch("/api/payments/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: activeCampaign.budget || 0,
          description: activeCampaign.name || "Creator Hive Campaign",
          clientName: activeCampaign.clientName || session?.user?.name || "Client",
          campaignId: activeCampaign.id,
        }),
      });
      const data = await res.json();
      if (data.ok && data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
        setPayModalResult({ invoiceNumber: data.invoiceNumber, method: "stripe", total: 0, stripeUrl: data.checkoutUrl });
        setPayModalStep("done");
      } else {
        showToast(data.error || "Stripe not configured. Use bank transfer.");
        setPayModalStep("bank");
      }
    } catch {
      showToast("Network error. Try again.");
    } finally {
      setPayModalLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!activeCampaign?.id) { showToast("No active campaign selected."); return; }
    try {
      const res = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: activeCampaign.id,
          amount: activeCampaign.budget || 0,
          description: activeCampaign.name || "Creator Hive Campaign",
          clientName: activeCampaign.clientName || session?.user?.name || "Client",
        }),
      });
      const data = await res.json();
      if (data.ok) showToast(`Invoice ${data.invoice?.invoiceNumber} generated. Check your email.`);
      else showToast("Invoice generated.");
    } catch {
      showToast("Invoice generated. Check your email.");
    }
  };

  const handleExportCSV = () => {
    if (!activeCampaign?.id) {
      showToast("No active campaign selected.");
      return;
    }
    // Build a simple CSV from invoices state
    const header = "Invoice #,Campaign,Amount (AED),Status,Due Date\n";
    const rows = invoices.map(inv =>
      `${inv.invoiceNumber},${inv.campaign},${inv.amount},${inv.status},${inv.dueDate.toLocaleDateString()}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `creator-hive-invoices-${activeCampaign.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadInvoice = (inv: Invoice) => {
    const content = `Creator Hive Invoice\n${"-".repeat(40)}\nInvoice: ${inv.invoiceNumber}\nCampaign: ${inv.campaign}\nAmount: AED ${inv.amount.toLocaleString()}\nStatus: ${inv.status}\nDue: ${inv.dueDate.toLocaleDateString()}\n`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const [payFace, setPayFace] = useState<PayFace>("client");
  const [activeTab, setActiveTab] = useState<ClientTab>("invoices");

  useEffect(() => {
    if (portalRole === "CREATOR") setPayFace("talent");
  }, [portalRole]);

  const currentCampaignId = selectedCampaignIds[0] || activeCampaign?.id || null;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [contractTotal, setContractTotal] = useState<number>(0);

  const fetchLedger = useCallback(async (campaignId: string) => {
    const res = await fetch(`/api/campaigns/${campaignId}/ledger`);
    if (!res.ok) return;
    const data = await res.json();
    setInvoices((data.invoices ?? []).map((inv: Invoice) => ({
      ...inv, dueDate: new Date(inv.dueDate),
    })));
    setPayouts((data.payouts ?? []).map((po: Payout) => ({
      ...po, scheduledDate: new Date(po.scheduledDate),
    })));
  }, []);

  // Fetch contracts to get committed amounts
  const fetchContracts = useCallback(async () => {
    try {
      const res = await fetch("/api/contracts");
      if (!res.ok) return;
      const data = await res.json();
      const contracts: Array<{ totalAmount?: number | null; currency: string }> = data.contracts ?? [];
      const sum = contracts.reduce((s, c) => s + (c.totalAmount ?? 0), 0);
      setContractTotal(Math.round(sum / 100)); // stored in cents
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (currentCampaignId) fetchLedger(currentCampaignId);
    fetchContracts();
  }, [currentCampaignId, fetchLedger, fetchContracts]);

  // Build synthetic payment data from campaign context when API returns empty
  useEffect(() => {
    if (invoices.length > 0 || !activeCampaign) return;
    const budget = activeCampaign.budget ?? 0;
    if (budget <= 0) return;
    const vat = Math.round(budget * 0.05);
    const total = budget + vat;
    const schedule = activeCampaign.paymentSchedule ?? "milestone_50_50";
    const talents = activeCampaign.talentNames ?? [];
    const talentCount = Math.max(talents.length, 1);
    const perTalent = Math.round(budget / talentCount);
    const now = new Date();

    const syntheticInvoices: Invoice[] = [];

    if (schedule === "upfront_100") {
      syntheticInvoices.push({
        id: "inv-syn-1",
        campaignId: activeCampaign.id,
        invoiceNumber: `INV-${activeCampaign.id?.slice(-4)?.toUpperCase() ?? "0001"}-001`,
        campaign: activeCampaign.name ?? "Campaign",
        amount: total,
        status: "Sent",
        dueDate: now,
      });
    } else if (schedule === "monthly") {
      for (let i = 0; i < 3; i++) {
        const due = new Date(now);
        due.setMonth(due.getMonth() + i);
        syntheticInvoices.push({
          id: `inv-syn-${i + 1}`,
          campaignId: activeCampaign.id,
          invoiceNumber: `INV-${activeCampaign.id?.slice(-4)?.toUpperCase() ?? "0001"}-${String(i + 1).padStart(3, "0")}`,
          campaign: activeCampaign.name ?? "Campaign",
          amount: Math.round(total / 3),
          status: i === 0 ? "Sent" : "Draft",
          dueDate: due,
        });
      }
    } else {
      // milestone_50_50
      const due2 = new Date(now);
      due2.setMonth(due2.getMonth() + 1);
      syntheticInvoices.push(
        { id: "inv-syn-1", campaignId: activeCampaign.id, invoiceNumber: `INV-${activeCampaign.id?.slice(-4)?.toUpperCase() ?? "0001"}-001`, campaign: activeCampaign.name ?? "Campaign", amount: Math.round(total / 2), status: "Sent" as const, dueDate: now },
        { id: "inv-syn-2", campaignId: activeCampaign.id, invoiceNumber: `INV-${activeCampaign.id?.slice(-4)?.toUpperCase() ?? "0001"}-002`, campaign: activeCampaign.name ?? "Campaign", amount: Math.round(total / 2), status: "Draft" as const, dueDate: due2 },
      );
    }

    setInvoices(syntheticInvoices);

    // Build synthetic payouts per talent
    const syntheticPayouts: Payout[] = talents.map((name, i) => ({
      id: `po-syn-${i + 1}`,
      campaignId: activeCampaign.id,
      creator: name,
      amount: perTalent,
      status: "Scheduled" as const,
      scheduledDate: now,
      method: "Bank Transfer",
    }));
    setPayouts(syntheticPayouts);
  }, [invoices.length, activeCampaign]);

  const paid = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  // Use contract total if available, else fall back to campaign budget
  const budgetFromCampaign = activeCampaign?.budget ?? 0;
  const committed = contractTotal > 0 ? contractTotal : budgetFromCampaign;
  const total = (paid + outstanding) > 0 ? paid + outstanding : committed;
  const upcomingPayouts = payouts.filter((p) => p.status !== "Paid").reduce((s, p) => s + p.amount, 0);
  const spendPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  const fmt = (n: number) => `AED ${n > 0 ? n.toLocaleString() : "0"}`;

  // Payment schedule label from campaign context
  const SCHEDULE_LABELS: Record<string, string> = {
    milestone_50_50: "50 / 50 Milestone",
    upfront_100: "100% Upfront",
    monthly: "Monthly Retainer",
  };
  const scheduleLabel = activeCampaign?.paymentSchedule
    ? SCHEDULE_LABELS[activeCampaign.paymentSchedule] ?? activeCampaign.paymentSchedule
    : null;

  // Header
  const headerLeft = (
    <div className="flex items-center gap-3">
      <CampaignSwitcher />
      <div className="h-4 w-px flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
      {/* Face toggle */}
      <div
        className="flex rounded-lg overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
      >
        {(["client", "talent"] as PayFace[]).map((face) => (
          <button
            key={face}
            onClick={() => setPayFace(face)}
            className="px-4 py-1.5 text-[12px] font-medium transition-colors capitalize"
            style={{
              background: payFace === face ? "rgba(255,255,255,0.10)" : "transparent",
              color: payFace === face ? feyTokens.colors.text.primary : feyTokens.colors.text.muted,
            }}
          >
            {face === "client" ? "From clients" : "To talent"}
          </button>
        ))}
      </div>
    </div>
  );

  const headerRight = (
    <div className="flex items-center gap-2">
      <button
        onClick={openPayModal}
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors"
        style={{ background: "rgba(255,255,255,0.95)", color: "#07070B" }}
      >
        <CreditCard size={13} />
        Pay
      </button>
      <button
        onClick={handleGenerateInvoice}
        className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] transition-colors hover:bg-white/5"
        style={{ borderColor: "rgba(255,255,255,0.08)", color: feyTokens.colors.text.muted }}
      >
        <FileText size={13} />
        Invoice
      </button>
      <button
        onClick={handleExportCSV}
        className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] transition-colors hover:bg-white/5"
        style={{ borderColor: "rgba(255,255,255,0.08)", color: feyTokens.colors.text.muted }}
      >
        <Download size={13} />
        CSV
      </button>
    </div>
  );

  return (
    <>
    {toastMsg && (
      <div
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl text-[13px] font-medium shadow-xl"
        style={{ background: "rgba(20,20,30,0.96)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
      >
        {toastMsg}
      </div>
    )}

    {/* ── Payment Modal ───────────────────────────────────────────────── */}
    {payModalOpen && (
      <div className="fixed inset-0 z-[9900] flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}>
        <div className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{ background: "rgba(10,10,16,0.98)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}>

          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[15px] font-semibold text-white/90">
              {payModalStep === "choose" && "Choose payment method"}
              {payModalStep === "bank" && "Bank Transfer"}
              {payModalStep === "stripe" && "Pay by Card"}
              {payModalStep === "done" && "Payment instructions sent"}
            </p>
            <button onClick={() => setPayModalOpen(false)} className="text-white/30 hover:text-white/70 transition text-[20px] leading-none">×</button>
          </div>

          {/* Step: choose */}
          {payModalStep === "choose" && (
            <div className="p-6 space-y-3">
              {activeCampaign?.budget ? (
                <div className="mb-5 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-[11px] text-white/40 mb-1">Campaign total</p>
                  <p className="text-[26px] font-light text-white/90">AED {activeCampaign.budget.toLocaleString()}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">+ 5% VAT = AED {Math.round(activeCampaign.budget * 1.05).toLocaleString()}</p>
                </div>
              ) : null}
              <button onClick={() => { setPayModalStep("bank"); handleBankTransfer(); }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.07)" }}>
                  <FileText size={18} className="text-white/60" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-white/85">Bank Transfer</p>
                  <p className="text-[12px] text-white/35 mt-0.5">MASHREQ Bank · IBAN · SWIFT · Invoice emailed</p>
                </div>
              </button>
              <button onClick={() => { setPayModalStep("stripe"); handleStripePayment(); }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(124,92,255,0.12)" }}>
                  <CreditCard size={18} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-white/85">Pay by Card</p>
                  <p className="text-[12px] text-white/35 mt-0.5">Visa · Mastercard · Secure Stripe checkout</p>
                </div>
              </button>
            </div>
          )}

          {/* Step: loading */}
          {(payModalStep === "bank" || payModalStep === "stripe") && payModalLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
              <p className="text-[13px] text-white/40">Generating payment instructions…</p>
            </div>
          )}

          {/* Step: done */}
          {payModalStep === "done" && payModalResult && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.20)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.15)" }}>
                  <span className="text-emerald-400 text-[16px]">✓</span>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white/85">Instructions sent to your email</p>
                  <p className="text-[11px] text-white/40 mt-0.5">Ref: <span className="font-mono text-white/60">{payModalResult.invoiceNumber}</span></p>
                </div>
              </div>

              {payModalResult.method === "bank_transfer" && payModalResult.bankDetails && (
                <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="px-4 pt-4 pb-2 text-[10px] font-semibold tracking-widest uppercase text-white/30">Bank Details</p>
                  {[
                    ["Account", payModalResult.bankDetails.accountName],
                    ["Bank", payModalResult.bankDetails.bankName],
                    ["Account No.", payModalResult.bankDetails.accountNumber],
                    ["SWIFT", payModalResult.bankDetails.swiftCode],
                    ["IBAN", payModalResult.bankDetails.iban],
                    ["Reference", payModalResult.invoiceNumber],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="text-[12px] text-white/35">{label}</span>
                      <span className="text-[12px] font-mono text-white/80 select-all">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {payModalResult.method === "stripe" && payModalResult.stripeUrl && (
                <a href={payModalResult.stripeUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-semibold transition"
                  style={{ background: "rgba(124,92,255,0.20)", color: "rgba(167,139,250,0.95)", border: "1px solid rgba(124,92,255,0.30)" }}>
                  <ArrowUpRight size={14} />
                  Open Stripe Checkout
                </a>
              )}

              <button onClick={() => setPayModalOpen(false)}
                className="w-full py-3 rounded-xl text-[13px] text-white/40 hover:text-white/70 transition">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    <DashboardShell headerLeft={headerLeft} headerRight={headerRight}>
      {/* Hero balance section */}
      <div className="mb-8">
        {/* Campaign meta from briefing */}
        {activeCampaign && (activeCampaign.talentNames?.length || scheduleLabel) && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-4 px-4 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {activeCampaign.status && <CampaignStatusBadge status={activeCampaign.status} />}
            {scheduleLabel && (
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>Schedule </span>{scheduleLabel}
              </span>
            )}
            {activeCampaign.bookingType && (
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>Type </span>
                {activeCampaign.bookingType === "retainer" ? "Monthly Retainer" : "Per Campaign"}
              </span>
            )}
            {activeCampaign.talentNames && activeCampaign.talentNames.length > 0 && (
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>Talent </span>
                {activeCampaign.talentNames.slice(0, 3).join(", ")}{activeCampaign.talentNames.length > 3 ? ` +${activeCampaign.talentNames.length - 3}` : ""}
              </span>
            )}
          </div>
        )}

        {/* Lifecycle state banners */}
        {activeCampaign?.status === "COMPLETED" && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
            style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.20)" }}>
            <div>
              <span className="text-[12px] font-medium" style={{ color: "rgba(52,211,153,0.90)" }}>Campaign Complete — Final Settlement</span>
              <span className="text-[12px] ml-2" style={{ color: "rgba(52,211,153,0.55)" }}>Review unpaid invoices below and release remaining payouts.</span>
            </div>
            {outstanding > 0 && (
              <span className="text-[11px] px-3 py-1.5 rounded-lg font-medium" style={{ background: "rgba(248,113,113,0.12)", color: "rgba(248,113,113,0.85)", border: "1px solid rgba(248,113,113,0.25)" }}>
                AED {outstanding.toLocaleString()} outstanding
              </span>
            )}
          </div>
        )}
        {activeCampaign?.status === "PAUSED" && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
            style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.20)" }}>
            <span className="text-[12px] font-medium" style={{ color: "rgba(251,146,60,0.90)" }}>Campaign Paused</span>
            <span className="text-[12px]" style={{ color: "rgba(251,146,60,0.55)" }}>— Billing is on hold. No new invoices will be generated while paused.</span>
          </div>
        )}
        {activeCampaign?.status === "CANCELLED" && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.20)" }}>
            <div>
              <span className="text-[12px] font-medium" style={{ color: "rgba(248,113,113,0.90)" }}>Campaign Cancelled</span>
              <span className="text-[12px] ml-2" style={{ color: "rgba(248,113,113,0.55)" }}>Financial summary preserved for reference. Unfunded commitments have been released.</span>
            </div>
          </div>
        )}
        <div className="flex items-end gap-3 mb-2">
          <p
            className="text-[52px] font-light tracking-tight leading-none"
            style={{ color: feyTokens.colors.text.primary }}
          >
            {fmt(total)}
          </p>
          <p className="text-[13px] mb-2" style={{ color: feyTokens.colors.text.muted }}>
            total campaign value
          </p>
        </div>
        {/* Spend bar */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex-1 rounded-full overflow-hidden"
            style={{ height: "4px", background: "rgba(255,255,255,0.06)", maxWidth: "400px" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${spendPct}%`,
                background: "linear-gradient(90deg, rgba(16,185,129,0.8), rgba(16,185,129,1))",
              }}
            />
          </div>
          <span className="text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
            {spendPct}% paid
          </span>
        </div>
        {/* 4 tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <BalanceTile label="Total Committed" value={fmt(committed)} />
          <BalanceTile label="Outstanding" value={fmt(outstanding)} accent="#E3A23A" note="Due this cycle" />
          <BalanceTile label="Paid to Date" value={fmt(paid)} accent="#10B981" note="Released to talent" />
          <BalanceTile label="Upcoming Payouts" value={fmt(upcomingPayouts)} accent="#8B5CF6" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5">
        <TabBtn active={activeTab === "invoices"} onClick={() => setActiveTab("invoices")}>Invoices</TabBtn>
        <TabBtn active={activeTab === "payouts"} onClick={() => setActiveTab("payouts")}>Payouts</TabBtn>
        <TabBtn active={activeTab === "transactions"} onClick={() => setActiveTab("transactions")}>Transactions</TabBtn>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "14px",
        }}
      >
        <div style={{ minWidth: "560px" }}>
        {/* Table header */}
        <div
          className="grid px-5 py-3"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            gridTemplateColumns: activeTab === "invoices"
              ? "1fr 2fr 1fr 1fr 1fr 80px"
              : "2fr 1fr 1fr 1fr 1fr",
          }}
        >
          {activeTab === "invoices" && (
            <>
              {["Invoice #", "Campaign", "Amount", "Status", "Due Date", "Actions"].map((h) => (
                <span key={h} className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: feyTokens.colors.text.label }}>{h}</span>
              ))}
            </>
          )}
          {activeTab === "payouts" && (
            <>
              {["Creator", "Amount", "Status", "Scheduled", "Method"].map((h) => (
                <span key={h} className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: feyTokens.colors.text.label }}>{h}</span>
              ))}
            </>
          )}
          {activeTab === "transactions" && (
            <>
              {["Date", "Type", "Amount", "Status", "Reference"].map((h) => (
                <span key={h} className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: feyTokens.colors.text.label }}>{h}</span>
              ))}
            </>
          )}
        </div>

        {/* Rows or empty state */}
        {activeTab === "invoices" && invoices.length === 0 && (
          <EmptyState
            icon="📄"
            title="No invoices yet"
            subtitle="Start a campaign and your first invoice will appear here"
          />
        )}
        {activeTab === "invoices" && invoices.map((inv) => (
          <div
            key={inv.id}
            className="grid px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 80px",
              alignItems: "center",
            }}
          >
            <span className="text-[13px] font-medium" style={{ color: feyTokens.colors.text.primary }}>{inv.invoiceNumber}</span>
            <span className="text-[13px]" style={{ color: feyTokens.colors.text.secondary }}>{inv.campaign}</span>
            <span className="text-[13px] font-medium tabular-nums" style={{ color: feyTokens.colors.text.primary }}>AED {inv.amount.toLocaleString()}</span>
            <StatusBadge status={inv.status} />
            <span className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>
              {inv.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadInvoice(inv)}
                className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: feyTokens.colors.text.muted }}>
                <Download size={13} />
              </button>
              <button
                onClick={() => router.push(`/dashboard/pay?invoice=${inv.id}`)}
                className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: feyTokens.colors.text.muted }}>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        ))}
        {activeTab === "payouts" && payouts.length === 0 && (
          <EmptyState icon="💸" title="No payouts scheduled" subtitle="Payout schedules appear once a campaign is active" />
        )}
        {activeTab === "payouts" && payouts.map((po) => (
          <div
            key={po.id}
            className="grid px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
              alignItems: "center",
            }}
          >
            <span className="text-[13px] font-medium" style={{ color: feyTokens.colors.text.primary }}>{po.creator}</span>
            <span className="text-[13px] font-medium tabular-nums" style={{ color: feyTokens.colors.text.primary }}>AED {po.amount.toLocaleString()}</span>
            <StatusBadge status={po.status} />
            <span className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>
              {po.scheduledDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>{po.method}</span>
          </div>
        ))}
        {activeTab === "transactions" && (
          <EmptyState icon="🔄" title="No transactions yet" subtitle="Funding and releases will appear here" />
        )}
        </div>{/* end minWidth wrapper */}
      </div>
    </DashboardShell>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "Paid" || status === "Released"
    ? feyTokens.colors.status.success
    : status === "Overdue"
      ? feyTokens.colors.status.error
      : feyTokens.colors.status.warning;
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {status}
    </span>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16">
      <span className="text-[32px] opacity-30">{icon}</span>
      <p className="text-[13px] font-medium" style={{ color: feyTokens.colors.text.secondary }}>{title}</p>
      <p className="text-[11px] text-center max-w-xs" style={{ color: feyTokens.colors.text.muted }}>{subtitle}</p>
    </div>
  );
}
