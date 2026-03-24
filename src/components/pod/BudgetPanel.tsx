"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { DollarSign, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateTalentRate, formatCurrency } from "@/lib/podRates";
import type { TalentPodConfig } from "@/lib/podRates";
import type { Talent } from "@/store/useCampaignPodStore";

interface BudgetPanelProps {
  campaignBrief: string;
  campaignDuration: { start: Date | null; end: Date | null };
  talents: Talent[];
  talentConfigs: Map<string, TalentPodConfig>;
  budgetRange?: string;
  onUpdateBrief?: (brief: string) => void;
  onUpdateDuration?: (start: Date | null, end: Date | null) => void;
}

export function BudgetPanel({
  campaignBrief,
  campaignDuration,
  talents,
  talentConfigs,
  budgetRange,
  onUpdateBrief,
  onUpdateDuration,
}: BudgetPanelProps) {
  // Calculate totals
  const { subtotals, grandTotal } = useMemo(() => {
    const subtotals = talents.map((talent) => {
      const config = talentConfigs.get(talent.id);
      if (!config) return { talent, rate: 0 };
      return {
        talent,
        rate: calculateTalentRate(config),
      };
    });

    const grandTotal = subtotals.reduce((sum, item) => sum + item.rate, 0);

    return { subtotals, grandTotal };
  }, [talents, talentConfigs]);

  // Parse budget range if provided
  const budgetMin = useMemo(() => {
    if (!budgetRange) return null;
    const match = budgetRange.match(/\$?([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, "")) : null;
  }, [budgetRange]);

  const budgetProgress = budgetMin ? Math.min((grandTotal / budgetMin) * 100, 100) : null;

  // Calculate campaign duration in days
  const campaignDays = useMemo(() => {
    if (!campaignDuration.start || !campaignDuration.end) return null;
    const diff = campaignDuration.end.getTime() - campaignDuration.start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [campaignDuration]);

  return (
    <div className="sticky top-6 h-fit">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-sm font-semibold text-white/90 mb-1">Budget Summary</h3>
          <p className="text-xs text-white/50">Real-time calculations</p>
        </div>

        {/* Campaign Brief Input */}
        <div>
          <label className="block text-xs font-medium text-white/75 mb-2">
            Campaign Brief
          </label>
          <textarea
            value={campaignBrief}
            onChange={(e) => onUpdateBrief?.(e.target.value)}
            placeholder="Describe your campaign, deliverables, and requirements..."
            rows={4}
            className="w-full rounded-lg bg-white/5 px-3 py-2 text-xs text-white/90 placeholder:text-white/30 border border-white/10 focus:border-purple-500/50 focus:outline-none resize-none"
          />
        </div>

        {/* Campaign Duration */}
        <div>
          <label className="block text-xs font-medium text-white/75 mb-2">
            Campaign Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={campaignDuration.start ? campaignDuration.start.toISOString().split('T')[0] : ''}
              onChange={(e) => onUpdateDuration?.(
                e.target.value ? new Date(e.target.value) : null,
                campaignDuration.end
              )}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/90 border border-white/10 focus:border-purple-500/50 focus:outline-none"
            />
            <input
              type="date"
              value={campaignDuration.end ? campaignDuration.end.toISOString().split('T')[0] : ''}
              onChange={(e) => onUpdateDuration?.(
                campaignDuration.start,
                e.target.value ? new Date(e.target.value) : null
              )}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/90 border border-white/10 focus:border-purple-500/50 focus:outline-none"
            />
          </div>
          {campaignDays !== null && (
            <p className="text-xs text-white/50 mt-2">
              {campaignDays} {campaignDays === 1 ? "day" : "days"}
            </p>
          )}
        </div>

        {/* Talent Breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-white/70">Talent Breakdown</p>
          <div className="space-y-2">
            {subtotals.map(({ talent, rate }) => {
              const primaryRole = talent.roles[0] || "Creator";
              return (
                <div
                  key={talent.id}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/80 truncate">
                      {talent.name}
                    </p>
                    <p className="text-[10px] text-white/50">{primaryRole}</p>
                  </div>
                  <p className="text-xs font-semibold text-white/90 ml-2">
                    {formatCurrency(rate)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grand Total */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white/90">Grand Total</span>
            <span className="text-lg font-bold text-white">
              {formatCurrency(grandTotal)}
            </span>
          </div>

          {/* Budget Progress */}
          {budgetProgress !== null && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Budget vs Spend</span>
                <span className="text-white/80 font-medium">
                  {budgetProgress.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    budgetProgress > 90
                      ? "bg-red-500"
                      : budgetProgress > 70
                      ? "bg-yellow-500"
                      : "bg-emerald-500"
                  )}
                />
              </div>
              {budgetMin && (
                <p className="text-[10px] text-white/40">
                  Budget: {formatCurrency(budgetMin)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90 transition"
        >
          Submit Pod Request
        </button>
      </div>
    </div>
  );
}

