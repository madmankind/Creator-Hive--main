"use client";

import { campaignTheme } from "@/lib/campaign-theme";
import type { DashboardMode } from "./CampaignIntelligenceDashboard";

interface ModeToggleProps {
  value: DashboardMode;
  onChange: (mode: DashboardMode) => void;
}

const modes: { value: DashboardMode; label: string }[] = [
  { value: "track", label: "Track" },
  { value: "manage", label: "Manage" },
  { value: "pay", label: "Pay" },
];

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/5 p-1">
      {modes.map((mode) => {
        const isActive = value === mode.value;
        return (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              isActive
                ? "text-[#EDEDED]"
                : "text-[#9B9B9B] hover:text-[#EDEDED] hover:bg-white/5"
            }`}
            style={
              isActive
                ? {
                    backgroundColor: campaignTheme.colors.primary,
                    boxShadow: `0 0 20px ${campaignTheme.colors.primary}40`,
                  }
                : {}
            }
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}








