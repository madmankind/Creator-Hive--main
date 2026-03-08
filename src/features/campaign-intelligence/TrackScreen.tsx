"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { feyTokens } from "@/lib/fey-design-tokens";
import { MetricTile } from "@/components/campaigns/primitives/MetricTile";
import { TrackChart } from "@/components/campaigns/TrackChart";
import { TrackInsightsPanel } from "@/components/campaigns/TrackInsightsPanel";
import { CreatorBreakdownTable } from "@/components/campaigns/CreatorBreakdownTable";
import { EventTimeline } from "@/components/campaigns/EventTimeline";
import { CampaignSwitcher } from "@/components/campaigns/CampaignSwitcher";
import { BottomDock } from "@/components/nav/BottomDock";
import { useCampaign } from "@/contexts/CampaignContext";
import { CAMPAIGN_OBJECTIVES, type CampaignObjective } from "@/lib/campaignObjectives";
import { type KPIData } from "@/components/campaigns/KPIPlanner";

export type TimeRange = "1D" | "7D" | "30D" | "90D" | "YTD" | "custom";
export type DashboardMode = "track" | "manage" | "pay" | "discover";

interface TrackScreenProps {
  selectedCampaignIds: string[];
  onCampaignChange?: (ids: string[]) => void;
}

export function TrackScreen({ selectedCampaignIds, onCampaignChange }: TrackScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeCampaign } = useCampaign();
  const [timeRange, setTimeRange] = useState<TimeRange>("30D");
  const [objective, setObjective] = useState<CampaignObjective>(activeCampaign?.objective || "awareness");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [plannedData, setPlannedData] = useState<KPIData | null>(null);
  const [actualData, setActualData] = useState<KPIData | null>(null);

  const timeRanges: TimeRange[] = ["1D", "7D", "30D", "90D", "YTD", "custom"];

  // ── Live KPIs ────────────────────────────────────────────────────────────
  const [kpis, setKpis] = useState({
    reach: "—",
    impressions: "—",
    er: "—",
    spend: "—",
    remaining: "—",
    outstanding: "—",
  });

  const fetchKpis = useCallback(async (campaignId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      if (!res.ok) return;
      const data = await res.json();
      const campaign = data.campaign;
      if (!campaign) return;

      // Aggregate metrics
      const metrics: { type: string; value: number }[] = campaign.metrics ?? [];
      const sum = (type: string) =>
        metrics.filter((m: { type: string }) => m.type === type).reduce((a: number, m: { value: number }) => a + m.value, 0);

      const reach = sum("reach");
      const impressions = sum("impressions");
      const engagements = sum("engagements");
      const spendNum = sum("spend") || (campaign.budget ? campaign.budget * 0.9 : 0);
      const budgetNum = campaign.budget ?? 0;
      const remaining = Math.max(0, budgetNum - spendNum);
      const erVal = reach > 0 ? ((engagements / reach) * 100).toFixed(1) + "%" : "—";

      const fmt = (n: number) =>
        n >= 1_000_000
          ? `${(n / 1_000_000).toFixed(1)}M`
          : n >= 1_000
            ? `${(n / 1_000).toFixed(1)}K`
            : `${n}`;

      setKpis({
        reach: reach > 0 ? fmt(reach) : "—",
        impressions: impressions > 0 ? fmt(impressions) : "—",
        er: erVal,
        spend: spendNum > 0 ? `AED ${fmt(spendNum)}` : "—",
        remaining: budgetNum > 0 ? `AED ${fmt(remaining)}` : "—",
        outstanding: "—",
      });
    } catch {
      // leave defaults
    }
  }, []);

  useEffect(() => {
    if (activeCampaign?.id) fetchKpis(activeCampaign.id);
  }, [activeCampaign?.id, fetchKpis]);

  return (
    <div className="min-h-screen" style={{ color: feyTokens.colors.text.primary }}>
      {/* Header Row - Text only, no container */}
      <div className="sticky top-0 z-30 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Campaign Switcher */}
          <div className="w-[200px]">
            <CampaignSwitcher />
          </div>

          {/* Center: Timeframe - text only, no container */}
          <div className="flex items-center gap-4">
            {timeRanges.map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r as TimeRange)}
                className="text-sm font-medium transition-colors"
                style={{
                  color: timeRange === r ? "#FFFFFF" : "#6F6F6F",
                  fontWeight: timeRange === r ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (timeRange !== r) {
                    e.currentTarget.style.color = "#DADADA";
                  }
                }}
                onMouseLeave={(e) => {
                  if (timeRange !== r) {
                    e.currentTarget.style.color = "#6F6F6F";
                  }
                }}
              >
                {r === "custom" ? "Custom" : r}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hero Chart */}
            <div className="relative">
              <TrackChart
                timeRange={timeRange}
                campaignIds={activeCampaign ? [activeCampaign.id] : []}
                metrics={selectedMetrics}
                objective={objective}
                onObjectiveChange={setObjective}
                plannedData={plannedData}
                actualData={actualData}
                onPlannedChange={setPlannedData}
                onActualChange={setActualData}
              />
            </div>

            {/* KPI Strip - Below Chart */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {/* Only show KPIs for allowedMetrics of current objective */}
              {CAMPAIGN_OBJECTIVES[objective].allowedMetrics.map((metric) => {
                const label = metric.charAt(0).toUpperCase() + metric.slice(1);
                const value = kpis[metric as keyof typeof kpis] || "—";
                return <MetricTile key={metric} label={label} value={value} />;
              })}
              <MetricTile label="Spend" value={kpis.spend} />
              <MetricTile label="Remaining" value={kpis.remaining} />
              <MetricTile label="Outstanding" value={kpis.outstanding} />
            </div>

            {/* Bottom Section: Creator Breakdown + Event Timeline */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <CreatorBreakdownTable campaignIds={activeCampaign ? [activeCampaign.id] : []} />
              </div>
              <div>
                <EventTimeline campaignIds={activeCampaign ? [activeCampaign.id] : []} />
              </div>
            </div>
          </div>

          {/* Right Column: KPI/Planned Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <TrackInsightsPanel
                objective={objective}
                plannedData={plannedData}
                actualData={actualData}
                onPlannedChange={setPlannedData}
                onActualChange={setActualData}
                campaignId={activeCampaign?.id}
                campaignName={activeCampaign?.name}
                clientName={activeCampaign?.clientName}
                budget={activeCampaign?.budget}
                spent={activeCampaign?.spend}
                creatorsCount={8}
                deliverablesCount={12}
                static={true}
              />
            </div>
          </div>
        </div>
        
        {/* Bottom padding for dock */}
        <div style={{ height: "calc(88px + 16px)" }} />
      </div>
      
      {/* Bottom Dock Navigation */}
      <BottomDock />
    </div>
  );
}
