"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { feyTokens } from "@/lib/fey-design-tokens";
import { PillSegment } from "@/components/campaigns/primitives/PillSegment";
import { MetricTile } from "@/components/campaigns/primitives/MetricTile";
import { TrackChart } from "@/components/campaigns/TrackChart";
import { TrackInsightsPanel } from "@/components/campaigns/TrackInsightsPanel";
import { CreatorBreakdownTable } from "@/components/campaigns/CreatorBreakdownTable";
import { EventTimeline } from "@/components/campaigns/EventTimeline";
import { CampaignSwitcher } from "@/components/campaigns/CampaignSwitcher";
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
  
  // Update objective when campaign changes
  useEffect(() => {
    if (activeCampaign?.objective) {
      setObjective(activeCampaign.objective as CampaignObjective);
    }
  }, [activeCampaign]);

  // Filter metrics to only include allowedMetrics for current objective
  useEffect(() => {
    const allowedMetrics = CAMPAIGN_OBJECTIVES[objective].allowedMetrics;
    setSelectedMetrics((prev) => 
      prev.filter((m) => allowedMetrics.includes(m))
    );
  }, [objective]);

  const timeRanges: TimeRange[] = ["1D", "7D", "30D", "90D", "YTD", "custom"];
  const modes: DashboardMode[] = ["track", "manage", "pay"];

  // Mock KPI data
  const kpis = {
    reach: "53.4M",
    impressions: "127.8M",
    er: "4.2%",
    spend: "AED 96.5K",
    remaining: "AED 3.5K",
    outstanding: "AED 27.3K",
  };

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

          {/* Right: Mode Tabs */}
          <div className="flex items-center gap-2">
            <PillSegment
              options={modes.map((m) => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }))}
              value="track"
              onChange={(v) => router.push(`/dashboard/campaigns?mode=${v}`)}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Hero Chart - More Prominent */}
        <div className="mb-8 relative">
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

          {/* Fey-style floating insights panel - wrapped in container for drag bounds */}
          <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
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
            />
          </div>
        </div>

        {/* KPI Strip - Below Chart */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
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
    </div>
  );
}
