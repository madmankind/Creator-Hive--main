"use client";

import { useCallback, useEffect, useState } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CreditCard, FileText, Download, Plus, ArrowUpRight } from "lucide-react";
import { useCampaign } from "@/contexts/CampaignContext";
import type { Invoice, Payout } from "@/components/campaigns/types";

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
        className="text-[10px] font-semibold uppercase tracking-widest mb-2"
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
      className="px-4 py-2 text-[12px] font-medium rounded-lg transition-all"
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
  const { activeCampaign } = useCampaign();
  const [payFace, setPayFace] = useState<PayFace>("client");
  const [activeTab, setActiveTab] = useState<ClientTab>("invoices");

  const currentCampaignId = selectedCampaignIds[0] || activeCampaign?.id || null;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);

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

  useEffect(() => {
    if (currentCampaignId) fetchLedger(currentCampaignId);
  }, [currentCampaignId, fetchLedger]);

  const paid = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const total = paid + outstanding;
  const upcomingPayouts = payouts.filter((p) => p.status !== "Paid").reduce((s, p) => s + p.amount, 0);
  const spendPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  const fmt = (n: number) => `AED ${n > 0 ? n.toLocaleString() : "0"}`;

  // Header
  const headerLeft = (
    <div className="flex items-center gap-3">
      {/* Face toggle */}
      <div
        className="flex rounded-lg overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
      >
        {(["client", "talent"] as PayFace[]).map((face) => (
          <button
            key={face}
            onClick={() => setPayFace(face)}
            className="px-4 py-1.5 text-[11px] font-medium transition-colors capitalize"
            style={{
              background: payFace === face ? "rgba(255,255,255,0.10)" : "transparent",
              color: payFace === face ? feyTokens.colors.text.primary : feyTokens.colors.text.muted,
            }}
          >
            {face === "client" ? "Client Pay" : "Talent Pay"}
          </button>
        ))}
      </div>
      <span className="text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
        {activeCampaign?.name || "All campaigns"}
      </span>
    </div>
  );

  const headerRight = (
    <div className="flex items-center gap-2">
      <button
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[11px] font-semibold transition-colors"
        style={{
          background: "rgba(255,255,255,0.95)",
          color: "#07070B",
        }}
      >
        <CreditCard size={13} />
        Collect Payment
      </button>
      <button
        className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] transition-colors hover:bg-white/5"
        style={{ borderColor: "rgba(255,255,255,0.08)", color: feyTokens.colors.text.muted }}
      >
        <FileText size={13} />
        Invoice
      </button>
      <button
        className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] transition-colors hover:bg-white/5"
        style={{ borderColor: "rgba(255,255,255,0.08)", color: feyTokens.colors.text.muted }}
      >
        <Download size={13} />
        CSV
      </button>
    </div>
  );

  return (
    <DashboardShell headerLeft={headerLeft} headerRight={headerRight}>
      {/* Hero balance section */}
      <div className="mb-8">
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
          <BalanceTile label="Total Spend" value={fmt(total)} />
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
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
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
                <span key={h} className="text-[9px] font-semibold uppercase tracking-widest"
                  style={{ color: feyTokens.colors.text.label }}>{h}</span>
              ))}
            </>
          )}
          {activeTab === "payouts" && (
            <>
              {["Creator", "Amount", "Status", "Scheduled", "Method"].map((h) => (
                <span key={h} className="text-[9px] font-semibold uppercase tracking-widest"
                  style={{ color: feyTokens.colors.text.label }}>{h}</span>
              ))}
            </>
          )}
          {activeTab === "transactions" && (
            <>
              {["Date", "Type", "Amount", "Status", "Reference"].map((h) => (
                <span key={h} className="text-[9px] font-semibold uppercase tracking-widest"
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
            <span className="text-[12px] font-medium" style={{ color: feyTokens.colors.text.primary }}>{inv.invoiceNumber}</span>
            <span className="text-[12px]" style={{ color: feyTokens.colors.text.secondary }}>{inv.campaign}</span>
            <span className="text-[12px] font-medium tabular-nums" style={{ color: feyTokens.colors.text.primary }}>AED {inv.amount.toLocaleString()}</span>
            <StatusBadge status={inv.status} />
            <span className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>
              {inv.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: feyTokens.colors.text.muted }}>
                <Download size={13} />
              </button>
              <button className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: feyTokens.colors.text.muted }}>
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
            <span className="text-[12px] font-medium" style={{ color: feyTokens.colors.text.primary }}>{po.creator}</span>
            <span className="text-[12px] font-medium tabular-nums" style={{ color: feyTokens.colors.text.primary }}>AED {po.amount.toLocaleString()}</span>
            <StatusBadge status={po.status} />
            <span className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>
              {po.scheduledDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>{po.method}</span>
          </div>
        ))}
        {activeTab === "transactions" && (
          <EmptyState icon="🔄" title="No transactions yet" subtitle="Funding and releases will appear here" />
        )}
      </div>
    </DashboardShell>
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
