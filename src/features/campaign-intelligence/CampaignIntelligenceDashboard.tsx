"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { campaignTheme } from "@/lib/campaign-theme";
import { CampaignIntelligenceGraph } from "./CampaignIntelligenceGraph";
import { CampaignSelector } from "./CampaignSelector";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { ModeToggle } from "./ModeToggle";
import { MetricSelectorPanel } from "./MetricSelectorPanel";
import { CampaignHealthSnapshot } from "./CampaignHealthSnapshot";
import { EventTimeline } from "./EventTimeline";
import type { WeekTimeRange } from "@/components/campaigns/TrackChart";

export type DashboardMode = "track" | "manage" | "pay";
export type TimeRange = WeekTimeRange;

interface CampaignIntelligenceDashboardProps {
  initialMode?: DashboardMode;
}

export function CampaignIntelligenceDashboard({
  initialMode = "track",
}: CampaignIntelligenceDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<DashboardMode>(initialMode);
  const [timeRange, setTimeRange] = useState<TimeRange>("total");
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  const handleModeChange = (newMode: DashboardMode) => {
    setMode(newMode);
    router.push(`/dashboard/campaigns?mode=${newMode}`, { scroll: false });
  };

  // Default metrics based on mode
  const defaultMetrics = useMemo(() => {
    if (selectedMetrics.length > 0) return selectedMetrics;
    switch (mode) {
      case "track":
        return ["views", "reach"];
      case "manage":
        return ["budgetSpent", "budgetAllocated"];
      case "pay":
        return ["amountPaid", "amountCommitted"];
      default:
        return [];
    }
  }, [mode, selectedMetrics]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: campaignTheme.background.gradient,
        color: campaignTheme.colors.text.primary,
      }}
    >
      {/* Top Bar - Fixed */}
      <div className="sticky top-0 z-50 h-16 border-b border-white/10 bg-[#0B0B0E]/80 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-6">
          {/* Left: Campaign Selector */}
          <div className="flex-1">
            <CampaignSelector
              selectedIds={selectedCampaignIds}
              onChange={setSelectedCampaignIds}
            />
          </div>

          {/* Center: Time Range */}
          <div className="flex-1 flex justify-center">
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>

          {/* Right: Mode Toggle */}
          <div className="flex-1 flex justify-end">
            <ModeToggle value={mode} onChange={handleModeChange} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Graph Area */}
        <div className="mb-6" style={{ height: "480px" }}>
          <CampaignIntelligenceGraph
            mode={mode}
            timeRange={timeRange}
            campaignIds={selectedCampaignIds}
            metrics={defaultMetrics}
          />
        </div>

        {/* Metric Selector Panel (Floating) */}
        <MetricSelectorPanel
          mode={mode}
          selectedMetrics={defaultMetrics}
          onChange={setSelectedMetrics}
        />

        {/* Below-the-fold Panels */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Health Snapshot */}
          <div className="lg:col-span-2">
            <CampaignHealthSnapshot
              mode={mode}
              timeRange={timeRange}
              campaignIds={selectedCampaignIds}
            />
          </div>

          {/* Event Timeline */}
          <div>
            <EventTimeline campaignIds={selectedCampaignIds} />
          </div>
        </div>
      </div>
    </div>
  );
}








