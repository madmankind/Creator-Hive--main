"use client";

import { campaignTheme } from "@/lib/campaign-theme";
import type { TimeRange } from "./CampaignIntelligenceDashboard";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const ranges: TimeRange[] = ["1D", "7D", "30D", "90D", "YTD", "custom"];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/5 p-1">
      {ranges.map((range) => {
        const isActive = value === range;
        return (
          <button
            key={range}
            onClick={() => onChange(range)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? "bg-white/10 text-[#EDEDED]"
                : "text-[#9B9B9B] hover:text-[#EDEDED] hover:bg-white/5"
            }`}
            style={
              isActive
                ? {
                    boxShadow: `0 0 0 1px ${campaignTheme.colors.primary}40`,
                  }
                : {}
            }
          >
            {range === "custom" ? "Custom" : range}
          </button>
        );
      })}
    </div>
  );
}








