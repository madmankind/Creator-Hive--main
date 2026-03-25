"use client";

import type { WeekTimeRange } from "@/components/campaigns/TrackChart";

interface TimeRangeSelectorProps {
  value: WeekTimeRange;
  onChange: (range: WeekTimeRange) => void;
}

const TIME_RANGES: { id: WeekTimeRange; label: string }[] = [
  { id: "week1", label: "Week 1" },
  { id: "week2", label: "Week 2" },
  { id: "week3", label: "Week 3" },
  { id: "week4", label: "Week 4" },
  { id: "total", label: "Total" },
  { id: "custom", label: "Custom" },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/5 p-1">
      {TIME_RANGES.map((range) => {
        const isActive = value === range.id;
        return (
          <button
            key={range.id}
            onClick={() => onChange(range.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? "bg-white/10 text-[#EDEDED]"
                : "text-[#9B9B9B] hover:text-[#EDEDED] hover:bg-white/5"
            }`}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
