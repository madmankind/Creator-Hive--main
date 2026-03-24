"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WeeklyKPIEntry {
  reach: number;
  impressions: number;
  engagements: number;
  spend: number;
}

const EMPTY_WEEK: WeeklyKPIEntry = { reach: 0, impressions: 0, engagements: 0, spend: 0 };

interface WeeklyKPITrackerProps {
  campaignId?: string;
  onDataChange?: (weeks: WeeklyKPIEntry[]) => void;
}

const FIELDS: { key: keyof WeeklyKPIEntry; label: string; prefix?: string }[] = [
  { key: "reach", label: "Reach" },
  { key: "impressions", label: "Impressions" },
  { key: "engagements", label: "Engagements" },
  { key: "spend", label: "Spend", prefix: "AED" },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function delta(curr: number, prev: number): { label: string; type: "up" | "down" | "flat" } {
  if (prev === 0 || curr === 0) return { label: "—", type: "flat" };
  const pct = ((curr - prev) / prev) * 100;
  if (Math.abs(pct) < 0.5) return { label: "0%", type: "flat" };
  return {
    label: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`,
    type: pct > 0 ? "up" : "down",
  };
}

function loadWeeks(campaignId: string): WeeklyKPIEntry[] {
  try {
    const raw = localStorage.getItem(`ch_weekly_kpi_${campaignId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [{ ...EMPTY_WEEK }, { ...EMPTY_WEEK }, { ...EMPTY_WEEK }, { ...EMPTY_WEEK }];
}

function saveWeeks(campaignId: string, weeks: WeeklyKPIEntry[]) {
  try {
    localStorage.setItem(`ch_weekly_kpi_${campaignId}`, JSON.stringify(weeks));
  } catch {}
}

export function WeeklyKPITracker({ campaignId, onDataChange }: WeeklyKPITrackerProps) {
  const id = campaignId ?? "default";
  const [weeks, setWeeks] = useState<WeeklyKPIEntry[]>(() => loadWeeks(id));
  const [activeWeek, setActiveWeek] = useState(0);

  const updateField = useCallback(
    (weekIdx: number, field: keyof WeeklyKPIEntry, value: string) => {
      const num = parseInt(value.replace(/[^0-9]/g, "")) || 0;
      setWeeks((prev) => {
        const next = prev.map((w, i) => (i === weekIdx ? { ...w, [field]: num } : w));
        saveWeeks(id, next);
        onDataChange?.(next);
        return next;
      });
    },
    [id, onDataChange]
  );

  const prev = activeWeek > 0 ? weeks[activeWeek - 1] : null;
  const curr = weeks[activeWeek];

  // Totals across all 4 weeks
  const totals = weeks.reduce(
    (acc, w) => ({
      reach: acc.reach + w.reach,
      impressions: acc.impressions + w.impressions,
      engagements: acc.engagements + w.engagements,
      spend: acc.spend + w.spend,
    }),
    { ...EMPTY_WEEK }
  );

  return (
    <div className="space-y-3">
      {/* Week selector pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveWeek((w) => Math.max(0, w - 1))}
          disabled={activeWeek === 0}
          className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 disabled:opacity-20 transition"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <ChevronLeft className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-1.5 flex-1">
          {[0, 1, 2, 3].map((i) => {
            const hasData = Object.values(weeks[i]).some((v) => v > 0);
            return (
              <button
                key={i}
                onClick={() => setActiveWeek(i)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-[11px] font-medium transition-all duration-150 text-center",
                  activeWeek === i
                    ? "bg-white/[0.11] ring-1 ring-white/[0.22] text-white"
                    : hasData
                      ? "bg-white/[0.04] ring-1 ring-white/[0.08] text-white/55 hover:bg-white/[0.07]"
                      : "bg-transparent ring-1 ring-white/[0.06] text-white/25 hover:text-white/45"
                )}
              >
                Week {i + 1}
                {hasData && activeWeek !== i && (
                  <span className="ml-1 inline-block w-1 h-1 rounded-full bg-emerald-400/60" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setActiveWeek((w) => Math.min(3, w + 1))}
          disabled={activeWeek === 3}
          className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 disabled:opacity-20 transition"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Input fields for active week */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeWeek}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-2 gap-2.5"
        >
          {FIELDS.map((f) => {
            const d = prev ? delta(curr[f.key], prev[f.key]) : null;
            return (
              <div
                key={f.key}
                className="rounded-xl px-3 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-white/30">
                    {f.label}
                  </span>
                  {d && d.type !== "flat" && (
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-[9px] font-medium",
                        d.type === "up" ? "text-emerald-400/70" : "text-red-400/70"
                      )}
                    >
                      {d.type === "up" ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                      )}
                      {d.label}
                    </span>
                  )}
                  {d && d.type === "flat" && d.label !== "—" && (
                    <span className="flex items-center gap-0.5 text-[9px] text-white/20">
                      <Minus className="w-2.5 h-2.5" />
                      {d.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {f.prefix && (
                    <span className="text-[11px] text-white/25 shrink-0">{f.prefix}</span>
                  )}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={curr[f.key] > 0 ? curr[f.key].toLocaleString() : ""}
                    onChange={(e) => updateField(activeWeek, f.key, e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent outline-none text-[15px] font-medium text-white/85 placeholder:text-white/15 tabular-nums"
                  />
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Monthly totals strip */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-xl"
        style={{
          background: "rgba(124,92,255,0.06)",
          border: "1px solid rgba(124,92,255,0.12)",
        }}
      >
        <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-purple-300/50">
          Month total
        </span>
        <div className="flex items-center gap-4">
          {FIELDS.map((f) => (
            <span key={f.key} className="text-[11px] text-white/55 tabular-nums">
              <span className="text-white/25 mr-1">{f.label.slice(0, 3)}</span>
              {f.prefix ? `${f.prefix} ${fmt(totals[f.key])}` : fmt(totals[f.key])}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
