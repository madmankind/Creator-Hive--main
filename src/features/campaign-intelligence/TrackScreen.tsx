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
import { SlidersHorizontal, Sparkles, Paperclip, Send, Loader2, Phone } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DiscoverySummaryCard } from "@/components/discovery/DiscoverySummaryCard";
import { useDiscoveryStore } from "@/store/useDiscoveryStore";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import type { WeekTimeRange } from "@/components/campaigns/TrackChart";

export type TimeRange = WeekTimeRange;

/* ─── Empty dashboard with discovery summary ─── */
function EmptyDashboard() {
  const ds = useDiscoveryStore();
  const brief = ds.completed ? {
    primaryObjective: ds.primaryObjective,
    requestedRoles: ds.requestedRoles,
    startTiming: ds.startTiming,
    budgetRange: ds.budgetRange,
    companyName: ds.companyName,
    industry: ds.industry,
  } : null;
  const [showAdvisor, setShowAdvisor] = useState(false);

  return (
    <div className="max-w-xl mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-[18px] font-medium text-white/80">Welcome to your workspace</h3>
        <p className="text-[13px] text-white/30">
          {brief ? "Here's your discovery brief. Browse talent or start a campaign to get going." : "Select or create a campaign to get started."}
        </p>
      </div>

      {brief && (
        <DiscoverySummaryCard
          brief={brief}
          onBrowseTalent={() => window.location.href = "/?skip=gallery"}
          onAdvisor={() => setShowAdvisor(true)}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <a href="/?skip=gallery"
          className="rounded-2xl px-4 py-4 text-center text-[13px] bg-white/[0.04] ring-1 ring-white/[0.07] text-white/50 hover:bg-white/[0.07] transition">
          Browse talent
        </a>
        <a href="/dashboard/campaigns/new"
          className="rounded-2xl px-4 py-4 text-center text-[13px] bg-white/[0.08] ring-1 ring-white/[0.12] text-white/70 hover:bg-white/[0.12] transition font-medium">
          New campaign
        </a>
      </div>
    </div>
  );
}

interface TrackScreenProps {
  selectedCampaignIds: string[];
  onCampaignChange?: (ids: string[]) => void;
}

const TIME_RANGES: { id: WeekTimeRange; label: string }[] = [
  { id: "week1", label: "Week 1" },
  { id: "week2", label: "Week 2" },
  { id: "week3", label: "Week 3" },
  { id: "week4", label: "Week 4" },
  { id: "total", label: "Total" },
  { id: "custom", label: "Custom" },
];
export function TrackScreen({ selectedCampaignIds, onCampaignChange }: TrackScreenProps) {
  const { activeCampaign } = useCampaign();

  // Pre-populate from activeCampaign context (set by booking flow)
  const [timeRange, setTimeRange] = useState<WeekTimeRange>("total");
  const [objective, setObjective] = useState<CampaignObjective>(
    activeCampaign?.objective ?? "awareness"
  );
  const [showInsights, setShowInsights] = useState(false);
  const [plannedData, setPlannedData] = useState<KPIData | null>(null);
  const [actualData, setActualData] = useState<KPIData | null>(null);

  // AI analysis chat state
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

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

  const handleAiAnalyze = useCallback(async () => {
    const q = aiQuery.trim();
    if (!q || aiLoading) return;
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          campaignData: {
            name: activeCampaign?.name,
            objective: activeCampaign?.objective,
            budget: activeCampaign?.budget,
            spend: activeCampaign?.spend,
            talentNames: activeCampaign?.talentNames,
            kpis,
          },
          mode: "analyze",
        }),
      });
      const data = await res.json();
      setAiResponse(data.analysis ?? data.detail ?? "Analysis complete. Try a more specific question.");
    } catch {
      setAiResponse("AI analysis unavailable. Try again later.");
    } finally {
      setAiLoading(false);
    }
  }, [aiQuery, aiLoading, activeCampaign, kpis]);

  // Header slots
  const headerLeft = (
    <>
      <CampaignSwitcher />
      <div className="hidden sm:block h-4 w-px flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="hidden sm:flex items-center gap-3">
        {TIME_RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setTimeRange(r.id)}
            className="text-[12px] transition-colors"
            style={{
              color: timeRange === r.id ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.38)",
              fontWeight: timeRange === r.id ? 500 : 400,
            }}
          >
            {r.label}
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
      <span>Filter</span>
    </button>
  );

  return (
    <DashboardShell headerLeft={headerLeft} headerRight={headerRight}>
      {!activeCampaign ? (
        <EmptyDashboard />
      ) : (
      <div className="space-y-6">
        {/* Mobile time range strip */}
        <div className="flex sm:hidden items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className="flex-shrink-0 text-[12px] transition-colors py-1"
              style={{
                color: timeRange === r.id ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.38)",
                fontWeight: timeRange === r.id ? 500 : 400,
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className={showInsights ? "grid gap-6 lg:grid-cols-[1fr_300px]" : "grid gap-6"}>
        {/* Main column */}
        <div className="space-y-6 min-w-0">

          {/* Campaign brief summary bar */}
          {activeCampaign && (activeCampaign.talentNames?.length || activeCampaign.startDate || activeCampaign.objectives?.length) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <CampaignStatusBadge status={activeCampaign.status} />
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

          {/* Lifecycle state banners */}
          {activeCampaign?.status === "PAUSED" && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.20)" }}>
              <span className="text-[12px] font-medium" style={{ color: "rgba(251,146,60,0.90)" }}>Campaign Paused</span>
              <span className="text-[12px]" style={{ color: "rgba(251,146,60,0.55)" }}>— Weekly inputs and billing are on hold. Resume from Manage.</span>
            </div>
          )}
          {activeCampaign?.status === "COMPLETED" && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.20)" }}>
              <span className="text-[12px] font-medium" style={{ color: "rgba(52,211,153,0.90)" }}>Campaign Completed</span>
              <span className="text-[12px]" style={{ color: "rgba(52,211,153,0.55)" }}>— Final performance summary below. No further inputs required.</span>
            </div>
          )}
          {activeCampaign?.status === "CANCELLED" && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.20)" }}>
              <span className="text-[12px] font-medium" style={{ color: "rgba(248,113,113,0.90)" }}>Campaign Cancelled</span>
              <span className="text-[12px]" style={{ color: "rgba(248,113,113,0.55)" }}>— This campaign has been cancelled. Data is preserved for reference.</span>
            </div>
          )}

          {/* AI Campaign Analysis Chat */}
          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 px-4 py-2.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400/60 shrink-0" />
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAiAnalyze(); }}
                placeholder="Ask AI to analyze campaign performance..."
                className="flex-1 bg-transparent outline-none text-[12px] text-white/80 placeholder:text-white/25"
              />
              <label className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/[0.05] transition cursor-pointer">
                <Paperclip className="w-3.5 h-3.5" />
                <input type="file" className="hidden" accept="image/*,.pdf,.pptx,.xlsx,.csv" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAiQuery((prev) => prev ? `${prev} [attached: ${file.name}]` : `Analyze this file: ${file.name}`);
                }} />
              </label>
              <button
                onClick={handleAiAnalyze}
                disabled={aiLoading || !aiQuery.trim()}
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition"
                style={{ background: aiQuery.trim() ? "rgba(124,92,255,0.25)" : "transparent", color: aiQuery.trim() ? "rgba(124,92,255,0.9)" : "rgba(255,255,255,0.20)" }}
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            <AnimatePresence>
              {aiResponse && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-white/[0.05] px-4 py-3"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3 h-3 text-purple-400/60 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-white/60 leading-relaxed">{aiResponse}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chart */}
          <TrackChart
            timeRange={timeRange}
            campaignIds={activeCampaign ? [activeCampaign.id] : []}
            metrics={[]}
            talentNames={activeCampaign?.talentNames ?? []}
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
          <div className="grid gap-6 sm:grid-cols-[1fr_280px]">
            <CreatorBreakdownTable campaignIds={activeCampaign ? [activeCampaign.id] : []} />
            <EventTimeline campaignIds={activeCampaign ? [activeCampaign.id] : []} />
          </div>
        </div>{/* end main column */}

        {/* Insights panel — only when expanded */}
        {showInsights && (
          <div className="lg:sticky lg:top-6 self-start">
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
      </div>
      )}
    </DashboardShell>
  );
}
