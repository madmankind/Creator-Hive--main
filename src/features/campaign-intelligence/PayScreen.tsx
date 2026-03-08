"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { feyTokens } from "@/lib/fey-design-tokens";
import { PillSegment } from "@/components/campaigns/primitives/PillSegment";
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";
import { MetricTile } from "@/components/campaigns/primitives/MetricTile";
import { Download, FileText, CreditCard, Info } from "lucide-react";
import { PaymentMethodsPanel } from "@/components/campaigns/PaymentMethodsPanel";
import { BottomDock } from "@/components/nav/BottomDock";
import { useCampaign } from "@/contexts/CampaignContext";
import type { Invoice, Payout, TalentContract, TalentEarning } from "@/components/campaigns/types";

interface PayScreenProps {
  selectedCampaignIds: string[];
}

type PayFace = "client" | "talent";
type ClientTab = "invoices" | "payouts" | "transactions";
type TalentTab = "earnings" | "payouts" | "contracts";

export function PayScreen({ selectedCampaignIds }: PayScreenProps) {
  const router = useRouter();
  const { activeCampaign } = useCampaign();
  const [payFace, setPayFace] = useState<PayFace>("client");
  const [activeTab, setActiveTab] = useState<ClientTab | TalentTab>("invoices");
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const currentCampaignId = selectedCampaignIds[0] || activeCampaign?.id || null;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [earnings] = useState<TalentEarning[]>([]);
  const [contracts] = useState<TalentContract[]>([]);

  const fetchLedger = useCallback(async (campaignId: string) => {
    const res = await fetch(`/api/campaigns/${campaignId}/ledger`);
    if (!res.ok) return;
    const data = await res.json();
    setInvoices(
      (data.invoices ?? []).map((inv: Invoice) => ({
        ...inv,
        dueDate: new Date(inv.dueDate),
      }))
    );
    setPayouts(
      (data.payouts ?? []).map((po: Payout) => ({
        ...po,
        scheduledDate: new Date(po.scheduledDate),
      }))
    );
  }, []);

  useEffect(() => {
    if (currentCampaignId) fetchLedger(currentCampaignId);
  }, [currentCampaignId, fetchLedger]);

  useEffect(() => {
    if (payFace === "client" && (activeTab === "earnings" || activeTab === "contracts")) {
      setActiveTab("invoices");
    }
    if (payFace === "talent" && (activeTab === "invoices" || activeTab === "transactions")) {
      setActiveTab("earnings");
    }
  }, [payFace, activeTab]);

  const clientTotals = (() => {
    const paid = invoices.filter((inv) => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0);
    const outstanding = invoices
      .filter((inv) => inv.status === "Sent" || inv.status === "Overdue" || inv.status === "Draft")
      .reduce((sum, inv) => sum + inv.amount, 0);
    const upcomingPayouts = payouts
      .filter((po) => po.status !== "Paid")
      .reduce((sum, po) => sum + po.amount, 0);
    return {
      totalSpend: `AED ${(paid + outstanding).toLocaleString()}`,
      outstanding: `AED ${outstanding.toLocaleString()}`,
      paidToDate: `AED ${paid.toLocaleString()}`,
      upcomingPayouts: `AED ${upcomingPayouts.toLocaleString()}`,
    };
  })();

  const talentTotals = (() => {
    const total = earnings.reduce((sum, earn) => sum + earn.amount, 0);
    const pending = earnings.filter((e) => e.status !== "Released").reduce((sum, e) => sum + e.amount, 0);
    const scheduled = payouts.filter((po) => po.status === "Scheduled").reduce((sum, po) => sum + po.amount, 0);
    const paidOut = payouts.filter((po) => po.status === "Paid").reduce((sum, po) => sum + po.amount, 0);
    return {
      earnings: `AED ${total.toLocaleString()}`,
      pending: `AED ${pending.toLocaleString()}`,
      scheduled: `AED ${scheduled.toLocaleString()}`,
      paidOut: `AED ${paidOut.toLocaleString()}`,
    };
  })();


  return (
    <div className="min-h-screen" style={{ color: feyTokens.colors.text.primary }}>
      {/* Header Row */}
      <div
        className="sticky top-0 z-30 border-b px-6 py-4"
        style={{
          background: `${feyTokens.colors.base.dark}EE`,
          backdropFilter: "blur(20px)",
          borderColor: feyTokens.borders.default,
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left: Campaign Display */}
          <div className="flex items-center gap-4">
            <div
              className="rounded-lg border px-4 py-2 text-xs"
              style={{
                borderColor: feyTokens.borders.default,
                background: feyTokens.glass.panel.background,
                color: feyTokens.colors.text.secondary,
                backdropFilter: "blur(10px)",
              }}
            >
              {activeCampaign?.name || "All campaigns"}
            </div>
          </div>

          {/* Center: Actions */}
          <div className="flex items-center gap-2">
            {payFace === "client" ? (
              <>
                <button
                  onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors hover:bg-white/10"
                  style={{
                    borderColor: feyTokens.borders.default,
                    background: feyTokens.glass.panel.background,
                    color: feyTokens.colors.text.secondary,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Collect Payment</span>
                </button>
                <button
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors hover:bg-white/10"
                  style={{
                    borderColor: feyTokens.borders.default,
                    background: feyTokens.glass.panel.background,
                    color: feyTokens.colors.text.secondary,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Generate Invoice</span>
                </button>
                <button
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors hover:bg-white/10"
                  style={{
                    borderColor: feyTokens.borders.default,
                    background: feyTokens.glass.panel.background,
                    color: feyTokens.colors.text.secondary,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>
              </>
            ) : (
              <button
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors hover:bg-white/10"
                style={{
                  borderColor: feyTokens.borders.default,
                  background: feyTokens.glass.panel.background,
                  color: feyTokens.colors.text.secondary,
                  backdropFilter: "blur(10px)",
                }}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Payout method</span>
              </button>
            )}
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg border text-white/50"
              style={{ borderColor: feyTokens.borders.default }}
              title="Client vs Talent payouts toggle datasets; escrow-backed releases."
            >
              <Info className="h-4 w-4" />
            </span>
          </div>

        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="px-6 py-6 space-y-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)", paddingBottom: "calc(88px + 16px)" }}>
        {/* Face toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PillSegment
            options={[
              { value: "client", label: "Client Pay" },
              { value: "talent", label: "Talent Pay" },
            ]}
            value={payFace}
            onChange={(v: string) => setPayFace(v as PayFace)}
            size="sm"
          />
          <div className="text-xs" style={{ color: feyTokens.colors.text.muted }}>
            Milestones drive releases; no hidden state.
          </div>
        </div>

        {/* KPI Tiles */}
        {payFace === "client" ? (
          <div className="mb-2 grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricTile label="Total Spend" value={clientTotals.totalSpend} />
            <MetricTile label="Outstanding" value={clientTotals.outstanding} />
            <MetricTile label="Paid to Date" value={clientTotals.paidToDate} />
            <MetricTile label="Upcoming Payouts" value={clientTotals.upcomingPayouts} />
          </div>
        ) : (
          <div className="mb-2 grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricTile label="Earnings to Date" value={talentTotals.earnings} />
            <MetricTile label="Pending" value={talentTotals.pending} />
            <MetricTile label="Scheduled" value={talentTotals.scheduled} />
            <MetricTile label="Paid Out" value={talentTotals.paidOut} />
          </div>
        )}

        {payFace === "talent" && (
          <FeySurface variant="panel" mesh={true} meshVariant="panel" padding="md" className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: feyTokens.colors.text.label }}>
                Payout method
              </div>
              <div className="text-sm" style={{ color: feyTokens.colors.text.secondary }}>
                Bank transfer connected
              </div>
            </div>
            <button
              className="rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/10"
              style={{ borderColor: feyTokens.borders.default, color: feyTokens.colors.text.primary }}
            >
              Update
            </button>
          </FeySurface>
        )}

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-2">
          {(payFace === "client"
            ? [
                { id: "invoices", label: "Invoices" },
                { id: "payouts", label: "Payouts" },
                { id: "transactions", label: "Transactions" },
              ]
            : [
                { id: "earnings", label: "Earnings" },
                { id: "payouts", label: "Payouts" },
                { id: "contracts", label: "Contracts" },
              ]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ClientTab | TalentTab)}
              className="rounded-lg border px-4 py-2 text-xs font-medium transition-colors"
              style={{
                borderColor: activeTab === tab.id ? feyTokens.borders.active : feyTokens.borders.default,
                background:
                  activeTab === tab.id
                    ? feyTokens.glass.panel.background
                    : "transparent",
                color:
                  activeTab === tab.id
                    ? feyTokens.colors.text.primary
                    : feyTokens.colors.text.secondary,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <FeySurface variant="card" mesh={true} meshVariant="panel" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: feyTokens.borders.default }}
                >
                  {payFace === "client" && activeTab === "invoices" && (
                    <>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Invoice #
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Campaign
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-right">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Amount
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-center">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Status
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Due Date
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-center">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Actions
                        </span>
                      </th>
                    </>
                  )}
                  {activeTab === "payouts" && (
                    <>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Creator
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-right">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Amount
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-center">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Status
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Scheduled Date
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Method
                        </span>
                      </th>
                    </>
                  )}
                  {payFace === "client" && activeTab === "transactions" && (
                    <>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Date
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Type
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-right">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Amount
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-center">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Status
                        </span>
                      </th>
                    </>
                  )}
                  {payFace === "talent" && activeTab === "earnings" && (
                    <>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Campaign
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-right">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Amount
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-center">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Status
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Expected Date
                        </span>
                      </th>
                    </>
                  )}
                  {payFace === "talent" && activeTab === "contracts" && (
                    <>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Contract
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Campaign
                        </span>
                      </th>
                      <th className="px-5 py-3.5 text-center">
                        <span
                          className="text-[9px] font-medium uppercase tracking-wider"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          Status
                        </span>
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {payFace === "client" && activeTab === "invoices" &&
                  invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b transition-all hover:bg-white/5 hover:border-white/10"
                      style={{ borderColor: feyTokens.borders.default }}
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs font-medium"
                          style={{ color: feyTokens.colors.text.primary }}
                        >
                          {invoice.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs"
                          style={{ color: feyTokens.colors.text.secondary }}
                        >
                          {invoice.campaign}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className="text-xs font-medium tabular-nums"
                          style={{ color: feyTokens.colors.text.primary }}
                        >
                          AED {invoice.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                          style={{
                            background:
                              invoice.status === "Paid"
                                ? `${feyTokens.colors.status.success}20`
                                : invoice.status === "Overdue"
                                  ? `${feyTokens.colors.status.error}20`
                                  : `${feyTokens.colors.status.warning}20`,
                            color:
                              invoice.status === "Paid"
                                ? feyTokens.colors.status.success
                                : invoice.status === "Overdue"
                                  ? feyTokens.colors.status.error
                                  : feyTokens.colors.status.warning,
                          }}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs"
                          style={{ color: feyTokens.colors.text.secondary }}
                        >
                          {invoice.dueDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="rounded p-1 text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className="rounded p-1 text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {activeTab === "payouts" &&
                  payouts.map((payout) => (
                    <tr
                      key={payout.id}
                      className="border-b transition-all hover:bg-white/5 hover:border-white/10"
                      style={{ borderColor: feyTokens.borders.default }}
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs font-medium"
                          style={{ color: feyTokens.colors.text.primary }}
                        >
                          {payout.creator}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className="text-xs font-medium tabular-nums"
                          style={{ color: feyTokens.colors.text.primary }}
                        >
                          AED {payout.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                          style={{
                            background:
                              payout.status === "Paid"
                                ? `${feyTokens.colors.status.success}20`
                                : `${feyTokens.colors.status.warning}20`,
                            color:
                              payout.status === "Paid"
                                ? feyTokens.colors.status.success
                                : feyTokens.colors.status.warning,
                          }}
                        >
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs"
                          style={{ color: feyTokens.colors.text.secondary }}
                        >
                          {payout.scheduledDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs"
                          style={{ color: feyTokens.colors.text.secondary }}
                        >
                          {payout.method}
                        </span>
                      </td>
                    </tr>
                  ))}
                {payFace === "client" && activeTab === "transactions" && (
                  <tr
                    className="border-b"
                    style={{ borderColor: feyTokens.borders.default }}
                  >
                    <td colSpan={4} className="px-5 py-4 text-sm" style={{ color: feyTokens.colors.text.muted }}>
                      No transactions yet. Funding and releases will appear here.
                    </td>
                  </tr>
                )}
                {payFace === "talent" && activeTab === "earnings" &&
                  earnings.map((earning) => (
                    <tr
                      key={earning.id}
                      className="border-b transition-all hover:bg-white/5 hover:border-white/10"
                      style={{ borderColor: feyTokens.borders.default }}
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs font-medium"
                          style={{ color: feyTokens.colors.text.primary }}
                        >
                          {earning.campaign}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className="text-xs font-medium tabular-nums"
                          style={{ color: feyTokens.colors.text.primary }}
                        >
                          AED {earning.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                          style={{
                            background:
                              earning.status === "Released"
                                ? `${feyTokens.colors.status.success}20`
                                : earning.status === "Approved"
                                  ? `${feyTokens.colors.chart.primary}20`
                                  : `${feyTokens.colors.status.warning}20`,
                            color:
                              earning.status === "Released"
                                ? feyTokens.colors.status.success
                                : earning.status === "Approved"
                                  ? feyTokens.colors.chart.primary
                                  : feyTokens.colors.status.warning,
                          }}
                        >
                          {earning.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs"
                          style={{ color: feyTokens.colors.text.secondary }}
                        >
                          {earning.expectedDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                {payFace === "talent" && activeTab === "contracts" &&
                  contracts.map((contract) => (
                    <tr
                      key={contract.id}
                      className="border-b transition-all hover:bg-white/5 hover:border-white/10"
                      style={{ borderColor: feyTokens.borders.default }}
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs font-medium"
                          style={{ color: feyTokens.colors.text.primary }}
                        >
                          {contract.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs"
                          style={{ color: feyTokens.colors.text.secondary }}
                        >
                          {contract.campaign}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                          style={{
                            background:
                              contract.status === "Signed"
                                ? `${feyTokens.colors.status.success}20`
                                : contract.status === "Completed"
                                  ? `${feyTokens.colors.chart.primary}20`
                                  : `${feyTokens.colors.status.warning}20`,
                            color:
                              contract.status === "Signed"
                                ? feyTokens.colors.status.success
                                : contract.status === "Completed"
                                  ? feyTokens.colors.chart.primary
                                  : feyTokens.colors.status.warning,
                          }}
                        >
                          {contract.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </FeySurface>

        {/* Payment Methods Panel (conditional) */}
        {payFace === "client" && showPaymentMethods && (
          <div className="mt-6">
            <PaymentMethodsPanel
              amount={invoices.reduce((sum, inv) => sum + inv.amount, 0)}
              onMethodSelect={(method) => {
                console.log("Selected payment method:", method);
              }}
            />
          </div>
        )}
      </div>
      
      {/* Bottom Dock Navigation */}
      <BottomDock />
    </div>
  );
}
