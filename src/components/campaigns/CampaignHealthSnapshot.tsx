"use client";

import type { DashboardMode, TimeRange } from "@/features/campaign-intelligence/CampaignIntelligenceDashboard";

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
  // Mock data
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
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Campaign Health Snapshot</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {cards.map((card, index) => (
          <div
            key={index}
            className="rounded-lg border border-white/8 bg-white/[0.02] p-4"
          >
            <div className="mb-1 text-[10px] uppercase tracking-wider text-white/40">{card.label}</div>
            <div className="mb-1 text-xl font-semibold text-white/90">{card.value}</div>
            {card.change && (
              <div className="text-[10px] font-medium text-[#E3A23A]">{card.change}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}








