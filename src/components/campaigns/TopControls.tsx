"use client";

import { cn } from "@/lib/utils";
import type { DashboardMode, TimeRange } from "@/features/campaign-intelligence/CampaignIntelligenceDashboard";

interface TopControlsProps {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  selectedCampaignIds: string[];
}

const timeRanges: TimeRange[] = ["1D", "7D", "30D", "90D", "YTD", "custom"];
const modes: { value: DashboardMode; label: string }[] = [
  { value: "track", label: "Track" },
  { value: "manage", label: "Manage" },
  { value: "pay", label: "Pay" },
];

export function TopControls({
  mode,
  onModeChange,
  timeRange,
  onTimeRangeChange,
  selectedCampaignIds,
}: TopControlsProps) {
  const displayText =
    selectedCampaignIds.length === 0
      ? "All campaigns"
      : `${selectedCampaignIds.length} campaign${selectedCampaignIds.length !== 1 ? "s" : ""} selected`;

  return (
    <div className="sticky top-0 z-50 h-16 border-b border-white/5 bg-[#07070A]/95 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Campaign Display (selection happens in LeftRail) */}
        <div className="flex-1">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/90">
            <span>{displayText}</span>
          </div>
        </div>

        {/* Center: Time Range Chips */}
        <div className="flex-1 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {timeRanges.map((range) => {
              const isActive = timeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => onTimeRangeChange(range)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium transition-all",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  )}
                  style={
                    isActive
                      ? {
                          boxShadow: "0 0 0 1px rgba(229,72,77,0.3)",
                        }
                      : {}
                  }
                >
                  {range === "custom" ? "Custom" : range}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Mode Toggle */}
        <div className="flex-1 flex justify-end">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {modes.map((m) => {
              const isActive = mode === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => onModeChange(m.value)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                    isActive ? "text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: "#E5484D",
                          boxShadow: "0 0 20px rgba(229,72,77,0.3)",
                        }
                      : {}
                  }
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

