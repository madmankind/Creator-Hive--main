"use client";

import { useState, useEffect, useCallback } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CampaignSwitcher } from "@/components/campaigns/CampaignSwitcher";
import { MetricTile } from "@/components/campaigns/primitives/MetricTile";
import { TrackChart } from "@/components/campaigns/TrackChart";
import { TrackInsightsPanel } from "@/components/campaigns/TrackInsightsPanel";
import { CreatorBreakdownTable } from "@/components/campaigns/CreatorBreakdownTable";
import { EventTimeline } from "@/components/campaigns/EventTimeline";
import { useCampaign } from "@/contexts/CampaignContext";
import { CAMPAIGN_OBJECTIVES, type CampaignObjective } from "@/lib/campaignObjectives";
import { type KPIData } from "@/components/campaigns/KPIPlanner";
import { SlidersHorizontal } from "lucide-react";

export type TimeRange = "1D" | "7D" | "30D" | "90D" | "YTD" | "custom";

interface TrackScreenProps {
  selectedCampaignIds: string[];
  onCampaignChange?: (ids: string[]) => void;
}

const TIME_RANGES: TimeRange[] = ["1D", "7D", "30D", "90D", "YTD", "custom"];
export function TrackScreen({ selectedCampaignIds, onCampaignChange }: TrackScreenProps) {
  const { activeCampaign } = useCampaign();

  // Pre-populate from activeCampaign context (set by booking flow)
  const [timeRange, setTimeRange] = useState<TimeRange>("30D");
  const [objective, setObjective] = useState<CampaignObjective>(
    activeCampaign?.objective ?? "awareness"
  );
  const [showInsights, setShowInsights] = useState(false);
  const [plannedData, setPlannedData] = useState<KPIData | null>(null);
  const [actualData, setActualData] = useState<KPIData | null>(null);

  // Sync objective when activeCampaign changes
  useEffect(() => {
    if (activeCampaign?.objective) setObjective(activeCampaign.objective);
  }, [activeCampaign?.objective]);

  // Pre-populate plannedData from campaign budget
  useEffect(() => {
    if (!activeCampaign || plannedData) return;
    if (activeCampaign.budget > 0) {
      setPlannedData({
        totalCost: activeCampaign.budget,
        totalFollowers: 0,
        estImpressions: 0,
        estReach: 0,
        estEngagements: 0,
        estViews: 0,
      } as KPIData);
    }
  }, [activeCampaign, plannedData]);

  // Live KPI fetch
  const [kpis, setKpis] = useState({
    reach: "—", impressions: "—", er: "—",
    spend: "—", remaining: "—", outstanding: "—",
  });

  const fetchKpis = useCallback(async (campaignId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      if (!res.ok) return;
      const data = await res.json();
      const campaign = data.campaign;
      if (!campaign) return;
      const metrics: { type: string; value: number }[] = campaign.metrics ?? [];
      const sum = (type: string) =>
        metrics.filter((m) => m.type === type).reduce((a, m) => a + m.value, 0);
      const reach = sum("reach");
      const impressions = sum("impressions");
      const engagements = sum("engagements");
      const spendNum = sum("spend") || (campaign.budget ? campaign.budget * 0.9 : 0);
      const budgetNum = campaign.budget ?? 0;
      const fmt = (n: number) =>
        n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
        : `${n}`;
      setKpis({
        reach: reach > 0 ? fmt(reach) : "—",
        impressions: impressions > 0 ? fmt(impressions) : "—",
        er: reach > 0 ? `${((engagements / reach) * 100).toFixed(1)}%` : "—",
        spend: spendNum > 0 ? `AED ${fmt(spendNum)}` : "—",
        remaining: budgetNum > 0 ? `AED ${fmt(Math.max(0, budgetNum - spendNum))}` : "—",
        outstanding: "—",
      });
    } catch { /* leave defaults */ }
  }, []);

  // Seed KPIs from local campaign data when no API data yet
  useEffect(() => {
    if (!activeCampaign) return;
    if (activeCampaign.budget > 0 && kpis.spend === "—") {
      setKpis(prev => ({
        ...prev,
        spend: prev.spend !== "—" ? prev.spend : `AED ${activeCampaign.budget.toLocaleString()} (planned)`,
        remaining: prev.remaining !== "—" ? prev.remaining : `AED ${activeCampaign.budget.toLocaleString()}`,
      }));
    }
  }, [activeCampaign?.id, activeCampaign?.budget, kpis.spend]);

  useEffect(() => {
    if (activeCampaign?.id) fetchKpis(activeCampaign.id);
  }, [activeCampaign?.id, fetchKpis]);

  // Header slots
  const headerLeft = (
    <>
      <CampaignSwitcher />
      <div className="h-4 w-px flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="flex items-center gap-4">
        {TIME_RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setTimeRange(r)}
            className="text-[12px] transition-colors"
            style={{
              color: timeRange === r ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.38)",
              fontWeight: timeRange === r ? 500 : 400,
            }}
          >
            {r === "custom" ? "Custom" : r}
          </button>
        ))}
      </div>
    </>
  );

  const headerRight = (
    <button
      onClick={() => setShowInsights((v) => !v)}
      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] transition-colors"
      style={{
        background: showInsights ? "rgba(124,92,255,0.15)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${showInsights ? "rgba(124,92,255,0.4)" : "rgba(255,255,255,0.07)"}`,
        color: showInsights ? "rgba(124,92,255,0.9)" : feyTokens.colors.text.muted,
      }}
    >
      <SlidersHorizontal size={13} />
      <span>Forecast</span>
    </button>
  );

  return (
    <DashboardShell headerLeft={headerLeft} headerRight={headerRight}>
      {!activeCampaign ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            No campaign selected
          </p>
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.22)" }}>
            Use the campaign switcher above to select or start a campaign
          </p>
        </div>
      ) : (
      <div className="grid gap-6" style={{ gridTemplateColumns: showInsights ? "1fr 300px" : "1fr" }}>
        {/* Main column */}
        <div className="space-y-6 min-w-0">

          {/* Campaign brief summary bar */}
          {activeCampaign && (activeCampaign.talentNames?.length || activeCampaign.startDate || activeCampaign.objectives?.length) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {activeCampaign.objectives && activeCampaign.objectives.length > 0 && (
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>Objectives </span>
                  {activeCampaign.objectives.map((o: string) => o.charAt(0).toUpperCase() + o.slice(1)).join(" · ")}
                </span>
              )}
              {activeCampaign.startDate && (
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>Dates </span>
                  {String(activeCampaign.startDate)}{activeCampaign.endDate ? ` → ${String(activeCampaign.endDate)}` : ""}
                </span>
              )}
              {activeCampaign.talentNames && activeCampaign.talentNames.length > 0 && (
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>Talent </span>
                  {activeCampaign.talentNames.slice(0, 3).join(", ")}{activeCampaign.talentNames.length > 3 ? ` +${activeCampaign.talentNames.length - 3}` : ""}
                </span>
              )}
              {activeCampaign.budget > 0 && (
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>Budget </span>
                  AED {activeCampaign.budget.toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Chart */}
          <TrackChart
            timeRange={timeRange}
            campaignIds={activeCampaign ? [activeCampaign.id] : []}
            metrics={[]}
            objective={objective}
            onObjectiveChange={setObjective}
            plannedData={plannedData}
            actualData={actualData}
            onPlannedChange={setPlannedData}
            onActualChange={setActualData}
          />

          {/* 4-tile KPI strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricTile label="Reach" value={kpis.reach} />
            <MetricTile label="Impressions" value={kpis.impressions} />
            <MetricTile label="Spend" value={kpis.spend} />
            <MetricTile label="Eng. Rate" value={kpis.er} />
          </div>

          {/* Creator breakdown + timeline */}
          <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 280px" }}>
            <CreatorBreakdownTable campaignIds={activeCampaign ? [activeCampaign.id] : []} />
            <EventTimeline campaignIds={activeCampaign ? [activeCampaign.id] : []} />
          </div>
        </div>

        {/* Insights panel — only when expanded */}
        {showInsights && (
          <div className="sticky top-6 self-start">
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
        )}
      </div>
      )}
    </DashboardShell>
  );
}
