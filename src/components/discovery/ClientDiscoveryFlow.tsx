"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Phone, Sparkles, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDiscoveryStore } from "@/store/useDiscoveryStore";
import {
  DISCOVERY_OBJECTIVES,
  DISCOVERY_ROLES,
  DISCOVERY_TIMING,
  DISCOVERY_BUDGET,
  getObjectiveLabel,
  getTimingLabel,
  getBudgetLabel,
} from "@/lib/discovery";
import { FuzzyPillSelector } from "./FuzzyPillSelector";
import { IndustrySelector } from "./IndustrySelector";

interface Props {
  onComplete: () => void;
  onAdvisor: () => void;
  initialStep?: number;
}

const STEPS = ["Objective", "Scope", "Summary"];

/* ─── Analytics helper (PostHog client-side) ─── */
function track(event: string, props?: Record<string, unknown>) {
  try {
    const w = window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } };
    w.posthog?.capture(event, props);
  } catch { /* silent */ }
}

export function ClientDiscoveryFlow({ onComplete, onAdvisor, initialStep = 0 }: Props) {
  const router = useRouter();
  const store = useDiscoveryStore();
  const [step, setStep] = useState(initialStep);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    track("discovery_started", { initialStep });
    return () => mq.removeEventListener("change", apply);
  }, []);

  const saveProgress = useCallback(async (completed = false) => {
    try {
      await fetch("/api/discovery/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryObjective: store.primaryObjective,
          rankedObjectives: store.rankedObjectives,
          requestedRoles: store.requestedRoles,
          startTiming: store.startTiming,
          budgetRange: store.budgetRange,
          companyName: store.companyName,
          industry: store.industry,
          notes: store.notes,
          currentStep: step,
          completed,
        }),
      });
    } catch { /* zustand has local backup */ }
  }, [store, step]);

  const goNext = useCallback(() => {
    if (step < 2) { setDir(1); const n = step + 1; setStep(n); store.setStep(n); saveProgress(); track("discovery_step_completed", { step }); }
  }, [step, store, saveProgress]);

  const goBack = useCallback(() => {
    if (step > 0) { setDir(-1); const p = step - 1; setStep(p); store.setStep(p); }
  }, [step, store]);

  const handleComplete = useCallback(async () => {
    setSaving(true);
    await saveProgress(true);
    store.complete();
    track("discovery_completed", {
      objective: store.primaryObjective,
      roles: store.requestedRoles,
      budget: store.budgetRange,
      timing: store.startTiming,
    });
    setSaving(false);
    onComplete();
  }, [saveProgress, store, onComplete]);

  const canProceed = step === 0
    ? store.rankedObjectives.length > 0
    : step === 1
    ? store.startTiming !== "" && store.budgetRange !== ""
    : true;

  const anim = dir >= 0
    ? { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } }
    : { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 40 } };

  /* ─── Shared pill component ─── */
  const Pill = ({ active, label, onClick, size = "md" }: { active: boolean; label: string; onClick: () => void; size?: "sm" | "md" }) => (
    <button type="button" onClick={onClick}
      className={cn(
        "rounded-full transition-all duration-150",
        size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3.5 py-2 text-[12px]",
        active
          ? "bg-white text-black font-medium"
          : "bg-white/[0.04] text-white/40 ring-1 ring-white/[0.06] hover:bg-white/[0.08]",
      )}
    >{label}</button>
  );

  /* ─── Shared objective card — ranked multi-select ─── */
  const ObjCard = ({ id, icon, label, compact }: { id: string; icon: string; label: string; compact?: boolean }) => {
    const rank = store.rankedObjectives.indexOf(id); // -1 = not selected
    const active = rank !== -1;
    const maxed = !active && store.rankedObjectives.length >= 3;
    return (
      <button type="button"
        onClick={() => store.toggleObjective(id)}
        disabled={maxed}
        className={cn(
          "text-left rounded-2xl transition-all duration-150 relative",
          compact ? "px-3 py-2.5" : "px-4 py-3.5",
          active
            ? "bg-white/[0.10] ring-1 ring-white/25"
            : maxed
            ? "bg-white/[0.02] ring-1 ring-white/[0.04] opacity-40 cursor-not-allowed"
            : "bg-white/[0.03] ring-1 ring-white/[0.06] hover:bg-white/[0.06]",
        )}
      >
        {active && (
          <span className={cn(
            "absolute top-2 right-2 flex items-center justify-center rounded-full font-bold text-black",
            compact ? "w-4 h-4 text-[9px]" : "w-5 h-5 text-[10px]",
          )} style={{ background: "rgba(255,255,255,0.90)" }}>
            {rank + 1}
          </span>
        )}
        <span className={cn("block", compact ? "text-[14px] mb-0.5" : "text-[18px] mb-1.5")}>{icon}</span>
        <span className={cn("leading-tight block", compact ? "text-[11px]" : "text-[13px]", active ? "text-white/90" : "text-white/50")}>{label}</span>
      </button>
    );
  };

  /* ─── Shared CTA ─── */
  const CTA = ({ label, onClick, disabled, loading, variant = "primary" }: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean; variant?: "primary" | "accent" }) => (
    <button onClick={onClick} disabled={disabled || loading}
      className={cn(
        "rounded-xl font-medium transition-all flex items-center justify-center gap-2",
        isMobile ? "w-full py-3 text-[13px]" : "px-8 py-3.5 text-[14px]",
        variant === "accent"
          ? "bg-white text-black hover:bg-white/90 disabled:opacity-50"
          : disabled
            ? "bg-white/[0.03] ring-1 ring-white/[0.06] text-white/20 cursor-not-allowed"
            : "bg-white/[0.10] ring-1 ring-white/[0.15] text-white/90 hover:bg-white/[0.14]",
      )}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {label} {!loading && variant !== "accent" && <ArrowRight size={15} />}
      {!loading && variant === "accent" && <Sparkles size={14} />}
    </button>
  );

  /* ─── Summary rows ─── */
  const summaryRows = [
    ["Objectives", store.rankedObjectives.length > 0
      ? store.rankedObjectives.map((id, i) => `${i + 1}. ${getObjectiveLabel(id)}`).join(" · ")
      : "—"],
    ["Roles", store.requestedRoles.length > 0 ? store.requestedRoles.join(", ") : "Any"],
    ["Timeline", getTimingLabel(store.startTiming)],
    ["Budget", getBudgetLabel(store.budgetRange)],
    store.companyName ? ["Company", store.companyName] : null,
    store.industry ? ["Industry", store.industry] : null,
  ].filter((r): r is string[] => r !== null);

  /* ═══════════════════════════════════════════════════════════
     RETURN — outer shell (shared), inner layout splits
  ═══════════════════════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#07070B]">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[70vh] rounded-full"
          style={{ background: "radial-gradient(ellipse, #7c3aed 0%, #4c1d95 60%, transparent 100%)", filter: "blur(180px)", opacity: 0.10 }} />
      </div>

      {/* ─── Header ─── */}
      <header className={cn(
        "relative z-10 flex items-center justify-between",
        isMobile ? "px-4 pt-[max(env(safe-area-inset-top,8px),8px)] pb-2" : "px-8 pt-6 pb-4",
      )}>
        <button onClick={step > 0 ? goBack : () => router.back()}
          className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition py-2">
          <ArrowLeft size={14} /> {step > 0 ? "Back" : "Exit"}
        </button>
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className={cn(
              "h-1 rounded-full transition-all duration-500",
              i <= step ? "bg-white/70" : "bg-white/10",
              i <= step ? (isMobile ? "w-5" : "w-8") : "w-1.5",
            )} />
          ))}
        </div>
        <button onClick={onAdvisor}
          className={cn(
            "flex items-center gap-1.5 text-white/30 hover:text-white/55 transition py-2",
            isMobile ? "text-[10px]" : "text-[12px]",
          )}>
          <Phone size={isMobile ? 11 : 13} /> {isMobile ? "Talk to us" : "Talk to an advisor"}
        </button>
      </header>

      {/* ─── Content area ─── */}
      <div className={cn(
        "relative z-10 flex-1 flex flex-col overflow-hidden",
        isMobile
          ? "justify-between px-4 pb-[max(env(safe-area-inset-bottom,12px),12px)]"
          : "justify-center px-8 pb-8",
      )}>
        <AnimatePresence mode="wait" custom={dir}>

          {/* ═══════════════════════════════════════
             STEP 0 — OBJECTIVE
          ═══════════════════════════════════════ */}
          {step === 0 && (
            <motion.div key="s0" {...anim} transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "flex w-full mx-auto",
                isMobile ? "flex-col gap-3 max-w-lg" : "flex-col gap-6 max-w-2xl",
              )}
            >
              {/* Heading */}
              <div>
                <p className={cn("font-semibold uppercase tracking-[0.18em] text-white/20", isMobile ? "text-[9px] mb-1" : "text-[10px] mb-2")}>Step 1 of 3</p>
                <h2 className={cn("font-medium tracking-[-0.02em] text-white leading-tight", isMobile ? "text-[20px]" : "text-[32px]")}>
                  What are you trying to achieve?
                </h2>
                <p className={cn("text-white/30 mt-1", isMobile ? "text-[11px]" : "text-[13px]")}>
                  Pick up to 3 in priority order — tap to rank
                </p>
              </div>

              {/* Objective grid */}
              <div className={cn("grid gap-2", isMobile ? "grid-cols-2" : "grid-cols-4")}>
                {DISCOVERY_OBJECTIVES.map((obj) => (
                  <ObjCard key={obj.id} {...obj} compact={isMobile} />
                ))}
              </div>

              {/* Roles — fuzzy searchable with custom input */}
              <div>
                <FuzzyPillSelector
                  label="Roles you need"
                  hint="(optional)"
                  options={[...DISCOVERY_ROLES]}
                  selected={store.requestedRoles}
                  onChange={(roles) => store.setField("requestedRoles", roles)}
                  placeholder="Search roles…"
                  allowCustom={true}
                  size={isMobile ? "sm" : "md"}
                />
              </div>

              {/* CTA — desktop: right-aligned, mobile: full width at bottom */}
              <div className={cn(isMobile ? "" : "flex justify-end pt-2")}>
                <CTA label="Continue" onClick={goNext} disabled={!canProceed} />
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
             STEP 1 — SCOPE & BRAND
          ═══════════════════════════════════════ */}
          {step === 1 && (
            <motion.div key="s1" {...anim} transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "flex w-full mx-auto",
                isMobile ? "flex-col gap-3 max-w-lg" : "flex-col gap-5 max-w-2xl",
              )}
            >
              <div>
                <p className={cn("font-semibold uppercase tracking-[0.18em] text-white/20", isMobile ? "text-[9px] mb-1" : "text-[10px] mb-2")}>Step 2 of 3</p>
                <h2 className={cn("font-medium tracking-[-0.02em] text-white leading-tight", isMobile ? "text-[20px]" : "text-[32px]")}>
                  Scope & brand
                </h2>
              </div>

              {/* Desktop: 2-col layout / Mobile: stacked */}
              <div className={cn(isMobile ? "space-y-3" : "grid grid-cols-2 gap-6")}>
                {/* Left col — pills */}
                <div className="space-y-3">
                  <div>
                    <p className={cn("text-white/25 mb-1.5", isMobile ? "text-[10px]" : "text-[11px]")}>When do you want to start?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {DISCOVERY_TIMING.map((t) => (
                        <Pill key={t.id} active={store.startTiming === t.id} label={t.label}
                          onClick={() => store.setField("startTiming", store.startTiming === t.id ? "" : t.id)}
                          size={isMobile ? "sm" : "md"} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={cn("text-white/25 mb-1.5", isMobile ? "text-[10px]" : "text-[11px]")}>Budget comfort range</p>
                    <div className="flex flex-wrap gap-1.5">
                      {DISCOVERY_BUDGET.map((b) => (
                        <Pill key={b.id} active={store.budgetRange === b.id} label={b.label}
                          onClick={() => store.setField("budgetRange", store.budgetRange === b.id ? "" : b.id)}
                          size={isMobile ? "sm" : "md"} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right col — inputs */}
                <div className={cn(isMobile ? "grid grid-cols-2 gap-2" : "space-y-3")}>
                  <div>
                    <p className={cn("text-white/25", isMobile ? "text-[10px] mb-1" : "text-[11px] mb-1.5")}>Company / brand</p>
                    <input value={store.companyName}
                      onChange={(e) => store.setField("companyName", e.target.value)}
                      placeholder="Your brand"
                      className={cn(
                        "w-full rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] text-white/85 placeholder:text-white/20 outline-none focus:ring-white/20 transition",
                        isMobile ? "px-3 py-2 text-[12px]" : "px-3.5 py-2.5 text-[13px]",
                      )}
                    />
                  </div>
                  <div>
                    <p className={cn("text-white/25", isMobile ? "text-[10px] mb-1" : "text-[11px] mb-1.5")}>Industry</p>
                    <IndustrySelector
                      value={store.industry}
                      onChange={(v) => store.setField("industry", v)}
                    />
                  </div>
                </div>
              </div>

              <div className={cn(isMobile ? "" : "flex justify-end pt-2")}>
                <CTA label="Continue" onClick={goNext} disabled={!canProceed} />
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
             STEP 2 — SUMMARY & ROUTING
          ═══════════════════════════════════════ */}
          {step === 2 && (
            <motion.div key="s2" {...anim} transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "flex w-full mx-auto",
                isMobile ? "flex-col gap-4 max-w-lg" : "flex-col gap-6 max-w-2xl",
              )}
            >
              <div>
                <p className={cn("font-semibold uppercase tracking-[0.18em] text-white/20", isMobile ? "text-[9px] mb-1" : "text-[10px] mb-2")}>Step 3 of 3</p>
                <h2 className={cn("font-medium tracking-[-0.02em] text-white leading-tight", isMobile ? "text-[20px]" : "text-[32px]")}>
                  Your brief
                </h2>
                <p className={cn("text-white/30 mt-1", isMobile ? "text-[11px]" : "text-[14px]")}>
                  Review and add any extra context. We&apos;ll match you with the right talent.
                </p>
              </div>

              {/* Summary card — full width, clean rows */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {summaryRows.map(([label, value], i) => (
                  <div key={label}
                    className={cn("flex items-start justify-between px-5 py-3.5", i > 0 && "border-t border-white/[0.06]")}
                  >
                    <span className={cn("text-white/35 shrink-0 w-24", isMobile ? "text-[11px]" : "text-[12px]")}>{label}</span>
                    <span className={cn("text-white/75 text-right flex-1 min-w-0", isMobile ? "text-[12px]" : "text-[13px]")}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Notes — full width below summary */}
              <div>
                <p className={cn("text-white/25 mb-1.5", isMobile ? "text-[10px]" : "text-[11px]")}>Anything else? <span className="text-white/15">(optional, max 250 chars)</span></p>
                <textarea
                  value={store.notes}
                  onChange={(e) => store.setField("notes", e.target.value.slice(0, 250))}
                  maxLength={250}
                  rows={3}
                  placeholder="e.g. We're launching in Q2, need bilingual Arabic/English content…"
                  className={cn(
                    "w-full rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] text-white/85 placeholder:text-white/20 outline-none focus:ring-white/20 transition resize-none",
                    isMobile ? "px-3 py-2.5 text-[12px]" : "px-4 py-3 text-[13px]",
                  )}
                />
                {store.notes.length > 200 && (
                  <p className="text-[10px] text-right mt-1" style={{ color: "rgba(255,255,255,0.28)" }}>
                    {250 - store.notes.length} chars left
                  </p>
                )}
              </div>

              {/* CTAs */}
              <div className={cn("flex gap-3", isMobile ? "flex-col" : "justify-between items-center pt-1")}>
                <button onClick={onAdvisor}
                  className={cn(
                    "rounded-xl text-white/40 hover:text-white/65 transition ring-1 ring-white/[0.06] hover:ring-white/[0.12] flex items-center justify-center gap-1.5",
                    isMobile ? "py-2.5 text-[12px]" : "px-6 py-3 text-[13px]",
                  )}
                >
                  <Phone size={13} /> Speak to an advisor instead
                </button>
                <CTA label="Find my team" onClick={handleComplete} loading={saving} variant="accent" />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
