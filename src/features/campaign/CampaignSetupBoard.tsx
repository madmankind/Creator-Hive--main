"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PackageConfig } from "@/lib/packages";
import { formatAED, aedToUsdApprox, getPackagePriceLabel, PACKAGES } from "@/lib/packages";
import { CurrencyToggle } from "@/components/ui/CurrencyToggle";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useSession } from "next-auth/react";
import { useLocalCampaignStore } from "@/store/useLocalCampaignStore";
import { useDiscoveryStore } from "@/store/useDiscoveryStore";
import { mapObjectiveToCampaign } from "@/lib/discovery";
import { analytics } from "@/lib/analytics";

// ── Types ─────────────────────────────────────────────────────────────────────

type Talent = { id: string; name: string; primaryRole?: string; bookedRole?: string; roles?: string[] };

type CampaignObjective = "awareness" | "engagement" | "traffic" | "conversions";
type BookingType = "campaign" | "retainer";
type PaymentSchedule = "milestone_50_50" | "upfront_100" | "monthly";
type StartTiming = "asap" | "this_month" | "next_month" | "custom";

interface CampaignBoardState {
  campaignName: string;
  objectives: CampaignObjective[];
  bookingType: BookingType;
  startTiming: StartTiming;
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
  currency,
  onBack,
  onConfirm,
}: {
  state: CampaignBoardState;
  talents: Talent[];
  selectedPkg: PackageConfig | null;
  currency: "AED" | "USD";
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
              { label: "Starts",     value: state.startTiming === "asap" ? "ASAP" : state.startTiming === "this_month" ? "This month" : state.startTiming === "next_month" ? "Next month" : state.startDate || "Custom" },
              { label: "Budget",     value: state.totalBudget ? (currency === 'AED' ? `AED ${parseInt(state.totalBudget.replace(/,/g, '')).toLocaleString()}` : `$${Math.round(parseInt(state.totalBudget.replace(/,/g, '')) / 3.6725).toLocaleString()}`) : "—" },
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
  const router = useRouter();
  const { currency } = useCurrencyStore();

  const [state, setState] = useState<CampaignBoardState>(() => {
    // Prefill from discovery brief if available
    const ds = useDiscoveryStore.getState();
    const discoveryObj = ds.completed && ds.primaryObjective
      ? mapObjectiveToCampaign(ds.primaryObjective) as CampaignObjective | null
      : null;

    // Map discovery budget range to a numeric string
    const budgetFromDiscovery = (() => {
      if (!ds.budgetRange) return "";
      const raw = ds.budgetRange.toLowerCase();
      if (raw.includes("5k") || raw.includes("5,000") || raw.includes("under")) return "5000";
      if (raw.includes("8k") || raw.includes("8,000")) return "8000";
      if (raw.includes("12k") || raw.includes("12,000")) return "12000";
      if (raw.includes("15k") || raw.includes("15,000")) return "15000";
      if (raw.includes("25k") || raw.includes("25,000")) return "25000";
      if (raw.includes("45k") || raw.includes("45,000")) return "45000";
      const parsed = parseInt(raw.replace(/[^\d]/g, ""));
      return parsed > 0 ? String(parsed) : "";
    })();

    // Map startTiming from discovery
    const startTimingFromDiscovery = ((): StartTiming => {
      const t = (ds.startTiming ?? "").toLowerCase();
      if (t.includes("asap") || t.includes("immediate")) return "asap";
      if (t.includes("this month") || t.includes("2 weeks")) return "this_month";
      if (t.includes("next month")) return "next_month";
      return "asap";
    })();

    return {
      campaignName: ds.completed && ds.companyName ? `${ds.companyName} Campaign` : "",
      objectives: selectedPkg ? [selectedPkg.defaultObjective] : discoveryObj ? [discoveryObj] : [],
      bookingType: selectedPkg?.bookingType ?? (ds.completed && ds.startTiming === "exploring" ? "retainer" as BookingType : "campaign"),
      startTiming: startTimingFromDiscovery,
      startDate: "",
      endDate: "",
      totalBudget: budgetFromDiscovery,
      paymentSchedule: "milestone_50_50",
      notes: ds.completed && ds.notes ? ds.notes : "",
    };
  });

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
    if (submitted) return;
    // Require auth before booking — API returns 401 otherwise
    if (!session?.user) {
      onRequestAuth?.();
      return;
    }
    setSubmitted(true);
    const userEmail = (session?.user as { email?: string } | undefined)?.email ?? "pending@creatorhive.ae";
    const localId = `local-${Date.now()}`;
    const budgetNum = parseInt(state.totalBudget.replace(/,/g, "")) || 0;
    const vat = Math.round(budgetNum * 0.05);
    const perTalent = talents.length > 0 ? Math.round(budgetNum / talents.length) : budgetNum;

    // Persist locally for immediate dashboard visibility
    useLocalCampaignStore.getState().addCampaign({
      id: localId,
      name: state.campaignName || "Untitled Campaign",
      objective: state.objectives[0] ?? "awareness",
      objectives: state.objectives,
      budget: budgetNum,
      spend: 0,
      status: "active",
      startDate: state.startTiming === "custom" ? state.startDate || undefined : undefined,
      endDate: state.endDate || undefined,
      bookingType: state.bookingType,
      paymentSchedule: state.paymentSchedule,
      notes: state.notes || undefined,
      talentIds: talents.map((t) => t.id),
      talentNames: talents.map((t) => t.name),
    });

    // Build SOW text for contract
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" });
    const contentLines = [
      `CREATOR HIVE — STATEMENT OF WORK`,
      ``,
      `Campaign: ${state.campaignName || "Untitled Campaign"}`,
      `Date: ${dateStr}`,
      `Client: ${userEmail}`,
      `Booking Type: ${state.bookingType === "retainer" ? "Monthly Retainer" : "Campaign"}`,
      ``,
      `BUDGET`,
      `Subtotal: ${currency === 'AED' ? 'AED ' + budgetNum.toLocaleString() : 'USD ' + Math.round(budgetNum / 3.6725).toLocaleString()}`,
      `VAT (5%): ${currency === 'AED' ? 'AED ' + vat.toLocaleString() : 'USD ' + Math.round(vat / 3.6725).toLocaleString()}`,
      `Total: ${currency === 'AED' ? 'AED ' + (budgetNum + vat).toLocaleString() : 'USD ' + Math.round((budgetNum + vat) / 3.6725).toLocaleString()}`,
      `Payment Schedule: ${state.paymentSchedule ?? "50% upfront, 50% on completion"}`,
      `Start: ${state.startTiming === "asap" ? "ASAP" : state.startTiming === "this_month" ? "This month" : state.startTiming === "next_month" ? "Next month" : state.startDate || "TBD"}`,
      state.endDate ? `End Date: ${state.endDate}` : "",
      ``,
      `TALENT`,
      ...talents.map((t, i) => `${i + 1}. ${t.name} — ${t.bookedRole ?? t.roles?.[0] ?? "Creator"}`),
      ``,
      `SCOPE`,
      `Deliverables, usage rights, and per-talent add-ons to be configured in your dashboard.`,
      state.notes ? `\nNOTES\n${state.notes}` : "",
    ].filter(l => l !== undefined).join("\n");

    // Milestone structure based on payment schedule
    const milestones = state.paymentSchedule === "upfront_100"
      ? [{ title: "Full payment", description: "100% upfront payment", amount: Math.round(budgetNum * 100) }]
      : state.paymentSchedule === "monthly"
        ? [
            { title: "Month 1", description: "Monthly retainer payment", amount: Math.round(budgetNum * 100 / 3) },
            { title: "Month 2", description: "Monthly retainer payment", amount: Math.round(budgetNum * 100 / 3) },
            { title: "Month 3", description: "Monthly retainer payment", amount: Math.round(budgetNum * 100 / 3) },
          ]
        : [
            { title: "Deposit (50%)", description: "Upfront deposit to begin production", amount: Math.round(budgetNum * 50), dueDate: state.startDate || undefined },
            { title: "Completion (50%)", description: "Final payment on delivery approval", amount: Math.round(budgetNum * 50), dueDate: state.endDate || undefined },
          ];

    // Fire-and-forget: booking API + contract creation per talent
    analytics.bookingSubmitted(talents.length, state.totalBudget);
    const bookingPromise = fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignDescription: state.campaignName || "Untitled Campaign",
        email: userEmail,
        talentIds: talents.map((t) => t.id),
        talentRoles: talents.map((t) => t.bookedRole ?? t.roles?.[0] ?? "Creator"),
        budgetRange: state.totalBudget,
        bookingType: state.bookingType === "retainer" ? "long" : "short",
        startDate: state.startTiming === "custom" ? state.startDate || undefined : state.startTiming,
      }),
    });

    // After booking, create one contract per talent
    bookingPromise
      .then(res => res.ok ? res.json() : null)
      .then(async (bookingData) => {
        const campaignId = bookingData?.data?.campaignId ?? null;
        await Promise.allSettled(
          talents.map(async (talent) => {
            try {
              await fetch("/api/contracts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  creatorProfileId: talent.id,
                  campaignId,
                  title: `${state.campaignName || "Campaign"} — ${talent.name} (${talent.bookedRole ?? talent.roles?.[0] ?? "Creator"})`,
                  content: contentLines,
                  totalAmount: Math.round(perTalent * 100), // store in cents
                  currency: "USD",
                  milestones,
                }),
              });
            } catch (e) {
              console.warn("[ContractAPI] failed for", talent.name, e);
            }
          })
        );
      })
      .catch(e => console.warn("[BookingAPI] background save failed:", e));
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
    const startLabel = state.startTiming === "asap" ? "ASAP" : state.startTiming === "this_month" ? "This month" : state.startTiming === "next_month" ? "Next month" : state.startDate || "TBD";
    row("Starts", state.endDate ? `${startLabel} → ${state.endDate}` : startLabel);
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
      row("Campaign Budget", currency === "AED" ? `AED ${budget.toLocaleString()}` : `$${Math.round(budget / 3.6725).toLocaleString()}`);
      row("VAT (5%)", currency === "AED" ? `AED ${vat.toLocaleString()}` : `$${Math.round(vat / 3.6725).toLocaleString()}`);
      // Total row with highlight
      y += 1;
      doc.setFillColor(11, 15, 20);
      doc.roundedRect(14, y - 4, W - 28, 9, 1.5, 1.5, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Total (incl. VAT)", 18, y + 1.5);
      doc.text((currency === "AED" ? `AED ${total.toLocaleString()}` : `$${Math.round(total / 3.6725).toLocaleString()}`), W - 30, y + 1.5, { align: "right" });
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

  // ── Schedule a Call screen ──────────────────────────────────────────────
  const SuccessScreen = () => {
    const [preferredTime, setPreferredTime] = useState("morning");
    const [notes, setNotes] = useState("");
    const [callBooked, setCallBooked] = useState(false);

    const ADVISOR = {
      name: "Ajil Abdulla",
      title: "Expert Media Strategist & Client Advisor",
      email: "ajil@creatorhive.ae",
      bio: "Ajil will advise you on setting up your Creator Hive team — from talent selection to campaign structure and execution.",
      avatar: "/ch-logo.svg",
      meetLink: "https://calendar.google.com/calendar/u/0/r/eventedit?text=Creator+Hive+Strategy+Call&details=Strategy+call+with+Ajil+Abdulla,+Creator+Hive+Client+Advisor.+We%27ll+finalise+your+team+and+campaign+structure.&location=Google+Meet&add=ajil@creatorhive.ae",
    };

    const timeSlots = [
      { id: "morning", label: "Morning", sub: "9:00 – 12:00 GST" },
      { id: "afternoon", label: "Afternoon", sub: "12:00 – 17:00 GST" },
      { id: "evening", label: "Evening", sub: "17:00 – 20:00 GST" },
    ];

    const handleBook = () => {
      // Open Google Calendar pre-filled event
      const params = new URLSearchParams({
        text: "Creator Hive Strategy Call",
        details: `Creator Hive briefing call with ${ADVISOR.name}.\n\nCampaign: ${state.campaignName || "Untitled"}\nTalent selected: ${talents.length}\nPreferred time: ${timeSlots.find(t => t.id === preferredTime)?.label || ""}\n\nNotes: ${notes || "None"}`,
        location: "Google Meet",
        add: ADVISOR.email,
      });
      window.open(`https://calendar.google.com/calendar/u/0/r/eventedit?${params.toString()}`, "_blank");
      setCallBooked(true);
    };

    return (
      <div className="relative w-full min-h-[480px]">
        <div className="relative z-10 max-w-[680px] mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/[0.12] ring-1 ring-emerald-400/[0.25] flex items-center justify-center mx-auto mb-3">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-[24px] font-light text-white/90 tracking-[-0.025em]">
                {callBooked ? "Call scheduled!" : "Let\'s get started."}
              </h3>
              <p className="text-[13px] text-white/38 max-w-[420px] mx-auto leading-relaxed">
                {callBooked
                  ? "Check your calendar. Ajil will reach out to confirm and brief your team within 48 hours."
                  : "Your brief is in. Schedule a call with your Creator Hive advisor to finalise the team and kick off your campaign."
                }
              </p>
            </div>

            {/* Advisor card */}
            <div className="rounded-2xl border overflow-hidden"
              style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="px-5 py-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  <svg width="26" height="26" viewBox="0 0 1024 1024" fill="none">
                    <path d="M 689 330 L 680 321 L 525 227 L 513 222 L 505 223 L 343 321 L 336 327 L 333 333 L 333 448 L 337 453 L 343 455 L 350 454 L 449 393 L 508 359 L 515 359 L 520 361 L 611 415 L 622 415 L 681 381 L 687 375 L 690 369 Z" fill="rgba(255,255,255,0.7)"/>
                    <path d="M 430 429 L 344 480 L 334 490 L 333 655 L 341 665 L 504 765 L 514 768 L 520 767 L 684 666 L 690 656 L 690 621 L 686 613 L 680 608 L 621 573 L 612 573 L 607 575 L 549 612 L 535 617 L 528 615 L 456 571 L 449 564 L 445 554 L 445 436 L 439 429 Z" fill="rgba(255,255,255,0.7)"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-white/90">{ADVISOR.name}</p>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "rgba(139,92,246,0.18)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.25)" }}>
                      Client Advisor
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40">{ADVISOR.bio}</p>
                </div>
              </div>

              {!callBooked && (
                <div className="border-t px-5 py-4 space-y-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {/* Time preference */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/28 mb-2">Preferred time (GST)</p>
                    <div className="flex gap-2">
                      {timeSlots.map(slot => (
                        <button key={slot.id} onClick={() => setPreferredTime(slot.id)}
                          className="flex-1 rounded-xl px-3 py-2.5 text-left transition-all"
                          style={{
                            background: preferredTime === slot.id ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${preferredTime === slot.id ? "rgba(139,92,246,0.40)" : "rgba(255,255,255,0.08)"}`,
                          }}>
                          <p className="text-[11px] font-semibold" style={{ color: preferredTime === slot.id ? "#A78BFA" : "rgba(255,255,255,0.70)" }}>
                            {slot.label}
                          </p>
                          <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>{slot.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/28 mb-1.5">Any notes for the call? <span className="normal-case">(optional)</span></p>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Specific questions, timeline constraints, existing assets..."
                      rows={2}
                      className="w-full rounded-xl px-3.5 py-2.5 text-[12px] text-white/70 placeholder:text-white/22 outline-none resize-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Brief summary strip */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Campaign", value: state.campaignName || "Untitled" },
                { label: "Talent", value: `${talents.length} creator${talents.length !== 1 ? "s" : ""}` },
                { label: "Budget", value: state.totalBudget ? (currency === "AED" ? `AED ${parseInt(state.totalBudget.replace(/,/g,"")).toLocaleString()}` : `$${Math.round(parseInt(state.totalBudget.replace(/,/g,"")) / 3.6725).toLocaleString()}`) : "TBD" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl px-3 py-2.5 text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-[9px] uppercase tracking-widest text-white/25 mb-1">{label}</p>
                  <p className="text-[12px] text-white/70 font-light truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!callBooked ? (
                <>
                  <button
                    type="button"
                    onClick={handleBook}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold transition-all"
                    style={{
                      background: "rgba(139,92,246,0.18)",
                      border: "1px solid rgba(139,92,246,0.40)",
                      color: "#C4B5FD",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Schedule call with Google Calendar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const latestCampaign = useLocalCampaignStore.getState().campaigns;
                      const latestId = latestCampaign[latestCampaign.length - 1]?.id;
                      router.push(`/dashboard/campaigns?mode=manage${latestId ? `&campaignId=${latestId}` : ""}`);
                    }}
                    className="px-5 py-3 rounded-2xl text-[13px] transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
                  >
                    Skip to dashboard
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const latestCampaign = useLocalCampaignStore.getState().campaigns;
                    const latestId = latestCampaign[latestCampaign.length - 1]?.id;
                    router.push(`/dashboard/campaigns?mode=manage${latestId ? `&campaignId=${latestId}` : ""}`);
                  }}
                  className="flex-1 py-3 rounded-2xl text-[13px] font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.80)" }}
                >
                  Go to dashboard →
                </button>
              )}
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
                currency={currency}
                onBack={() => setShowReview(false)}
                onConfirm={handleConfirm}
              />
            </motion.div>
          ) : (
            <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1 min-w-0">
                  {selectedPkg && (
                    <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-white/[0.07] ring-1 ring-white/[0.10] text-white/45 mb-2">
                      {selectedPkg.emoji} {selectedPkg.name}
                    </span>
                  )}
                  <h2 className="text-[22px] font-light tracking-[-0.03em] text-white/90 leading-none">
                    Campaign Brief
                  </h2>
                  <p className="text-[12px] text-white/30 mt-1.5 font-light">
                    We'll confirm your team within 48 hours.
                  </p>
                  {/* Talent chips — in header for context */}
                  {talents.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {talents.map((t) => (
                        <div key={t.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] ring-1 ring-white/[0.08]">
                          <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white/50 shrink-0">
                            {t.name[0]}
                          </div>
                          <span className="text-[11px] text-white/60">{t.name}</span>
                          {(t.primaryRole ?? t.bookedRole) && (
                            <span className="text-[9px] text-white/25">{t.primaryRole ?? t.bookedRole}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                  placeholder="e.g. Campaign Name — Awareness Push"
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

                  {/* Start timing + optional end date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className={labelCls}>When do you need to start?</span>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { value: "asap",       label: "ASAP" },
                          { value: "this_month", label: "This month" },
                          { value: "next_month", label: "Next month" },
                          { value: "custom",     label: "Custom date" },
                        ] as const).map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => update("startTiming", value)}
                            className={cn(
                              "py-2.5 rounded-xl text-[12px] ring-1 transition-all duration-150 text-center",
                              state.startTiming === value
                                ? "bg-white/[0.11] ring-white/[0.22] text-white font-medium"
                                : "bg-transparent ring-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.05]"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {state.startTiming === "custom" && (
                        <input
                          type="date"
                          value={state.startDate}
                          onChange={(e) => update("startDate", e.target.value)}
                          className={cn(inputCls, "[color-scheme:dark] text-[12px] py-2 mt-2")}
                        />
                      )}
                    </div>
                    <div>
                      <span className={labelCls}>End date <span className="text-white/20 normal-case tracking-normal font-normal">(optional)</span></span>
                      <input
                        type="date"
                        value={state.endDate}
                        onChange={(e) => update("endDate", e.target.value)}
                        className={cn(inputCls, "[color-scheme:dark] text-[12px] py-2")}
                      />
                    </div>
                  </div>

                  {/* Notes — lightweight brief */}
                  <div>
                    <span className={labelCls}>Brief Notes <span className="text-white/20 normal-case tracking-normal font-normal">(optional — key messages, restrictions, or goals)</span></span>
                    <textarea
                      rows={3}
                      value={state.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="e.g. Arabic-first content, avoid competitor references, focus on product demo format…"
                      className={cn(inputCls, "resize-none text-[12px] leading-relaxed [color-scheme:dark] [appearance:none]")}
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    />
                  </div>
                </div>

                {/* Right: budget + payment */}
                <div className="space-y-6">
                  <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={labelCls}>Total Campaign Budget <span className="text-white/20 normal-case tracking-normal font-normal">({currency})</span></span>
                    <CurrencyToggle compact />
                  </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-white/30 pointer-events-none">{currency === "AED" ? "AED" : "$"}</span>
                      <input
                        type="text"
                        value={state.totalBudget}
                        onChange={(e) => update("totalBudget", e.target.value)}
                        placeholder="e.g. 7,000"
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
                        <span className="text-[11px] text-white/60">{currency === "AED" ? `AED ${totalBudgetNum.toLocaleString()}` : `$${aedToUsdApprox(totalBudgetNum).toLocaleString()}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-white/35">VAT (5%)</span>
                        <span className="text-[11px] text-white/60">{currency === "AED" ? `AED ${Math.round(totalBudgetNum * 0.05).toLocaleString()}` : `$${aedToUsdApprox(Math.round(totalBudgetNum * 0.05)).toLocaleString()}`}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/[0.06]">
                        <span className="text-[12px] text-white/55 font-medium">Total</span>
                        <span className="text-[13px] text-white/85 font-medium">
                          {currency === "AED" ? `AED ${Math.round(totalBudgetNum * 1.05).toLocaleString()}` : `$${aedToUsdApprox(Math.round(totalBudgetNum * 1.05)).toLocaleString()}`}
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
