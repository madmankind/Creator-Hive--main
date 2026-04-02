"use client";

import { useState } from "react";
import { type CampaignObjective } from "@/lib/campaignObjectives";
import { type KPIData } from "./KPIPlanner";
import { useCampaign } from "@/contexts/CampaignContext";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { TimeRangeSelector } from "@/features/campaign-intelligence/TimeRangeSelector";
import type { WeekTimeRange } from "@/components/campaigns/TrackChart";

interface TrackInsightsPanelProps {
  objective: CampaignObjective;
  plannedData: KPIData | null;
  actualData: KPIData | null;
  onPlannedChange: (data: KPIData) => void;
  onActualChange: (data: KPIData) => void;
  onWeeklyInputsChange?: (inputs: Record<number, Record<string, number>>) => void;
  campaignId?: string;
  campaignName?: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  creatorsCount?: number;
  deliverablesCount?: number;
  static?: boolean;
  /** Chart period — shown inside Filter panel (replaces header week tabs on Track) */
  timeRange?: WeekTimeRange;
  onTimeRangeChange?: (range: WeekTimeRange) => void;
}

type TabType = "overview" | "weekly" | "summary";
type WeekNumber = 1 | 2 | 3 | 4;

// Objective-specific weekly field definitions
const OBJECTIVE_FIELDS: Record<CampaignObjective, {
  collect: { key: string; label: string; placeholder: string }[];
  derive: { key: string; label: string; formula: (v: Record<string, number>) => string }[];
}> = {
  awareness: {
    collect: [
      { key: "spend",       label: "Spend (AED)",    placeholder: "e.g. 25000" },
      { key: "reach",       label: "Reach",          placeholder: "e.g. 450000" },
      { key: "impressions", label: "Impressions",    placeholder: "e.g. 1200000" },
      { key: "videoViews",  label: "Video Views",    placeholder: "e.g. 320000" },
    ],
    derive: [
      { key: "cpm",  label: "CPM",  formula: (v) => v.impressions > 0 ? `AED ${((v.spend / v.impressions) * 1000).toFixed(2)}` : "—" },
      { key: "cpv",  label: "CPV",  formula: (v) => v.videoViews > 0  ? `AED ${(v.spend / v.videoViews).toFixed(3)}`          : "—" },
      { key: "pace", label: "Pacing", formula: (v) => {
        if (!v.reach || !v.targetReach) return "—";
        const pct = Math.round((v.reach / v.targetReach) * 100);
        return `${pct}%`;
      }},
    ],
  },
  engagement: {
    collect: [
      { key: "spend",       label: "Spend (AED)",    placeholder: "e.g. 18000" },
      { key: "reach",       label: "Reach",          placeholder: "e.g. 300000" },
      { key: "engagements", label: "Engagements",    placeholder: "e.g. 25000" },
      { key: "views",       label: "Views",          placeholder: "e.g. 480000" },
    ],
    derive: [
      { key: "cpe", label: "CPE",    formula: (v) => v.engagements > 0 ? `AED ${(v.spend / v.engagements).toFixed(3)}`           : "—" },
      { key: "er",  label: "Eng. Rate", formula: (v) => v.reach > 0   ? `${((v.engagements / v.reach) * 100).toFixed(2)}%`        : "—" },
    ],
  },
  traffic: {
    collect: [
      { key: "spend",       label: "Spend (AED)",     placeholder: "e.g. 12000" },
      { key: "impressions", label: "Impressions",     placeholder: "e.g. 900000" },
      { key: "clicks",      label: "Clicks",          placeholder: "e.g. 14000" },
      { key: "lpViews",     label: "Landing Page Views (optional)", placeholder: "e.g. 11000" },
    ],
    derive: [
      { key: "ctr", label: "CTR",  formula: (v) => v.impressions > 0 ? `${((v.clicks / v.impressions) * 100).toFixed(2)}%` : "—" },
      { key: "cpc", label: "CPC",  formula: (v) => v.clicks > 0      ? `AED ${(v.spend / v.clicks).toFixed(2)}`            : "—" },
    ],
  },
  conversions: {
    collect: [
      { key: "spend",       label: "Spend (AED)",    placeholder: "e.g. 20000" },
      { key: "clicks",      label: "Clicks",         placeholder: "e.g. 9000" },
      { key: "conversions", label: "Conversions",    placeholder: "e.g. 180" },
      { key: "revenue",     label: "Revenue (optional, AED)", placeholder: "e.g. 85000" },
    ],
    derive: [
      { key: "cpa",  label: "CPA",   formula: (v) => v.conversions > 0            ? `AED ${(v.spend / v.conversions).toFixed(2)}` : "—" },
      { key: "cvr",  label: "CVR",   formula: (v) => v.clicks > 0                 ? `${((v.conversions / v.clicks) * 100).toFixed(2)}%` : "—" },
      { key: "roas", label: "ROAS",  formula: (v) => v.revenue > 0 && v.spend > 0 ? `${(v.revenue / v.spend).toFixed(2)}x`        : "—" },
    ],
  },
};

type WeeklyInputState = Record<WeekNumber, Record<string, number>>;
const emptyWeek = (): Record<string, number> => ({});

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

// ── Overview Tab ───────────────────────────────────────────────────────────
function OverviewTab({
  objective, budget, spent, activeCampaignStatus, weeklyInputs, creatorsCount, deliverablesCount
}: {
  objective: CampaignObjective;
  budget?: number;
  spent?: number;
  activeCampaignStatus?: string | null;
  weeklyInputs: WeeklyInputState;
  creatorsCount?: number;
  deliverablesCount?: number;
}) {
  const fields = OBJECTIVE_FIELDS[objective];

  // Aggregate totals from weekly inputs
  const totals: Record<string, number> = {};
  for (const weekData of Object.values(weeklyInputs)) {
    for (const [k, v] of Object.entries(weekData)) {
      totals[k] = (totals[k] || 0) + v;
    }
  }

  const primaryCollect = fields.collect[1]; // reach / engagements / impressions / clicks (index 1)
  const primaryValue = totals[primaryCollect?.key] ?? 0;

  const budgetUsedPct = budget && budget > 0
    ? Math.min(100, Math.round(((totals.spend || spent || 0) / budget) * 100))
    : 0;

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.38)" }}>{label}</span>
      <span className="text-[12px] font-medium tabular-nums" style={{ color: "rgba(255,255,255,0.85)" }}>{value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CampaignStatusBadge status={activeCampaignStatus} />
      </div>

      <div>
        <Row label="Budget" value={budget ? `AED ${budget.toLocaleString()}` : "—"} />
        <Row label="Spent" value={totals.spend ? `AED ${fmt(totals.spend)}` : spent ? `AED ${fmt(spent)}` : "—"} />
        {budgetUsedPct > 0 && (
          <div className="pt-1 pb-3">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${budgetUsedPct}%`,
                  background: budgetUsedPct > 90 ? "rgba(248,113,113,0.8)" : budgetUsedPct > 70 ? "rgba(251,146,60,0.8)" : "rgba(52,211,153,0.8)",
                }}
              />
            </div>
            <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.30)" }}>{budgetUsedPct}% of budget used</p>
          </div>
        )}
        <Row label={primaryCollect ? `${primaryCollect.label} (actual)` : "Primary KPI"} value={primaryValue > 0 ? fmt(primaryValue) : "—"} />
        <Row label="Objective" value={objective.charAt(0).toUpperCase() + objective.slice(1)} />
        {creatorsCount !== undefined && <Row label="Creators" value={`${creatorsCount}`} />}
        {deliverablesCount !== undefined && <Row label="Deliverables" value={`${deliverablesCount}`} />}
      </div>
    </div>
  );
}

// ── Weekly Input Tab ────────────────────────────────────────────────────────
function WeeklyTab({
  objective,
  weeklyInputs,
  onWeeklyChange,
  isMuted,
}: {
  objective: CampaignObjective;
  weeklyInputs: WeeklyInputState;
  onWeeklyChange: (w: WeekNumber, k: string, v: number) => void;
  isMuted: boolean;
}) {
  const [selectedWeek, setSelectedWeek] = useState<WeekNumber>(1);
  const fields = OBJECTIVE_FIELDS[objective];
  const weekData = weeklyInputs[selectedWeek] ?? {};

  return (
    <div className="space-y-4" style={{ opacity: isMuted ? 0.4 : 1, pointerEvents: isMuted ? "none" : undefined }}>
      {isMuted && (
        <p className="text-[11px] text-center py-1" style={{ color: "rgba(251,146,60,0.70)" }}>
          Inputs paused — campaign is {"{status}"}
        </p>
      )}
      {/* Week selector */}
      <div className="flex gap-1">
        {([1, 2, 3, 4] as WeekNumber[]).map((w) => (
          <button
            key={w}
            onClick={() => setSelectedWeek(w)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            style={{
              background: selectedWeek === w ? "rgba(124,92,255,0.20)" : "rgba(255,255,255,0.04)",
              color: selectedWeek === w ? "rgba(167,139,250,0.90)" : "rgba(255,255,255,0.35)",
              border: `1px solid ${selectedWeek === w ? "rgba(124,92,255,0.35)" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            W{w}
          </button>
        ))}
      </div>

      {/* Collect fields */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Input</p>
        {fields.collect.map((f) => (
          <div key={f.key}>
            <label className="block text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.38)" }}>{f.label}</label>
            <input
              type="number"
              placeholder={f.placeholder}
              value={weekData[f.key] || ""}
              onChange={(e) => onWeeklyChange(selectedWeek, f.key, parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg px-3 py-2 text-[12px] outline-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.80)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Derived metrics */}
      {fields.derive.length > 0 && (
        <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Derived</p>
          {fields.derive.map((d) => (
            <div key={d.key} className="flex items-center justify-between">
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.38)" }}>{d.label}</span>
              <span className="text-[12px] font-medium tabular-nums" style={{ color: "rgba(255,255,255,0.75)" }}>
                {d.formula(weekData)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Summary Tab ─────────────────────────────────────────────────────────────
function SummaryTab({
  objective,
  weeklyInputs,
  budget,
}: {
  objective: CampaignObjective;
  weeklyInputs: WeeklyInputState;
  budget?: number;
}) {
  const fields = OBJECTIVE_FIELDS[objective];

  // Aggregate all weeks
  const totals: Record<string, number> = {};
  const weekTotals: Record<WeekNumber, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const primaryKey = fields.collect[1]?.key ?? "reach";

  for (const [wk, data] of Object.entries(weeklyInputs)) {
    const w = parseInt(wk) as WeekNumber;
    for (const [k, v] of Object.entries(data)) {
      totals[k] = (totals[k] || 0) + v;
    }
    weekTotals[w] = data[primaryKey] ?? 0;
  }

  const bestWeek = (Object.entries(weekTotals) as [string, number][]).reduce(
    (best, [w, v]) => (v > best[1] ? [w, v] : best), ["—", 0]
  );
  const worstWeek = (Object.entries(weekTotals) as [string, number][]).filter(([, v]) => v > 0).reduce(
    (worst, [w, v]) => (v < worst[1] ? [w, v] : worst), ["—", Infinity]
  );

  const totalSpend = totals.spend ?? 0;
  const budgetLeft = budget && budget > 0 ? budget - totalSpend : null;

  // Simple pacing text
  let pacingText = "No data yet";
  let pacingColor = "rgba(255,255,255,0.40)";
  if (totals[primaryKey] && budget) {
    const pct = Math.round((totalSpend / budget) * 100);
    if (pct < 60) { pacingText = "Under-pacing — check delivery"; pacingColor = "rgba(251,146,60,0.80)"; }
    else if (pct > 95) { pacingText = "Over-pacing — review budget"; pacingColor = "rgba(248,113,113,0.80)"; }
    else { pacingText = "On track"; pacingColor = "rgba(52,211,153,0.80)"; }
  }

  const Row = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <div className="flex items-start justify-between py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.38)" }}>{label}</span>
      <span className="text-[12px] font-medium text-right max-w-[55%]" style={{ color: color ?? "rgba(255,255,255,0.85)" }}>{value}</span>
    </div>
  );

  const hasData = Object.values(totals).some((v) => v > 0);

  if (!hasData) {
    return (
      <div className="py-8 text-center">
        <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.30)" }}>
          Enter weekly data to see your summary.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Row label="Total spend" value={totalSpend > 0 ? `AED ${fmt(totalSpend)}` : "—"} />
      {budgetLeft !== null && <Row label="Budget remaining" value={`AED ${fmt(Math.max(0, budgetLeft))}`} color={budgetLeft < 0 ? "rgba(248,113,113,0.85)" : undefined} />}
      <Row label={`Best week (${fields.collect[1]?.label ?? "primary KPI"})`} value={bestWeek[1] > 0 ? `Week ${bestWeek[0]} — ${fmt(bestWeek[1] as number)}` : "—"} />
      <Row label="Weakest week" value={worstWeek[1] !== Infinity ? `Week ${worstWeek[0]} — ${fmt(worstWeek[1] as number)}` : "—"} />
      <Row label="Pacing" value={pacingText} color={pacingColor} />

      {/* Derived totals */}
      {fields.derive.map((d) => (
        <Row key={d.key} label={`Total ${d.label}`} value={d.formula(totals)} />
      ))}

      {/* Next action suggestion */}
      <div className="mt-4 rounded-xl p-3" style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.18)" }}>
        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(167,139,250,0.80)" }}>
          {totalSpend > 0 && budgetLeft !== null && budgetLeft < totalSpend * 0.15
            ? "Budget running low — confirm final deliverables and close outstanding invoices in Pay."
            : "Review deliverable completion in Manage, then settle invoices from Pay."}
        </p>
      </div>
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────────────────────
export function TrackInsightsPanel({
  objective,
  plannedData,
  actualData,
  onPlannedChange,
  onActualChange,
  onWeeklyInputsChange,
  campaignId,
  campaignName,
  clientName,
  budget,
  spent,
  creatorsCount,
  deliverablesCount,
  static: staticMode = false,
  timeRange,
  onTimeRangeChange,
}: TrackInsightsPanelProps) {
  const { activeCampaign } = useCampaign();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [weeklyInputs, setWeeklyInputs] = useState<WeeklyInputState>({ 1: emptyWeek(), 2: emptyWeek(), 3: emptyWeek(), 4: emptyWeek() });

  const handleWeeklyChange = (w: WeekNumber, k: string, v: number) => {
    setWeeklyInputs((prev) => {
      const next = { ...prev, [w]: { ...prev[w], [k]: v } };
      onWeeklyInputsChange?.(next);
      return next;
    });
  };

  const isInactive = activeCampaign?.status === "PAUSED" || activeCampaign?.status === "COMPLETED" || activeCampaign?.status === "CANCELLED";

  const TABS: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "weekly",   label: "Weekly" },
    { id: "summary",  label: "Summary" },
  ];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.07)",
        padding: "18px 18px 20px",
        width: "100%",
      }}
    >
      {/* Header */}
      <div className="mb-4">
        {campaignName && (
          <p className="text-[11px] truncate mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{campaignName}</p>
        )}
        {timeRange !== undefined && onTimeRangeChange ? (
          <div className="mb-3">
            <p className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.28)" }}>
              Chart period
            </p>
            <div className="overflow-x-auto pb-1">
              <TimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />
            </div>
          </div>
        ) : null}
        {/* Tab strip */}
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{
                background: activeTab === t.id ? "rgba(124,92,255,0.18)" : "rgba(255,255,255,0.04)",
                color: activeTab === t.id ? "rgba(167,139,250,0.90)" : "rgba(255,255,255,0.35)",
                border: `1px solid ${activeTab === t.id ? "rgba(124,92,255,0.30)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <OverviewTab
          objective={objective}
          budget={budget}
          spent={spent}
          activeCampaignStatus={activeCampaign?.status}
          weeklyInputs={weeklyInputs}
          creatorsCount={creatorsCount}
          deliverablesCount={deliverablesCount}
        />
      )}
      {activeTab === "weekly" && (
        <WeeklyTab
          objective={objective}
          weeklyInputs={weeklyInputs}
          onWeeklyChange={handleWeeklyChange}
          isMuted={isInactive}
        />
      )}
      {activeTab === "summary" && (
        <SummaryTab
          objective={objective}
          weeklyInputs={weeklyInputs}
          budget={budget}
        />
      )}
    </div>
  );
}
