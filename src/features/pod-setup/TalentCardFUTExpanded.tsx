"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Talent } from "@/store/useCampaignPodStore";
import type { TalentPodConfig } from "@/types/pod";
import { calculateTalentRate, formatCurrency } from "@/lib/podPricing";
import { DurationControl } from "./DurationControl";
import { EngagementToggle } from "./EngagementToggle";
import { AddOnsChecklist } from "./AddOnsChecklist";
import { CurrencyAnimated } from "@/components/ui/currency-animated";
import { emeraldTheme } from "@/lib/theme";

interface TalentCardFUTExpandedProps {
  talent: Talent;
  config: TalentPodConfig;
  matchScore?: number;
  onUpdate: (updates: Partial<TalentPodConfig>) => void;
  onRemove: () => void;
  onCollapse: () => void;
}

export function TalentCardFUTExpanded({
  talent,
  config,
  matchScore = 85,
  onUpdate,
  onRemove,
  onCollapse,
}: TalentCardFUTExpandedProps) {
  const totalRate = calculateTalentRate(config);
  const primaryRole = talent.roles[0] || "Creator";

  return (
    <motion.div
      layout
      initial={{ height: 200, opacity: 0.9 }}
      animate={{ height: 500, opacity: 1 }}
      exit={{ height: 200, opacity: 0.9 }}
      transition={{ 
        duration: 0.35, 
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: 0.2 }
      }}
      className={cn(
        "relative w-[300px] rounded-2xl",
        "bg-gradient-to-br from-[#0a0d14] via-[#0f141a] to-[#0a0d14]",
        "border-2 border-emerald-500/60",
        "shadow-2xl shadow-emerald-500/30",
        "overflow-hidden",
        "backdrop-blur-sm"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Animated emerald glow border */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          background: [
            `linear-gradient(135deg, ${emeraldTheme.accent.glow} 0%, rgba(5, 150, 105, 0.3) 100%)`,
            `linear-gradient(135deg, rgba(16, 185, 129, 0.5) 0%, rgba(5, 150, 105, 0.4) 100%)`,
            `linear-gradient(135deg, ${emeraldTheme.accent.glow} 0%, rgba(5, 150, 105, 0.3) 100%)`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ filter: "blur(14px)", zIndex: -1 }}
      />

      {/* Top accent bar - emerald */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

      {/* Match Score badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg blur-sm opacity-60" />
          <div className="relative bg-gradient-to-br from-emerald-600 to-teal-600 px-3 py-1.5 rounded-lg border border-emerald-400/40 shadow-lg">
            <div className="text-[10px] font-black text-white/90 uppercase tracking-wider leading-none mb-0.5">
              MATCH
            </div>
            <div className="text-lg font-black text-white leading-none">{matchScore}</div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-lg ring-2 ring-emerald-400/40">
              {talent.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-black text-white">{talent.name}</div>
              <div className="text-[10px] text-white/60 font-medium">{primaryRole}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCollapse}
            className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 transition-colors border border-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[380px]">
        {/* Duration */}
        <div>
          <label className="block text-[10px] font-black text-white/80 uppercase tracking-wider mb-2">
            Duration
          </label>
          <DurationControl
            value={config.duration}
            onChange={(duration) => onUpdate({ duration })}
          />
        </div>

        {/* Engagement Type */}
        <div>
          <label className="block text-[10px] font-black text-white/80 uppercase tracking-wider mb-2">
            Engagement Type
          </label>
          <EngagementToggle
            value={config.engagementType}
            onChange={(engagementType) => onUpdate({ engagementType })}
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-[10px] font-black text-white/80 uppercase tracking-wider mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={config.dateRange.start ? config.dateRange.start.toISOString().split('T')[0] : ''}
              onChange={(e) => onUpdate({
                dateRange: {
                  ...config.dateRange,
                  start: e.target.value ? new Date(e.target.value) : null,
                },
              })}
              className="rounded-lg bg-white/5 px-2 py-1.5 text-[10px] text-white/90 border border-white/10 focus:border-emerald-500/50 focus:outline-none"
            />
            <input
              type="date"
              value={config.dateRange.end ? config.dateRange.end.toISOString().split('T')[0] : ''}
              onChange={(e) => onUpdate({
                dateRange: {
                  ...config.dateRange,
                  end: e.target.value ? new Date(e.target.value) : null,
                },
              })}
              className="rounded-lg bg-white/5 px-2 py-1.5 text-[10px] text-white/90 border border-white/10 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Add-ons */}
        <div>
          <label className="block text-[10px] font-black text-white/80 uppercase tracking-wider mb-2">
            Add-ons
          </label>
          <AddOnsChecklist
            value={config.addOns}
            onChange={(addOns) => onUpdate({ addOns })}
          />
        </div>

        {/* Total Cost - Prominent */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/70 uppercase tracking-wider">
              Total Cost
            </span>
            <CurrencyAnimated
              value={totalRate}
              className="text-lg font-black text-white"
            />
          </div>
        </div>
      </div>

      {/* Remove button */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent">
        <button
          type="button"
          onClick={onRemove}
          className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-black text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Remove from Pod
        </button>
      </div>
    </motion.div>
  );
}
