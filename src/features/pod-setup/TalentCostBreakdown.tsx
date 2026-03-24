"use client";

import { motion } from "framer-motion";
import { CurrencyAnimated } from "@/components/ui/currency-animated";
import { calculateTalentRate } from "@/lib/podPricing";
import type { Talent } from "@/store/useCampaignPodStore";
import type { TalentPodConfig } from "@/types/pod";

interface TalentCostBreakdownProps {
  talents: Talent[];
  talentConfigs: Map<string, TalentPodConfig>;
}

export function TalentCostBreakdown({
  talents,
  talentConfigs,
}: TalentCostBreakdownProps) {
  const breakdown = talents.map((talent) => {
    const config = talentConfigs.get(talent.id);
    const rate = config ? calculateTalentRate(config) : 0;
    return { talent, rate };
  });

  const grandTotal = breakdown.reduce((sum, item) => sum + item.rate, 0);

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-black text-white/80 uppercase tracking-wider mb-3 border-b border-white/10 pb-2">
        Talent Breakdown
      </div>
      
      <div className="space-y-2">
        {breakdown.map(({ talent, rate }, index) => {
          const primaryRole = talent.roles[0] || "Creator";
          return (
            <motion.div
              key={talent.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 hover:bg-white/8 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white/90 truncate">
                  {talent.name}
                </div>
                <div className="text-[10px] text-white/60 font-medium">{primaryRole}</div>
              </div>
              <CurrencyAnimated
                value={rate}
                className="text-xs font-black text-white ml-2"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Grand Total */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: breakdown.length * 0.05 + 0.1 }}
        className="pt-4 mt-4 border-t-2 border-white/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-white/90 uppercase tracking-wider">Grand Total</span>
          <CurrencyAnimated
            value={grandTotal}
            className="text-xl font-black text-white bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
          />
        </div>
      </motion.div>
    </div>
  );
}

