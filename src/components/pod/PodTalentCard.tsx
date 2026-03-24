"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { X, Calendar, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TalentPodConfig, EngagementType, AddOn } from "@/lib/podRates";
import { calculateTalentRate, formatCurrency } from "@/lib/podRates";
import type { Talent } from "@/store/useCampaignPodStore";

interface PodTalentCardProps {
  talent: Talent;
  config: TalentPodConfig;
  onUpdate: (updates: Partial<TalentPodConfig>) => void;
  onRemove: () => void;
}

export function PodTalentCard({ talent, config, onUpdate, onRemove }: PodTalentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalRate = calculateTalentRate(config);
  const primaryRole = talent.roles[0] || "Creator";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative rounded-2xl bg-white/5 border border-white/10",
        "hover:bg-white/8 hover:border-white/20 transition-all",
        isExpanded && "ring-2 ring-purple-500/50"
      )}
    >
      {/* Card Header - FIFA Style */}
      <div className="relative p-4 bg-gradient-to-br from-white/8 to-white/3">
        <div className="flex items-start gap-3">
          {/* Avatar - Larger, more prominent */}
          <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white/20">
            {talent.name.charAt(0)}
          </div>
          
          {/* Name & Role */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">
              {talent.name}
            </h3>
            <p className="text-xs text-white/70 mt-0.5 font-medium">{primaryRole}</p>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3 w-3 text-white/50" />
                <span className="text-white/50">Base:</span>
                <span className="font-semibold text-white/90">
                  {formatCurrency(config.baseDayRate)}/day
                </span>
              </div>
            </div>
          </div>
          
          {/* Remove Button */}
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 h-7 w-7 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center text-white/60 hover:text-red-400 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        
        {/* Total Rate Badge */}
        <div className="absolute top-4 right-12 px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/30">
          <span className="text-xs font-bold text-white">
            {formatCurrency(totalRate)}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4"
        >
          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-white/75 mb-2">
              Duration (days)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={config.duration}
                onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || 1 })}
                className="w-20 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/90 border border-white/10 focus:border-purple-500/50 focus:outline-none"
              />
              <span className="text-xs text-white/50">days</span>
            </div>
          </div>

          {/* Engagement Type */}
          <div>
            <label className="block text-xs font-medium text-white/75 mb-2">
              Engagement type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["per-project", "short-term", "long-term"] as EngagementType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onUpdate({ engagementType: type })}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-medium transition",
                    config.engagementType === type
                      ? "bg-purple-500/20 text-white border border-purple-500/50"
                      : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/8"
                  )}
                >
                  {type === "per-project" ? "Project" : type === "short-term" ? "Short" : "Long"}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-medium text-white/75 mb-2">
              Date range
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
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/90 border border-white/10 focus:border-purple-500/50 focus:outline-none"
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
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/90 border border-white/10 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <label className="block text-xs font-medium text-white/75 mb-2">
              Add-ons
            </label>
            <div className="space-y-2">
              {(["usage-rights", "whitelisting", "exclusivity"] as AddOn[]).map((addOn) => (
                <label
                  key={addOn}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={config.addOns.includes(addOn)}
                    onChange={(e) => {
                      const newAddOns = e.target.checked
                        ? [...config.addOns, addOn]
                        : config.addOns.filter(a => a !== addOn);
                      onUpdate({ addOns: newAddOns });
                    }}
                    className="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                  />
                  <span className="text-xs text-white/70 capitalize">
                    {addOn.replace("-", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Total Rate */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Total rate:</span>
              <span className="text-sm font-semibold text-white">
                {formatCurrency(totalRate)}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Toggle Expand Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 border-t border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-1"
      >
        {isExpanded ? "Show less" : "Configure"}
      </button>
    </motion.div>
  );
}

