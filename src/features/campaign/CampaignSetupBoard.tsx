"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PackageConfig } from "@/lib/packages";
import { formatAED, getPackagePriceLabel, PACKAGES } from "@/lib/packages";
import { useSession } from "next-auth/react";
import { useLocalCampaignStore } from "@/store/useLocalCampaignStore";

// ── Types ─────────────────────────────────────────────────────────────────────

type Talent = { id: string; name: string; primaryRole?: string };

type CampaignObjective = "awareness" | "engagement" | "traffic" | "conversions";
type BookingType = "campaign" | "retainer";
type PaymentSchedule = "milestone_50_50" | "upfront_100" | "monthly";

interface CampaignBoardState {
  campaignName: string;
  objectives: CampaignObjective[];
  bookingType: BookingType;
  startDate: string;
  endDate: string;
  totalBudget: string;
  paymentSchedule: PaymentSchedule;
  notes: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const OBJECTIVES: { value: CampaignObjective; label: string; description: string }[] = [
  { value: "awareness",   label: "Awareness",   description: "Reach & impressions" },
  { value: "engagement",  label: "Engagement",  description: "Likes, comments, shares" },
  { value: "traffic",     label: "Traffic",     description: "CTR & link clicks" },
  { value: "conversions", label: "Conversions", description: "Sales & leads" },
];

const PAYMENT_SCHEDULE_OPTIONS: { value: PaymentSchedule; label: string; description: string }[] = [
  { value: "milestone_50_50", label: "50 / 50 Milestone",  description: "50% on sign, 50% on delivery" },
  { value: "upfront_100",     label: "100% Upfront",       description: "Full payment at campaign start" },
  { value: "monthly",         label: "Monthly Retainer",   description: "Billed monthly on agreed date" },
];

const inputCls =
  "w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-white/85 placeholder:text-white/22 focus:outline-none focus:border-white/[0.22] focus:bg-white/[0.07] transition-all duration-200";

const labelCls = "text-[10px] font-medium tracking-[0.10em] uppercase text-white/30 mb-1.5 block";

// ── Review Modal ──────────────────────────────────────────────────────────────

function ReviewModal({
  state,
  talents,
  selectedPkg,
  onBack,
  onConfirm,
}: {
  state: CampaignBoardState;
  talents: Talent[];
  selectedPkg: PackageConfig | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="w-full max-w-[720px] mx-auto"
    >
      <div className="rounded-2xl bg-[rgba(13,17,23,0.98)] border border-white/[0.09] overflow-hidden">
        <div className="px-8 py-6 border-b border-white/[0.06]">
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/30 mb-1">
            Review Campaign
          </p>
          <h3 className="text-[22px] font-light text-white/90 tracking-[-0.02em]">
            {state.campaignName || "Untitled Campaign"}
          </h3>
          {selectedPkg && (
            <p className="text-[12px] text-white/38 mt-1">
              {selectedPkg.emoji} {selectedPkg.name}
            </p>
          )}
        </div>

        <div className="px-8 py-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Objective",  value: state.objectives.length > 0 ? state.objectives.map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(", ") : "—" },
              { label: "Type",       value: state.bookingType === "retainer" ? "Monthly Retainer" : "Per Campaign" },
              { label: "Dates",      value: state.startDate && state.endDate ? `${state.startDate} → ${state.endDate}` : "TBD" },
              { label: "Budget",     value: state.totalBudget ? `AED ${parseInt(state.totalBudget.replace(/,/g, "")).toLocaleString()}` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/[0.04] border border-white/[0.07] px-3 py-3">
                <p className="text-[10px] text-white/28 tracking-wide uppercase mb-1">{label}</p>
                <p className="text-[13px] text-white/80 font-light">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className={labelCls}>{talents.length} Talent{talents.length !== 1 ? "s" : ""} in Pod</p>
            <div className="flex flex-wrap gap-2">
              {talents.map((t) => (
                <div key={t.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/[0.09]">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60">
                    {t.name[0]}
                  </div>
                  <span className="text-[12px] text-white/70">{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {state.notes && (
            <div>
              <p className={labelCls}>Notes</p>
              <p className="text-[13px] text-white/55 leading-relaxed">{state.notes}</p>
            </div>
          )}

          <div>
            <p className={labelCls}>Payment Schedule</p>
            <p className="text-[13px] text-white/65">
              {PAYMENT_SCHEDULE_OPTIONS.find(p => p.value === state.paymentSchedule)?.label} —{" "}
              <span className="text-white/38">
                {PAYMENT_SCHEDULE_OPTIONS.find(p => p.value === state.paymentSchedule)?.description}
              </span>
            </p>
          </div>

          <p className="text-[12px] text-white/38 leading-relaxed border-t border-white/[0.05] pt-4">
            Deliverables, usage rights, and per-talent add-ons can be configured after confirmation in your dashboard.
          </p>
        </div>

        <div className="px-8 py-5 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.015]">
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] text-white/35 hover:text-white/60 transition-colors"
          >
            ← Back to board
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-7 py-3 bg-white text-[#0B0F14] rounded-xl text-[13px] font-medium hover:bg-white/90 transition-all shadow-[0_4px_28px_rgba(255,255,255,0.12)]"
          >
            Confirm & Send to Talent →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Board ────────────────────────────────────────────────────────────────

export function CampaignSetupBoard({
  talents,
  onClose,
  onClear,
  selectedPkg,
  onRequestAuth,
}: {
  talents: Talent[];
  onClose: () => void;
  onClear: () => void;
  selectedPkg?: PackageConfig | null;
  onRequestAuth?: () => void;
}) {
  const { data: session } = useSession();

  const [state, setState] = useState<CampaignBoardState>(() => ({
    campaignName: "",
    objectives: selectedPkg ? [selectedPkg.defaultObjective] : [],
    bookingType: selectedPkg?.bookingType ?? "campaign",
    startDate: "",
    endDate: "",
    totalBudget: "",
    paymentSchedule: "milestone_50_50",
    notes: "",
  }));

  const [showReview, setShowReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalBudgetNum = parseInt(state.totalBudget.replace(/,/g, "")) || 0;

  const update = useCallback(<K extends keyof CampaignBoardState>(
    key: K,
    value: CampaignBoardState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleObjective = (obj: CampaignObjective) => {
    setState((prev) => ({
      ...prev,
      objectives: prev.objectives.includes(obj)
        ? prev.objectives.filter((o) => o !== obj)
        : [...prev.objectives, obj],
    }));
  };

  const handleConfirm = async () => {
    // Gate on session — dashboard nav requires auth
    if (!session?.user) {
      if (onRequestAuth) onRequestAuth();
      return;
    }
    setSubmitted(true);
    const userEmail = (session?.user as { email?: string } | undefined)?.email ?? "pending@creatorhive.ae";
    // Persist campaign locally so dashboard screens see it immediately
    const localId = `local-${Date.now()}`;
    useLocalCampaignStore.getState().addCampaign({
      id: localId,
      name: state.campaignName || "Untitled Campaign",
      objective: state.objectives[0] ?? "awareness",
      budget: parseInt(state.totalBudget.replace(/,/g, "")) || 0,
      spend: 0,
      status: "active",
    });
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignDescription: state.campaignName || "Untitled Campaign",
        email: userEmail,
        talentIds: talents.map((t) => t.id),
        budgetRange: state.totalBudget,
        bookingType: state.bookingType === "retainer" ? "long" : "short",
        startDate: state.startDate || undefined,
      }),
    }).catch((e) => console.warn("[BookingAPI] background save failed:", e));
  };

  // ── SOW download ──────────────────────────────────────────────────────────
  const handleDownloadSOW = async () => {
    const mod = await import("jspdf");
    // jsPDF v4 exports named 'jsPDF'; v3 exports default — handle both
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const JsPDFClass = (mod as any).jsPDF ?? (mod as any).default;
    const doc = new JsPDFClass({ orientation: "portrait", unit: "mm", format: "a4" });

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" });
    const budget = parseInt(state.totalBudget.replace(/,/g, "")) || 0;
    const vat = Math.round(budget * 0.05);
    const total = budget + vat;
    const payOpt = PAYMENT_SCHEDULE_OPTIONS.find(p => p.value === state.paymentSchedule);

    const W = 210; // A4 width mm
    let y = 0;

    // ── Header bar ────────────────────────────────────────────────────────
    doc.setFillColor(11, 15, 20);
    doc.rect(0, 0, W, 36, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Creator Hive", 14, 16);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 180);
    doc.text("Statement of Work", 14, 23);
    doc.text(`Generated: ${dateStr}`, 14, 29);
    // Accent line
    doc.setDrawColor(120, 80, 220);
    doc.setLineWidth(0.6);
    doc.line(0, 36, W, 36);

    y = 50;

    // ── Campaign name ─────────────────────────────────────────────────────
    doc.setTextColor(20, 20, 35);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(state.campaignName || "Untitled Campaign", 14, y);
    y += 7;

    if (selectedPkg) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 80, 180);
      doc.text(`${selectedPkg.name} Package`, 14, y);
      y += 8;
    }

    // ── Section helper ────────────────────────────────────────────────────
    const sectionHeader = (title: string) => {
      y += 4;
      doc.setFillColor(245, 244, 250);
      doc.roundedRect(14, y - 4, W - 28, 8, 1.5, 1.5, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 80, 160);
      doc.text(title.toUpperCase(), 18, y + 1);
      y += 10;
      doc.setTextColor(30, 30, 40);
    };

    const row = (label: string, value: string) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 100);
      doc.text(label, 18, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 35);
      doc.text(value, 70, y);
      y += 6;
    };

    // ── Campaign details ──────────────────────────────────────────────────
    sectionHeader("Campaign Details");
    row("Objectives", state.objectives.map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(", ") || "—");
    row("Booking Type", state.bookingType === "retainer" ? "Monthly Retainer" : "Per Campaign");
    if (state.startDate || state.endDate) {
      row("Campaign Dates", `${state.startDate || "TBD"} → ${state.endDate || "TBD"}`);
    }
    if (state.notes) {
      y += 2;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 100);
      doc.text("Brief Notes", 18, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 55);
      const noteLines = doc.splitTextToSize(state.notes, W - 40) as string[];
      doc.text(noteLines, 18, y);
      y += noteLines.length * 5 + 2;
    }

    // ── Talent pod ────────────────────────────────────────────────────────
    sectionHeader("Talent Pod");
    talents.forEach((t) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 35);
      doc.text(`• ${t.name}${t.primaryRole ? `  —  ${t.primaryRole}` : ""}`, 18, y);
      y += 6;
    });

    // ── Financials ────────────────────────────────────────────────────────
    if (budget > 0) {
      sectionHeader("Financials");
      row("Campaign Budget", `AED ${budget.toLocaleString()}`);
      row("VAT (5%)", `AED ${vat.toLocaleString()}`);
      // Total row with highlight
      y += 1;
      doc.setFillColor(11, 15, 20);
      doc.roundedRect(14, y - 4, W - 28, 9, 1.5, 1.5, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Total (incl. VAT)", 18, y + 1.5);
      doc.text(`AED ${total.toLocaleString()}`, W - 30, y + 1.5, { align: "right" });
      y += 12;
      row("Payment Schedule", `${payOpt?.label} — ${payOpt?.description}`);
    }

    // ── Terms ─────────────────────────────────────────────────────────────
    sectionHeader("Terms & Conditions");
    const terms = [
      "Issued by Creator Hive FZE, Sharjah Research Technology & Innovation Park, UAE.",
      "All work is subject to Creator Hive's Terms & Conditions and applicable UAE law.",
      "Talent will confirm acceptance before work commences. Funds are held in escrow until delivery.",
      "Deliverables, usage rights, and per-talent add-ons to be configured in your dashboard.",
    ];
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 80);
    terms.forEach((t) => {
      const lines = doc.splitTextToSize(`• ${t}`, W - 36) as string[];
      doc.text(lines, 18, y);
      y += lines.length * 5;
    });

    // ── Footer ────────────────────────────────────────────────────────────
    const pageH = 297;
    doc.setFillColor(245, 244, 250);
    doc.rect(0, pageH - 14, W, 14, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 100, 160);
    doc.text("Creator Hive FZE · creatorhive.ae · Sharjah, UAE", W / 2, pageH - 6, { align: "center" });

    const filename = `CreatorHive_SOW_${(state.campaignName || "Campaign").replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  const SuccessScreen = () => {
    const budget = parseInt(state.totalBudget.replace(/,/g, "")) || 0;
    const vat = Math.round(budget * 0.05);
    const totalDue = budget + vat;

    return (
      <div className="relative w-full min-h-[480px]">
        <div className="relative z-10 max-w-[780px] mx-auto px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="space-y-8"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/[0.12] ring-1 ring-emerald-400/[0.25] flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-[26px] font-light text-white/90 tracking-[-0.025em] mb-2">
                Campaign request sent
              </h3>
              <p className="text-[13px] text-white/38 max-w-[400px] mx-auto leading-relaxed">
                Your pod has been notified. Configure deliverables, usage rights, and manage payments in your dashboard.
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-white/45" />
                  <div>
                    <p className="text-[12px] font-medium text-white/75">Statement of Work drafted</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Auto-generated from your campaign brief</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSOW}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.07] ring-1 ring-white/[0.12] text-[11px] text-white/65 hover:bg-white/[0.12] hover:text-white/90 transition-all duration-150"
                >
                  <Download className="w-3 h-3" />
                  Download SOW
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Campaign", value: state.campaignName || "Untitled" },
                    { label: "Talent", value: `${talents.length} creator${talents.length !== 1 ? "s" : ""}` },
                    { label: "Objectives", value: state.objectives.map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(", ") || "—" },
                    { label: "Budget",     value: budget ? `AED ${budget.toLocaleString()}` : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl bg-white/[0.035] border border-white/[0.06] px-3 py-2.5">
                      <p className="text-[9px] uppercase tracking-[0.10em] text-white/28 mb-1">{label}</p>
                      <p className="text-[12px] text-white/75 font-light truncate">{value}</p>
                    </div>
                  ))}
                </div>
                {budget > 0 && (
                  <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] px-4 py-3 flex items-center justify-between">
                    <span className="text-[11px] text-white/40">Total (incl. VAT 5%)</span>
                    <span className="text-[13px] text-white/80 font-medium">AED {totalDue.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button type="button" onClick={handleDownloadSOW} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.07] ring-1 ring-white/[0.10] text-[13px] text-white/60 hover:bg-white/[0.12] hover:text-white/85 transition-all">
                <Download className="w-3.5 h-3.5" />Download SOW
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = "/api/goto-dashboard?mode=manage"; }}
                className="px-6 py-2.5 rounded-xl bg-white text-[#0B0F14] text-[13px] font-semibold hover:bg-white/90 transition-colors shadow-[0_4px_28px_rgba(255,255,255,0.12)]"
              >
                Go to dashboard →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  // ── Board ─────────────────────────────────────────────────────────────────

  // Success: full replacement — no overlay layering
  if (submitted) {
    return (
      <motion.div
        key="success-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="w-full"
      >
        <SuccessScreen />
      </motion.div>
    );
  }

  return (
    <div className="relative w-full min-h-[400px]">
      <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-10 pt-8 pb-16">
        <AnimatePresence mode="wait">
          {showReview ? (
            <motion.div key="review">
              <ReviewModal
                state={state}
                talents={talents}
                selectedPkg={selectedPkg ?? null}
                onBack={() => setShowReview(false)}
                onConfirm={handleConfirm}
              />
            </motion.div>
          ) : (
            <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Header */}
              <div className="flex items-start justify-between mb-10">
                <div>
                  {selectedPkg && (
                    <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-white/[0.07] ring-1 ring-white/[0.10] text-white/45 mb-2">
                      {selectedPkg.emoji} {selectedPkg.name}
                    </span>
                  )}
                  <h2 className="text-[24px] font-light tracking-[-0.03em] text-white/90 leading-none">
                    Campaign Setup
                  </h2>
                  <p className="text-[13px] text-white/35 mt-1.5 font-light">
                    Configure brief, deliverables, and terms for your campaign
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center text-white/28 hover:text-white/70 hover:bg-white/[0.09] transition-all duration-150 shrink-0 ml-4"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Campaign name */}
              <div className="mb-8 rounded-2xl bg-white/[0.025] border border-white/[0.07] px-5 py-4">
                <span className={labelCls}>Campaign Name</span>
                <input
                  type="text"
                  value={state.campaignName}
                  onChange={(e) => update("campaignName", e.target.value)}
                  placeholder="e.g. Ramadan 2026 — Awareness Push"
                  className="w-full bg-transparent border-none outline-none text-[18px] font-light text-white/80 placeholder:text-white/15 tracking-[-0.01em]"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: objectives + type + dates + notes */}
                <div className="lg:col-span-2 space-y-8">

                  {/* Objectives — multi-select */}
                  <div>
                    <span className={labelCls}>Campaign Objectives <span className="text-white/20 normal-case tracking-normal font-normal">(select all that apply)</span></span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {OBJECTIVES.map((obj) => {
                        const active = state.objectives.includes(obj.value);
                        return (
                          <button
                            key={obj.value}
                            type="button"
                            onClick={() => toggleObjective(obj.value)}
                            className={cn(
                              "rounded-xl px-3 py-3 text-left ring-1 transition-all duration-150 relative",
                              active
                                ? "bg-white/[0.11] ring-white/[0.22] text-white/95"
                                : "bg-transparent ring-white/[0.08] text-white/40 hover:bg-white/[0.06] hover:text-white/65"
                            )}
                          >
                            {active && (
                              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white/90" strokeWidth={3} />
                              </div>
                            )}
                            <p className="text-[12px] font-medium">{obj.label}</p>
                            <p className="text-[10px] mt-0.5 opacity-60">{obj.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Booking type + Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className={labelCls}>Booking Type</span>
                      <div className="flex gap-2">
                        {([
                          { value: "campaign", label: "Per Campaign" },
                          { value: "retainer", label: "Monthly Retainer" },
                        ] as const).map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => update("bookingType", value)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl text-[12px] ring-1 transition-all duration-150 text-center",
                              state.bookingType === value
                                ? "bg-white/[0.11] ring-white/[0.22] text-white font-medium"
                                : "bg-transparent ring-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.05]"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className={labelCls}>Campaign Dates</span>
                      <div className="grid grid-cols-2 gap-2">
                        {(["startDate", "endDate"] as const).map((key) => (
                          <input
                            key={key}
                            type="date"
                            value={state[key]}
                            onChange={(e) => update(key, e.target.value)}
                            className={cn(inputCls, "[color-scheme:dark] text-[12px] py-2")}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notes — lightweight brief */}
                  <div>
                    <span className={labelCls}>Brief Notes <span className="text-white/20 normal-case tracking-normal font-normal">(optional — add key messages, restrictions, or goals)</span></span>
                    <textarea
                      rows={3}
                      value={state.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="e.g. Focus on Ramadan generosity theme, Arabic-first content preferred, avoid competitor references…"
                      className={cn(inputCls, "resize-none text-[12px] leading-relaxed [color-scheme:dark] [appearance:none]")}
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    />
                  </div>

                  {/* Talents in pod — read-only summary */}
                  <div>
                    <span className={labelCls}>{talents.length} Talent{talents.length !== 1 ? "s" : ""} Selected</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {talents.map((t) => (
                        <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/[0.09]">
                          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60 shrink-0">
                            {t.name[0]}
                          </div>
                          <span className="text-[12px] text-white/70">{t.name}</span>
                          {t.primaryRole && <span className="text-[10px] text-white/30">{t.primaryRole}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: budget + payment */}
                <div className="space-y-6">
                  <div>
                    <span className={labelCls}>Total Campaign Budget</span>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-white/30 pointer-events-none">AED</span>
                      <input
                        type="text"
                        value={state.totalBudget}
                        onChange={(e) => update("totalBudget", e.target.value)}
                        placeholder="e.g. 25,000"
                        className={cn(inputCls, "pl-12")}
                      />
                    </div>
                    {selectedPkg && (
                      <p className="text-[10px] text-white/25 mt-1.5">
                        Suggested: {getPackagePriceLabel(selectedPkg)}
                      </p>
                    )}
                  </div>

                  {/* Budget breakdown preview */}
                  {totalBudgetNum > 0 && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-2">
                      <p className="text-[10px] font-medium tracking-[0.10em] uppercase text-white/30 mb-3">Summary</p>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-white/35">Your budget</span>
                        <span className="text-[11px] text-white/60">{formatAED(totalBudgetNum)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-white/35">VAT (5%)</span>
                        <span className="text-[11px] text-white/60">{formatAED(Math.round(totalBudgetNum * 0.05))}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/[0.06]">
                        <span className="text-[12px] text-white/55 font-medium">Total</span>
                        <span className="text-[13px] text-white/85 font-medium">
                          {formatAED(Math.round(totalBudgetNum * 1.05))}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className={labelCls}>Payment Schedule</span>
                    <div className="space-y-2">
                      {PAYMENT_SCHEDULE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update("paymentSchedule", opt.value)}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl ring-1 transition-all duration-150",
                            state.paymentSchedule === opt.value
                              ? "bg-white/[0.09] ring-white/[0.20] text-white/90"
                              : "bg-transparent ring-white/[0.07] text-white/40 hover:bg-white/[0.05] hover:text-white/60"
                          )}
                        >
                          <p className="text-[12px] font-medium">{opt.label}</p>
                          <p className="text-[10px] mt-0.5 opacity-60">{opt.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-white/35 leading-relaxed">
                    Deliverables, usage rights, and per-talent add-ons are configured post-confirmation in your dashboard.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-white/[0.06] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { onClear(); onClose(); }}
                  className="text-[13px] text-white/28 hover:text-white/55 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-3">
                  <p className="text-[11px] text-white/20">
                    {talents.length} talent{talents.length !== 1 ? "s" : ""}
                    {state.objectives.length > 0 && ` · ${state.objectives.join(", ")}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowReview(true)}
                    disabled={!state.campaignName}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[13px] font-medium transition-all shadow-[0_4px_28px_rgba(255,255,255,0.10)]",
                      state.campaignName
                        ? "bg-white text-[#0B0F14] hover:bg-white/90"
                        : "bg-white/[0.08] text-white/30 cursor-not-allowed"
                    )}
                  >
                    Review Campaign →
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
