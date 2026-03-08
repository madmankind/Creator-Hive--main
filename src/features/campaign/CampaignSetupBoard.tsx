"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, ChevronDown, ChevronUp, Check, Sparkles, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PackageConfig } from "@/lib/packages";
import { suggestBudgetSplit, formatAED, getPackagePriceLabel, PACKAGES } from "@/lib/packages";

// ── Types ─────────────────────────────────────────────────────────────────────

type Talent = { id: string; name: string; primaryRole?: string };

type CampaignObjective = "awareness" | "engagement" | "traffic" | "conversions";
type BookingType = "campaign" | "retainer";
type UsageRightsTier = "none" | "standard" | "full" | "buyout";
type PaymentSchedule = "milestone_50_50" | "upfront_100" | "monthly";

interface StructuredDeliverable {
  id: string;
  platform: string;
  format: string;
  quantity: number;
  dueDate: string;
  assignedTalentId: string | null;
}

interface TalentAddOns {
  usageRights: UsageRightsTier;
  whitelisting: boolean;
  exclusivity: boolean;
  notes: string;
}

interface CampaignBoardState {
  campaignName: string;
  objective: CampaignObjective | null;
  bookingType: BookingType;
  startDate: string;
  endDate: string;
  totalBudget: string;
  paymentSchedule: PaymentSchedule;
  deliverables: StructuredDeliverable[];
  talentAddOns: Record<string, TalentAddOns>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const OBJECTIVES: { value: CampaignObjective; label: string; description: string }[] = [
  { value: "awareness",   label: "Awareness",   description: "Reach & impressions" },
  { value: "engagement",  label: "Engagement",  description: "Likes, comments, shares" },
  { value: "traffic",     label: "Traffic",     description: "CTR & link clicks" },
  { value: "conversions", label: "Conversions", description: "Sales & leads" },
];

const PLATFORM_OPTIONS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Snapchat", "Cross-Platform"];
const FORMAT_OPTIONS: Record<string, string[]> = {
  Instagram:        ["Reel", "Static Post", "Story", "Carousel", "Live"],
  TikTok:           ["Short-form Video", "TikTok Live", "Stitch"],
  YouTube:          ["Long-form Video", "Short", "Community Post"],
  LinkedIn:         ["Post", "Article", "Video"],
  Snapchat:         ["Snap", "Story", "Spotlight"],
  "Cross-Platform": ["Brand Film", "Identity System", "Content Package", "Photo Set", "Ad Creative Set"],
};

const USAGE_RIGHTS_OPTIONS: { value: UsageRightsTier; label: string; fee: string }[] = [
  { value: "none",     label: "No usage rights",      fee: "+AED 0" },
  { value: "standard", label: "Standard (6 months)",  fee: "+15%" },
  { value: "full",     label: "Full (perpetual)",     fee: "+30%" },
  { value: "buyout",   label: "Full buyout",          fee: "+50%" },
];

const PAYMENT_SCHEDULE_OPTIONS: { value: PaymentSchedule; label: string; description: string }[] = [
  { value: "milestone_50_50", label: "50 / 50 Milestone",  description: "50% on sign, 50% on delivery" },
  { value: "upfront_100",     label: "100% Upfront",       description: "Full payment at campaign start" },
  { value: "monthly",         label: "Monthly Retainer",   description: "Billed monthly on agreed date" },
];

const inputCls =
  "w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-white/85 placeholder:text-white/22 focus:outline-none focus:border-white/[0.22] focus:bg-white/[0.07] transition-all duration-200";

const labelCls = "text-[10px] font-medium tracking-[0.10em] uppercase text-white/30 mb-1.5 block";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Deliverable Row ───────────────────────────────────────────────────────────

function DeliverableRow({
  d,
  talents,
  onChange,
  onRemove,
}: {
  d: StructuredDeliverable;
  talents: Talent[];
  onChange: (updated: StructuredDeliverable) => void;
  onRemove: () => void;
}) {
  const fmts = FORMAT_OPTIONS[d.platform] || [];

  return (
    <div className="flex gap-2 items-start group">
      {/* Platform */}
      <select
        value={d.platform}
        onChange={(e) => onChange({ ...d, platform: e.target.value, format: "" })}
        className={cn(inputCls, "w-[130px] shrink-0 text-[12px] py-2 [color-scheme:dark]")}
      >
        {PLATFORM_OPTIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Format */}
      <select
        value={d.format}
        onChange={(e) => onChange({ ...d, format: e.target.value })}
        className={cn(inputCls, "flex-1 text-[12px] py-2 [color-scheme:dark]")}
      >
        <option value="">Format…</option>
        {fmts.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
        <option value="custom">Custom…</option>
      </select>
      {d.format === "custom" && (
        <input
          type="text"
          placeholder="Specify format…"
          className={cn(inputCls, "flex-1 text-[12px] py-2")}
          onChange={(e) => onChange({ ...d, format: e.target.value })}
        />
      )}

      {/* Quantity */}
      <input
        type="number"
        min={1}
        value={d.quantity}
        onChange={(e) => onChange({ ...d, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
        className={cn(inputCls, "w-[64px] shrink-0 text-[12px] py-2 text-center")}
      />

      {/* Due date */}
      <input
        type="date"
        value={d.dueDate}
        onChange={(e) => onChange({ ...d, dueDate: e.target.value })}
        className={cn(inputCls, "w-[140px] shrink-0 text-[12px] py-2 [color-scheme:dark]")}
      />

      {/* Assigned talent */}
      <select
        value={d.assignedTalentId || ""}
        onChange={(e) => onChange({ ...d, assignedTalentId: e.target.value || null })}
        className={cn(inputCls, "w-[120px] shrink-0 text-[12px] py-2 [color-scheme:dark]")}
      >
        <option value="">Any</option>
        {talents.map((t) => (
          <option key={t.id} value={t.id}>{t.name.split(" ")[0]}</option>
        ))}
      </select>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 w-8 h-9 flex items-center justify-center text-white/18 hover:text-red-400/70 transition-colors duration-150 opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Talent Add-Ons Panel ──────────────────────────────────────────────────────

function TalentAddOnsPanel({
  talent,
  addOns,
  onChange,
}: {
  talent: Talent;
  addOns: TalentAddOns;
  onChange: (updated: TalentAddOns) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasAddOns = addOns.usageRights !== "none" || addOns.whitelisting || addOns.exclusivity;

  return (
    <div className="rounded-xl border border-white/[0.07] overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors duration-150"
      >
        <div className="w-7 h-7 rounded-full bg-white/[0.10] ring-1 ring-white/[0.12] flex items-center justify-center text-[12px] font-medium text-white/70 shrink-0">
          {talent.name[0]}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[13px] text-white/80 truncate font-light">{talent.name}</p>
          {talent.primaryRole && (
            <p className="text-[10px] text-white/32 mt-0.5">{talent.primaryRole}</p>
          )}
        </div>
        {hasAddOns && (
          <div className="flex items-center gap-1 mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400/70" />
            <span className="text-[10px] text-white/35">Add-ons</span>
          </div>
        )}
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/25 shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/25 shrink-0" />
        )}
      </button>

      {/* Add-ons body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] space-y-4">
              {/* Usage rights */}
              <div>
                <span className={labelCls}>Usage Rights</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {USAGE_RIGHTS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChange({ ...addOns, usageRights: opt.value })}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl text-left ring-1 transition-all duration-150",
                        addOns.usageRights === opt.value
                          ? "bg-white/[0.10] ring-white/[0.22] text-white/90"
                          : "bg-transparent ring-white/[0.07] text-white/40 hover:bg-white/[0.05] hover:text-white/60"
                      )}
                    >
                      <span className="text-[11px]">{opt.label}</span>
                      <span className="text-[10px] text-white/35">{opt.fee}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Whitelisting + Exclusivity */}
              <div className="flex gap-3">
                {[
                  { key: "whitelisting" as const, label: "Whitelisting", fee: "+10%" },
                  { key: "exclusivity" as const, label: "Exclusivity", fee: "+25%" },
                ].map(({ key, label, fee }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ ...addOns, [key]: !addOns[key] })}
                    className={cn(
                      "flex-1 flex items-center justify-between px-3 py-2 rounded-xl ring-1 transition-all duration-150",
                      addOns[key]
                        ? "bg-white/[0.10] ring-white/[0.22] text-white/90"
                        : "bg-transparent ring-white/[0.07] text-white/40 hover:bg-white/[0.05] hover:text-white/60"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-4 h-4 rounded flex items-center justify-center ring-1 transition-all",
                        addOns[key] ? "bg-white/90 ring-white/90" : "bg-transparent ring-white/20"
                      )}>
                        {addOns[key] && <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
                      </div>
                      <span className="text-[11px]">{label}</span>
                    </div>
                    <span className="text-[10px] text-white/35">{fee}</span>
                  </button>
                ))}
              </div>

              {/* Notes */}
              <div>
                <span className={labelCls}>Talent Notes</span>
                <textarea
                  rows={2}
                  value={addOns.notes}
                  onChange={(e) => onChange({ ...addOns, notes: e.target.value })}
                  placeholder="Tone, restrictions, key messages for this talent…"
                  className={cn(inputCls, "resize-none text-[12px] leading-relaxed")}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Budget Split Preview ──────────────────────────────────────────────────────

function BudgetSplitPreview({
  talents,
  totalBudget,
  selectedPkg,
}: {
  talents: Talent[];
  totalBudget: number;
  selectedPkg: PackageConfig | null;
}) {
  if (!totalBudget || !talents.length) return null;

  let splits: Record<string, number> = {};
  if (selectedPkg) {
    const withRoles = talents.map((t) => ({
      id: t.id,
      role: t.primaryRole || "Content Creator",
    }));
    splits = suggestBudgetSplit(totalBudget, withRoles, selectedPkg);
  } else {
    const perTalent = Math.round(totalBudget / talents.length);
    talents.forEach((t) => (splits[t.id] = perTalent));
  }

  const platformFee = Math.round(totalBudget * 0.12);
  const vat = Math.round((totalBudget + platformFee) * 0.05);
  const total = totalBudget + platformFee + vat;

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-2">
      <p className="text-[10px] font-medium tracking-[0.10em] uppercase text-white/30 mb-3">
        Budget Distribution
      </p>
      {talents.map((t) => (
        <div key={t.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/[0.10] flex items-center justify-center text-[10px] text-white/60">
              {t.name[0]}
            </div>
            <span className="text-[12px] text-white/55">{t.name}</span>
          </div>
          <span className="text-[12px] font-medium text-white/75">
            {formatAED(splits[t.id] || 0)}
          </span>
        </div>
      ))}
      <div className="pt-2 mt-2 border-t border-white/[0.06] space-y-1.5">
        <div className="flex justify-between">
          <span className="text-[11px] text-white/28">Platform fee (12%)</span>
          <span className="text-[11px] text-white/45">{formatAED(platformFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[11px] text-white/28">VAT (5%)</span>
          <span className="text-[11px] text-white/45">{formatAED(vat)}</span>
        </div>
        <div className="flex justify-between pt-1.5 border-t border-white/[0.06]">
          <span className="text-[12px] text-white/60 font-medium">Total</span>
          <span className="text-[13px] text-white/90 font-medium">{formatAED(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Review Modal ──────────────────────────────────────────────────────────────

function ReviewModal({
  state,
  talents,
  selectedPkg,
  onBack,
  onConfirm,
  submitting,
  submitError,
}: {
  state: CampaignBoardState;
  talents: Talent[];
  selectedPkg: PackageConfig | null;
  onBack: () => void;
  onConfirm: () => void;
  submitting: boolean;
  submitError: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="w-full max-w-[720px] mx-auto"
    >
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.09] overflow-hidden">
        {/* Header */}
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
          {/* Overview grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Objective",  value: state.objective ? state.objective.charAt(0).toUpperCase() + state.objective.slice(1) : "—" },
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

          {/* Talents */}
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

          {/* Deliverables */}
          {state.deliverables.length > 0 && (
            <div>
              <p className={labelCls}>{state.deliverables.length} Deliverable{state.deliverables.length !== 1 ? "s" : ""}</p>
              <div className="space-y-1.5">
                {state.deliverables.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
                    <span className="text-[11px] text-white/45 w-[90px] shrink-0">{d.platform}</span>
                    <span className="text-[12px] text-white/70 flex-1">{d.quantity}× {d.format || "—"}</span>
                    {d.dueDate && (
                      <span className="text-[10px] text-white/30">Due {d.dueDate}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment schedule */}
          <div>
            <p className={labelCls}>Payment Schedule</p>
            <p className="text-[13px] text-white/65">
              {PAYMENT_SCHEDULE_OPTIONS.find(p => p.value === state.paymentSchedule)?.label} —{" "}
              <span className="text-white/38">
                {PAYMENT_SCHEDULE_OPTIONS.find(p => p.value === state.paymentSchedule)?.description}
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.015]">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="text-[13px] text-white/35 hover:text-white/60 transition-colors disabled:opacity-40"
          >
            ← Back to board
          </button>
          <div className="flex items-center gap-3">
            {submitError && (
              <p className="text-[11px] text-red-400/80">{submitError}</p>
            )}
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="px-7 py-3 bg-white text-[#0B0F14] rounded-xl text-[13px] font-medium hover:bg-white/90 transition-all shadow-[0_4px_28px_rgba(255,255,255,0.12)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-black/20 border-t-black/60 animate-spin shrink-0" />
              )}
              {submitting ? "Sending…" : "Confirm & Send to Talent →"}
            </button>
          </div>
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
}: {
  talents: Talent[];
  onClose: () => void;
  onClear: () => void;
  selectedPkg?: PackageConfig | null;
}) {
  const [state, setState] = useState<CampaignBoardState>(() => {
    // Seed deliverables from package template if provided
    const deliverables: StructuredDeliverable[] =
      selectedPkg?.deliverableTemplates.map((dt) => ({
        id: uid(),
        platform: dt.platform,
        format: dt.format,
        quantity: dt.quantity,
        dueDate: "",
        assignedTalentId: null,
      })) ?? [];

    const defaultAddOns = (): TalentAddOns => ({
      usageRights: "none",
      whitelisting: false,
      exclusivity: false,
      notes: "",
    });

    const talentAddOns: Record<string, TalentAddOns> = {};
    talents.forEach((t) => (talentAddOns[t.id] = defaultAddOns()));

    return {
      campaignName: "",
      objective: selectedPkg?.defaultObjective ?? null,
      bookingType: selectedPkg?.bookingType ?? "campaign",
      startDate: "",
      endDate: "",
      totalBudget: "",
      paymentSchedule: "milestone_50_50",
      deliverables,
      talentAddOns,
    };
  });

  const [showReview, setShowReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dismissedPattern, setDismissedPattern] = useState(false);

  const totalBudgetNum = parseInt(state.totalBudget.replace(/,/g, "")) || 0;

  // ── Package pattern recognition ──────────────────────────────────────────
  // Detect if current talents' roles match a known package (when no package is selected)
  const recognisedPackage: PackageConfig | null = (() => {
    if (selectedPkg || dismissedPattern || talents.length === 0) return null;
    const talentRoles = talents.map((t) => t.primaryRole || "").filter(Boolean);
    if (talentRoles.length === 0) return null;
    
    let bestMatch: { pkg: PackageConfig; matchScore: number } | null = null;
    for (const pkg of PACKAGES) {
      const required = [...new Set(pkg.roles)];
      const matched = required.filter((r) => talentRoles.includes(r));
      const score = matched.length / required.length;
      if (score >= 0.6) { // 60%+ role match
        if (!bestMatch || score > bestMatch.matchScore) {
          bestMatch = { pkg, matchScore: score };
        }
      }
    }
    return bestMatch?.pkg ?? null;
  })();

  const missingRoles: string[] = (() => {
    if (!recognisedPackage) return [];
    const required = [...new Set(recognisedPackage.roles)];
    const talentRoles = talents.map((t) => t.primaryRole || "");
    return required.filter((r) => !talentRoles.includes(r));
  })();

  const update = useCallback(<K extends keyof CampaignBoardState>(
    key: K,
    value: CampaignBoardState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addDeliverable = () => {
    const newD: StructuredDeliverable = {
      id: uid(),
      platform: "Instagram",
      format: "",
      quantity: 1,
      dueDate: "",
      assignedTalentId: null,
    };
    update("deliverables", [...state.deliverables, newD]);
  };

  const updateDeliverable = (id: string, updated: StructuredDeliverable) => {
    update(
      "deliverables",
      state.deliverables.map((d) => (d.id === id ? updated : d))
    );
  };

  const removeDeliverable = (id: string) => {
    update(
      "deliverables",
      state.deliverables.filter((d) => d.id !== id)
    );
  };

  const updateTalentAddOns = (talentId: string, updated: TalentAddOns) => {
    setState((prev) => ({
      ...prev,
      talentAddOns: { ...prev.talentAddOns, [talentId]: updated },
    }));
  };

  // ── Confirm & Submit ─────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignDescription: state.campaignName,
          email: "",               // populated server-side from session
          talentIds: talents.map((t) => t.id),
          budgetRange: state.totalBudget,
          bookingType: state.bookingType === "retainer" ? "long" : "short",
          startDate: state.startDate || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Request failed (${res.status})`);
      }
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ── SOW Generation helper ────────────────────────────────────────────────
  const generateSOWText = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" });
    const lines: string[] = [];

    lines.push(`STATEMENT OF WORK`);
    lines.push(`Creator Hive — Campaign Agreement`);
    lines.push(`Generated: ${dateStr}`);
    lines.push(``);
    lines.push(`Campaign: ${state.campaignName || "Untitled Campaign"}`);
    if (selectedPkg) lines.push(`Package: ${selectedPkg.name}`);
    lines.push(`Objective: ${state.objective ? state.objective.charAt(0).toUpperCase() + state.objective.slice(1) : "—"}`);
    lines.push(`Booking Type: ${state.bookingType === "retainer" ? "Monthly Retainer" : "Per Campaign"}`);
    if (state.startDate || state.endDate) {
      lines.push(`Campaign Dates: ${state.startDate || "TBD"} → ${state.endDate || "TBD"}`);
    }
    lines.push(``);
    if (state.totalBudget) {
      const budget = parseInt(state.totalBudget.replace(/,/g, "")) || 0;
      const platformFee = Math.round(budget * 0.12);
      const vat = Math.round((budget + platformFee) * 0.05);
      lines.push(`FINANCIALS`);
      lines.push(`Campaign Budget: AED ${budget.toLocaleString()}`);
      lines.push(`Platform Fee (12%): AED ${platformFee.toLocaleString()}`);
      lines.push(`VAT (5%): AED ${vat.toLocaleString()}`);
      lines.push(`Total: AED ${(budget + platformFee + vat).toLocaleString()}`);
      const payOpt = PAYMENT_SCHEDULE_OPTIONS.find(p => p.value === state.paymentSchedule);
      lines.push(`Payment Schedule: ${payOpt?.label} — ${payOpt?.description}`);
      lines.push(``);
    }
    lines.push(`TALENT`);
    talents.forEach((t) => {
      lines.push(`  • ${t.name}${t.primaryRole ? ` — ${t.primaryRole}` : ""}`);
      const addOns = state.talentAddOns[t.id];
      if (addOns) {
        if (addOns.usageRights !== "none") {
          lines.push(`    Usage Rights: ${USAGE_RIGHTS_OPTIONS.find(u => u.value === addOns.usageRights)?.label}`);
        }
        if (addOns.whitelisting) lines.push(`    Whitelisting: Yes (+10%)`);
        if (addOns.exclusivity) lines.push(`    Exclusivity: Yes (+25%)`);
        if (addOns.notes) lines.push(`    Notes: ${addOns.notes}`);
      }
    });
    lines.push(``);
    if (state.deliverables.length > 0) {
      lines.push(`DELIVERABLES`);
      state.deliverables.forEach((d, i) => {
        lines.push(`  ${i + 1}. ${d.quantity}× ${d.format || "TBD"} (${d.platform})${d.dueDate ? ` — Due ${d.dueDate}` : ""}`);
      });
      lines.push(``);
    }
    lines.push(`TERMS`);
    lines.push(`This Statement of Work is issued by Creator Hive (FZE), Ras Al Khaimah, UAE.`);
    lines.push(`All work is subject to Creator Hive's Terms & Conditions and applicable UAE law.`);
    lines.push(`Talent will be notified and required to confirm acceptance before work commences.`);
    lines.push(`Escrow-backed: funds held by Creator Hive until delivery milestones are approved.`);
    lines.push(``);
    lines.push(`[Signature block will be added upon talent acceptance]`);

    return lines.join("\n");
  };

  const handleDownloadSOW = () => {
    const text = generateSOWText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CreatorHive_SOW_${(state.campaignName || "Campaign").replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (submitted) {
    const budget = parseInt(state.totalBudget.replace(/,/g, "")) || 0;
    const platformFee = Math.round(budget * 0.12);
    const vat = Math.round((budget + platformFee) * 0.05);
    const totalDue = budget + platformFee + vat;

    return (
      <div className="relative w-full min-h-[480px]">
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* Emerald glow */}
        <div className="absolute inset-x-0 top-0 h-[200px] pointer-events-none z-0" style={{ background: "radial-gradient(60% 40% at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 100%)" }} />

        <div className="relative z-10 max-w-[780px] mx-auto px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="space-y-8"
          >
            {/* Success header */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/[0.12] ring-1 ring-emerald-400/[0.25] flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-[26px] font-light text-white/90 tracking-[-0.025em] mb-2">
                Campaign request sent
              </h3>
              <p className="text-[13px] text-white/38 max-w-[400px] mx-auto leading-relaxed">
                Your pod has been notified. Track progress, manage deliverables, and release payments in your dashboard.
              </p>
            </div>

            {/* SOW Card */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
              {/* SOW header */}
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

              {/* SOW preview body */}
              <div className="px-6 py-5 space-y-4">
                {/* Summary grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Campaign", value: state.campaignName || "Untitled" },
                    { label: "Talent", value: `${talents.length} creator${talents.length !== 1 ? "s" : ""}` },
                    { label: "Deliverables", value: `${state.deliverables.length} item${state.deliverables.length !== 1 ? "s" : ""}` },
                    { label: "Total Due", value: budget ? `AED ${totalDue.toLocaleString()}` : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl bg-white/[0.035] border border-white/[0.06] px-3 py-2.5">
                      <p className="text-[9px] uppercase tracking-[0.10em] text-white/28 mb-1">{label}</p>
                      <p className="text-[12px] text-white/75 font-light truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Payment breakdown */}
                {budget > 0 && (
                  <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] px-4 py-3">
                    <p className="text-[9px] uppercase tracking-[0.10em] text-white/25 mb-2.5">Payment Breakdown</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-white/45">Campaign Budget</span>
                        <span className="text-[11px] text-white/65 font-medium">AED {budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-white/30">Platform Fee (12%)</span>
                        <span className="text-[11px] text-white/42">AED {platformFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-white/30">VAT (5%)</span>
                        <span className="text-[11px] text-white/42">AED {vat.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/[0.06]">
                        <span className="text-[12px] text-white/60 font-medium">Total</span>
                        <span className="text-[13px] text-white/88 font-medium">AED {totalDue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment schedule */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.025] border border-white/[0.05]">
                  <span className="text-[11px] text-white/35">Payment Schedule</span>
                  <span className="text-[11px] text-white/65">
                    {PAYMENT_SCHEDULE_OPTIONS.find(p => p.value === state.paymentSchedule)?.label}
                  </span>
                </div>

                {/* SOW note */}
                <p className="text-[10px] text-white/22 leading-relaxed">
                  This SOW is auto-generated. Talent will receive and must accept before work begins.
                  Escrow-backed: Creator Hive holds funds until each delivery milestone is approved.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDownloadSOW}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.07] ring-1 ring-white/[0.10] text-[12px] text-white/60 hover:bg-white/[0.12] hover:text-white/85 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download SOW
              </button>
              <button
                type="button"
                onClick={() => { onClear(); onClose(); }}
                className="px-5 py-2.5 rounded-xl bg-white text-[#0B0F14] text-[12px] font-medium hover:bg-white/90 transition-colors"
              >
                Back to discovery
              </button>
              <a
                href="/dashboard/campaigns?mode=track"
                className="px-5 py-2.5 rounded-xl bg-white/[0.07] ring-1 ring-white/[0.10] text-[12px] text-white/60 hover:bg-white/[0.12] hover:text-white/85 transition-all"
              >
                Go to dashboard →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[400px]">
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Purple glow */}
      <div
        className="absolute inset-x-0 top-0 h-[280px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(70% 50% at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-10 py-14">
        <AnimatePresence mode="wait">
          {showReview ? (
            <motion.div key="review">
              <ReviewModal
                state={state}
                talents={talents}
                selectedPkg={selectedPkg ?? null}
                onBack={() => setShowReview(false)}
                onConfirm={handleConfirm}
                submitting={submitting}
                submitError={submitError}
              />
            </motion.div>
          ) : (
            <motion.div
              key="board"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* ── Board Header ── */}
              <div className="flex items-start justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {selectedPkg && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.07] ring-1 ring-white/[0.10] text-white/45">
                        {selectedPkg.emoji} {selectedPkg.name}
                      </span>
                    )}
                  </div>
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

              {/* ── Recognised Pattern Banner ── */}
              {recognisedPackage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-violet-500/[0.08] border border-violet-400/[0.18]"
                >
                  <Sparkles className="w-4 h-4 text-violet-400/70 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-white/75 font-medium">
                      Recognised pattern: <span className="text-violet-300/80">{recognisedPackage.emoji} {recognisedPackage.name}</span>
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      {missingRoles.length > 0
                        ? `You're ${missingRoles.length} role${missingRoles.length > 1 ? "s" : ""} away from completing this package — missing: ${missingRoles.slice(0, 3).join(", ")}${missingRoles.length > 3 ? ` +${missingRoles.length - 3}` : ""}`
                        : "Your pod matches this package template"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        // Apply package template: pre-fill deliverables, objective, budget hint
                        const deliverables = recognisedPackage.deliverableTemplates.map((dt) => ({
                          id: uid(),
                          platform: dt.platform,
                          format: dt.format,
                          quantity: dt.quantity,
                          dueDate: "",
                          assignedTalentId: null,
                        }));
                        setState((prev) => ({
                          ...prev,
                          objective: recognisedPackage.defaultObjective,
                          bookingType: recognisedPackage.bookingType,
                          deliverables,
                        }));
                        setDismissedPattern(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-violet-500/[0.18] text-violet-300/80 text-[11px] hover:bg-violet-500/[0.28] transition-colors"
                    >
                      Apply template
                    </button>
                    <button
                      type="button"
                      onClick={() => setDismissedPattern(true)}
                      className="text-white/20 hover:text-white/50 transition-colors text-[13px]"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Campaign Name ── */}
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
                {/* ── Left column: brief + deliverables ── */}
                <div className="lg:col-span-2 space-y-8">

                  {/* Objective */}
                  <div>
                    <span className={labelCls}>Campaign Objective</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {OBJECTIVES.map((obj) => (
                        <button
                          key={obj.value}
                          type="button"
                          onClick={() => update("objective", obj.value)}
                          className={cn(
                            "rounded-xl px-3 py-3 text-left ring-1 transition-all duration-150",
                            state.objective === obj.value
                              ? "bg-white/[0.11] ring-white/[0.22] text-white/95"
                              : "bg-transparent ring-white/[0.08] text-white/40 hover:bg-white/[0.06] hover:text-white/65"
                          )}
                        >
                          <p className="text-[12px] font-medium">{obj.label}</p>
                          <p className="text-[10px] mt-0.5 opacity-60">{obj.description}</p>
                        </button>
                      ))}
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

                  {/* Structured Deliverables */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={labelCls}>Deliverables</span>
                      <button
                        type="button"
                        onClick={addDeliverable}
                        className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/65 transition-colors duration-150"
                      >
                        <Plus className="w-3 h-3" />
                        Add deliverable
                      </button>
                    </div>

                    {/* Column labels */}
                    {state.deliverables.length > 0 && (
                      <div className="flex gap-2 mb-2 px-0.5">
                        <span className="text-[9px] uppercase tracking-[0.09em] text-white/20 w-[130px] shrink-0">Platform</span>
                        <span className="text-[9px] uppercase tracking-[0.09em] text-white/20 flex-1">Format</span>
                        <span className="text-[9px] uppercase tracking-[0.09em] text-white/20 w-[64px] shrink-0 text-center">Qty</span>
                        <span className="text-[9px] uppercase tracking-[0.09em] text-white/20 w-[140px] shrink-0">Due Date</span>
                        <span className="text-[9px] uppercase tracking-[0.09em] text-white/20 w-[120px] shrink-0">Talent</span>
                        <span className="w-8 shrink-0" />
                      </div>
                    )}

                    <div className="space-y-2">
                      {state.deliverables.map((d) => (
                        <DeliverableRow
                          key={d.id}
                          d={d}
                          talents={talents}
                          onChange={(updated) => updateDeliverable(d.id, updated)}
                          onRemove={() => removeDeliverable(d.id)}
                        />
                      ))}
                    </div>

                    {state.deliverables.length === 0 && (
                      <button
                        type="button"
                        onClick={addDeliverable}
                        className="w-full py-6 rounded-xl border border-dashed border-white/[0.10] text-[12px] text-white/28 hover:border-white/[0.20] hover:text-white/45 hover:bg-white/[0.025] transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add first deliverable
                      </button>
                    )}
                  </div>

                  {/* Talent Add-Ons */}
                  {talents.length > 0 && (
                    <div>
                      <span className={labelCls}>Per-Talent Add-Ons</span>
                      <div className="space-y-2">
                        {talents.map((t) => (
                          <TalentAddOnsPanel
                            key={t.id}
                            talent={t}
                            addOns={state.talentAddOns[t.id] || { usageRights: "none", whitelisting: false, exclusivity: false, notes: "" }}
                            onChange={(updated) => updateTalentAddOns(t.id, updated)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Right column: budget + payment ── */}
                <div className="space-y-6">

                  {/* Total budget */}
                  <div>
                    <span className={labelCls}>Total Campaign Budget</span>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-white/30 pointer-events-none">
                        AED
                      </span>
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

                  {/* Budget split preview */}
                  <BudgetSplitPreview
                    talents={talents}
                    totalBudget={totalBudgetNum}
                    selectedPkg={selectedPkg ?? null}
                  />

                  {/* Payment schedule */}
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
                </div>
              </div>

              {/* ── Board Footer ── */}
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
                    {state.deliverables.length} deliverable{state.deliverables.length !== 1 ? "s" : ""} ·{" "}
                    {talents.length} talent{talents.length !== 1 ? "s" : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowReview(true)}
                    disabled={!state.campaignName || !state.objective}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[13px] font-medium transition-all shadow-[0_4px_28px_rgba(255,255,255,0.10)]",
                      state.campaignName && state.objective
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
