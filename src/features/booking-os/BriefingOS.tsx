"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import type { BriefDraft } from "./types";
import { BRIEF_STORAGE_KEY, createEmptyBriefDraft } from "./types";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

const OBJECTIVES = ["Awareness", "Growth", "Conversions", "Launch"] as const;
const OUTPUTS = [
  "UGC",
  "Edited video",
  "Photo shoot",
  "Social management",
  "Design",
  "Performance",
  "Web build",
];
const PLATFORMS = ["TikTok", "Instagram", "YouTube", "Snapchat", "LinkedIn"];
const MARKETS = ["UAE", "KSA", "GCC", "Global"];
const LANGUAGES = ["EN", "AR", "Both"];
const TIMELINES = ["ASAP", "This month", "Next month", "Flexible"] as const;

const STEP_VIEWPORT_HEIGHT = 360;
const WIZARD_MAX_W = 720;

type BriefingOSProps = {
  initialRoles: string[];
  onComplete: (draft: BriefDraft) => void;
  onBack: () => void;
};

export function BriefingOS({ initialRoles, onComplete, onBack }: BriefingOSProps) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<BriefDraft>(createEmptyBriefDraft());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BRIEF_STORAGE_KEY);
      const parsed = stored ? (JSON.parse(stored) as BriefDraft) : null;
      setDraft((prev) => ({
        ...createEmptyBriefDraft(),
        ...(parsed ?? prev),
        roles: initialRoles.length > 0 ? initialRoles : (parsed?.roles ?? prev.roles ?? []),
      }));
    } catch {
      setDraft((prev) => ({ ...prev, roles: initialRoles }));
    }
  }, [initialRoles]);

  useEffect(() => {
    localStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(draft));
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 800);
    return () => clearTimeout(t);
  }, [draft]);

  const toggleArray = (key: "outputs" | "platforms" | "references", value: string) => {
    setDraft((prev) => {
      const arr = prev[key] as string[];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  };

  const setSingle = <K extends keyof BriefDraft>(key: K, value: BriefDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const canComplete = draft.roles.length > 0 || draft.objective !== null;
  const handleComplete = () => {
    if (canComplete) onComplete(draft);
  };

  const totalSteps = 3;
  const canNext = step < totalSteps;
  const canPrev = step > 1;

  return (
    <div className="relative w-full mx-auto rounded-2xl bg-[#0F141A]/90 ring-1 ring-white/15 shadow-xl overflow-hidden" style={{ maxWidth: WIZARD_MAX_W }}>
      {/* Inner depth gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-white/[0.03] to-transparent pointer-events-none" />
      <div className="relative p-6 md:p-8 flex flex-col">
        {/* Fixed header row */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-white/60 hover:text-white/80 transition"
          >
            ← Back
          </button>
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
            {String(step).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
          </span>
          {saved && <span className="text-[11px] text-white/50">Saved</span>}
        </div>

        {/* Step viewport: fixed height, horizontal slide */}
        <div
          className="relative overflow-hidden"
          style={{ minHeight: STEP_VIEWPORT_HEIGHT }}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              width: `${totalSteps * 100}%`,
              transform: `translateX(-${((step - 1) / totalSteps) * 100}%)`,
            }}
          >
            {/* Step 1 */}
            <div className="flex-shrink-0 w-1/3 px-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/90 mb-3">Objective & outputs</h3>
                <div>
                  <p className="text-[11px] text-white/60 mb-2">Primary objective</p>
                  <div className="flex flex-wrap gap-2">
                    {OBJECTIVES.map((o) => (
                      <Chip
                        key={o}
                        selected={draft.objective === o}
                        onClick={() => setSingle("objective", draft.objective === o ? null : o)}
                      >
                        {o}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-white/60 mb-2">Outputs needed</p>
                  <div className="flex flex-wrap gap-2">
                    {OUTPUTS.map((o) => (
                      <Chip
                        key={o}
                        selected={draft.outputs.includes(o)}
                        onClick={() => toggleArray("outputs", o)}
                      >
                        {o}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-white/60 mb-2">Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <Chip
                        key={p}
                        selected={draft.platforms.includes(p)}
                        onClick={() => toggleArray("platforms", p)}
                      >
                        {p}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex-shrink-0 w-1/3 px-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/90 mb-3">Context</h3>
                <div>
                  <p className="text-[11px] text-white/60 mb-2">Industry</p>
                  <input
                    type="text"
                    value={draft.industry ?? ""}
                    onChange={(e) => setSingle("industry", e.target.value || null)}
                    placeholder="e.g. Fashion, F&B, Tech"
                    className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/20"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-white/60 mb-2">Market</p>
                  <div className="flex flex-wrap gap-2">
                    {MARKETS.map((m) => (
                      <Chip
                        key={m}
                        selected={draft.market === m}
                        onClick={() => setSingle("market", draft.market === m ? null : m)}
                      >
                        {m}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-white/60 mb-2">Language</p>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((l) => (
                      <Chip
                        key={l}
                        selected={draft.language === l}
                        onClick={() => setSingle("language", draft.language === l ? null : l)}
                      >
                        {l}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-white/60 mb-2">Key message (short)</p>
                  <input
                    type="text"
                    value={draft.keyMessage ?? ""}
                    onChange={(e) => setSingle("keyMessage", e.target.value || null)}
                    placeholder="One-liner or main hook"
                    className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/20"
                  />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex-shrink-0 w-1/3 px-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/90 mb-3">Timeline & budget</h3>
                <div>
                  <p className="text-[11px] text-white/60 mb-2">Timeline</p>
                  <div className="flex flex-wrap gap-2">
                    {TIMELINES.map((t) => (
                      <Chip
                        key={t}
                        selected={draft.timeline === t}
                        onClick={() => setSingle("timeline", draft.timeline === t ? null : t)}
                      >
                        {t}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-white/60 mb-2">Budget range</p>
                  <input
                    type="text"
                    value={draft.budgetRange ?? ""}
                    onChange={(e) => setSingle("budgetRange", e.target.value || null)}
                    placeholder="e.g. $5,000 – $10,000"
                    className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/20"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-white/60 mb-2">Reference link (optional)</p>
                  <input
                    type="url"
                    value={(draft.references as string[])[0] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      setDraft((prev) => ({ ...prev, references: v ? [v] : [] }));
                    }}
                    placeholder="https://..."
                    className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed footer nav */}
        <div className="mt-6 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={!canPrev}
            className={cn(
              "flex items-center gap-1 rounded-full px-4 py-2 text-xs transition",
              canPrev ? "text-white/70 hover:bg-white/5" : "text-white/30 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          {canNext ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-full bg-white/15 px-5 py-2 text-xs font-medium text-white ring-1 ring-white/15 hover:bg-white/20 transition"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={!canComplete}
              className={cn(
                "rounded-full px-5 py-2 text-xs font-medium transition",
                canComplete
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/10 text-white/50 cursor-not-allowed"
              )}
            >
              Find talent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
