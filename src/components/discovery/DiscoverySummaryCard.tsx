"use client";

import { Phone, ArrowRight, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { getObjectiveLabel, getTimingLabel, getBudgetLabel } from "@/lib/discovery";

interface Props {
  brief: {
    primaryObjective?: string | null;
    requestedRoles?: string[];
    startTiming?: string | null;
    budgetRange?: string | null;
    companyName?: string | null;
    industry?: string | null;
  } | null;
  onAdvisor?: () => void;
  onBrowseTalent?: () => void;
  onEdit?: () => void;
}

export function DiscoverySummaryCard({ brief, onAdvisor, onBrowseTalent, onEdit }: Props) {
  if (!brief) return null;

  const rows = [
    brief.primaryObjective ? ["Objective", getObjectiveLabel(brief.primaryObjective)] : null,
    brief.requestedRoles?.length ? ["Roles", brief.requestedRoles.slice(0, 3).join(", ") + (brief.requestedRoles.length > 3 ? ` +${brief.requestedRoles.length - 3}` : "")] : null,
    brief.startTiming ? ["Timeline", getTimingLabel(brief.startTiming)] : null,
    brief.budgetRange ? ["Budget", getBudgetLabel(brief.budgetRange)] : null,
    brief.companyName ? ["Brand", brief.companyName] : null,
    brief.industry ? ["Industry", brief.industry] : null,
  ].filter((r): r is string[] => r !== null);

  return (
    <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.08] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">Your discovery brief</p>
        {onEdit && (
          <button onClick={onEdit} className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/55 transition">
            <Pencil size={10} /> Edit
          </button>
        )}
      </div>

      {/* Rows */}
      <div className="px-4 py-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[11px] text-white/20">{label}</span>
            <span className="text-[12px] text-white/55 text-right max-w-[60%] truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {onBrowseTalent && (
          <button onClick={onBrowseTalent}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] bg-white/[0.06] ring-1 ring-white/[0.08] text-white/60 hover:bg-white/[0.10] transition">
            Browse talent <ArrowRight size={12} />
          </button>
        )}
        {onAdvisor && (
          <button onClick={onAdvisor}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] text-white/30 hover:text-white/55 transition ring-1 ring-white/[0.06] hover:ring-white/[0.10]">
            <Phone size={11} /> Advisor
          </button>
        )}
      </div>
    </div>
  );
}
