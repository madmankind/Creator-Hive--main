"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useCampaign } from "@/contexts/CampaignContext";
import type { DashboardMode, TimeRange } from "@/features/campaign-intelligence/CampaignIntelligenceDashboard";

interface GraphSeriesTableProps {
  mode: DashboardMode;
  campaignIds: string[];
  metrics: string[];
  timeRange: TimeRange;
}

interface SeriesData {
  campaignId: string;
  campaignName: string;
  metric: string;
  values: number[];
  min: number;
  avg: number;
  max: number;
  change: number;
  sparkline: number[];
}

const metricColors: Record<string, string> = {
  views: "#E5484D",
  reach: "#E3A23A",
  engagements: "#8B5CF6",
  budgetSpent: "#E5484D",
  budgetAllocated: "#E3A23A",
  remainingBudget: "#8B5CF6",
  amountPaid: "#E5484D",
  amountCommitted: "#E3A23A",
  outstandingBalance: "#8B5CF6",
};

const metricLabels: Record<string, string> = {
  views: "Views",
  reach: "Reach",
  engagements: "Engagements",
  budgetSpent: "Budget Spent",
  budgetAllocated: "Budget Allocated",
  remainingBudget: "Remaining Budget",
  amountPaid: "Amount Paid",
  amountCommitted: "Amount Committed",
  outstandingBalance: "Outstanding Balance",
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const width = 60;
  const height = 16;
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const path = `M ${points.join(" L ")}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GraphSeriesTable({
  mode,
  campaignIds,
  metrics,
  timeRange,
}: GraphSeriesTableProps) {
  const { campaigns: allCampaigns } = useCampaign();

  const seriesData: SeriesData[] = useMemo(() => {
    // Use real campaigns from context; fall back to selected IDs with placeholder names
    const campaigns = allCampaigns.length > 0
      ? allCampaigns
          .filter(c => campaignIds.length === 0 || campaignIds.includes(c.id))
          .map(c => ({ id: c.id, name: c.name }))
      : campaignIds.map(id => ({ id, name: "Campaign" }));

    if (campaigns.length === 0) return [];

    const days = timeRange === "1D" ? 1 : timeRange === "7D" ? 7 : timeRange === "30D" ? 30 : 90;
    const dataPoints: number[] = [];
    for (let i = 0; i < days; i++) {
      dataPoints.push(Math.floor(50000 + Math.random() * 20000 + i * 1000));
    }

    return campaigns.flatMap((campaign) =>
      metrics.map((metric) => {
        const values = dataPoints.map((v) => v + Math.random() * 5000);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const change = ((values[values.length - 1] - values[0]) / values[0]) * 100;

        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          metric,
          values,
          min,
          avg,
          max,
          change,
          sparkline: values.slice(-20), // Last 20 points for sparkline
        };
      })
    );
  }, [allCampaigns, campaignIds, metrics, timeRange]);

  const formatValue = (value: number, metric: string) => {
    if (metric.includes("Budget") || metric.includes("amount") || metric.includes("Balance")) {
      return `AED ${(value / 1000).toFixed(1)}K`;
    }
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.round(value).toLocaleString();
  };

  if (seriesData.length === 0) {
    return (
      <div className="rounded-lg border border-white/8 bg-white/[0.02] p-8 text-center">
        <div className="text-sm text-white/40">No series data available</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.02]">
      <div className="border-b border-white/5 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">Graph Series</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-2.5 text-left">
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Series</span>
              </th>
              <th className="px-4 py-2.5 text-right">
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Minimum</span>
              </th>
              <th className="px-4 py-2.5 text-right">
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Average</span>
              </th>
              <th className="px-4 py-2.5 text-right">
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Maximum</span>
              </th>
              <th className="px-4 py-2.5 text-center">
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Graph</span>
              </th>
              <th className="px-4 py-2.5 text-right">
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Change</span>
              </th>
              <th className="px-4 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {seriesData.map((series, index) => {
              const color = metricColors[series.metric] || "#E5484D";
              return (
                <motion.tr
                  key={`${series.campaignId}-${series.metric}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <div className="text-xs font-medium text-white/90">{series.campaignName}</div>
                        <div className="text-[10px] text-white/50">{metricLabels[series.metric] || series.metric}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-medium text-white/80">
                      {formatValue(series.min, series.metric)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-medium text-white/80">
                      {formatValue(series.avg, series.metric)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-medium text-white/80">
                      {formatValue(series.max, series.metric)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Sparkline data={series.sparkline} color={color} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: series.change >= 0 ? "#E3A23A" : "#E5484D",
                      }}
                    >
                      {series.change >= 0 ? "+" : ""}
                      {series.change.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded p-1 text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}








