"use client";

import { campaignTheme } from "@/lib/campaign-theme";
import type { DashboardMode, TimeRange } from "./CampaignIntelligenceDashboard";

interface CampaignHealthSnapshotProps {
  mode: DashboardMode;
  timeRange: TimeRange;
  campaignIds: string[];
}

export function CampaignHealthSnapshot({
  mode,
  timeRange,
  campaignIds,
}: CampaignHealthSnapshotProps) {
  // Mock data - will be replaced with API calls
  const stats = {
    activeCampaigns: 2,
    totalSpend: 96500,
    totalBudget: 100000,
    outstandingPayments: 23000,
  };

  const cards = [
    {
      label: "Active Campaigns",
      value: stats.activeCampaigns.toString(),
      change: null,
    },
    {
      label: mode === "manage" ? "Total Spend vs Budget" : "Total Spend",
      value: `AED ${(stats.totalSpend / 1000).toFixed(1)}K`,
      change: mode === "manage" ? `${((stats.totalSpend / stats.totalBudget) * 100).toFixed(1)}%` : null,
    },
    {
      label: mode === "pay" ? "Outstanding Payments" : "Outstanding",
      value: `AED ${(stats.outstandingPayments / 1000).toFixed(1)}K`,
      change: null,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-[#EDEDED]">Campaign Health Snapshot</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/10 bg-[#0B0B0E]/50 backdrop-blur-sm p-4"
          >
            <div className="mb-1 text-xs text-[#9B9B9B]">{card.label}</div>
            <div className="mb-1 text-2xl font-semibold text-[#EDEDED]">{card.value}</div>
            {card.change && (
              <div
                className="text-xs font-medium"
                style={{ color: campaignTheme.colors.secondary }}
              >
                {card.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}








