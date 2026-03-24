"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from "recharts";
import { type KPIData } from "./KPIPlanner";
import { PerformanceSummaryCard } from "./PerformanceSummaryCard";
import { LegendPanel } from "./LegendPanel";
import { type CampaignDataPoint, type Asset } from "@/types/campaign";
import { FeyMeshLayer } from "./primitives/FeyMeshLayer";
import { CAMPAIGN_OBJECTIVES, type CampaignObjective, getValueFromAsset, getValueFromPlanned, formatValue } from "@/lib/campaignObjectives";
import { feyTokens } from "@/lib/fey-design-tokens";

type TimeRange = "1D" | "7D" | "30D" | "90D" | "YTD" | "custom";

export interface TrackChartProps {
  timeRange: TimeRange;
  campaignIds: string[];
  metrics: string[];
  talentNames?: string[];
  objective?: CampaignObjective;
  onObjectiveChange?: (objective: CampaignObjective) => void;
  plannedData?: KPIData | null;
  actualData?: KPIData | null;
  onPlannedChange?: (data: KPIData) => void;
  onActualChange?: (data: KPIData) => void;
}

const ACCENT_RED = "#F63148";

// Build demo assets — uses real talent names from campaign context when available
function buildDemoAssets(talentNames?: string[]): Asset[] {
  // Prefer real campaign talent names; single neutral row when none yet (no fake roster)
  const names = talentNames && talentNames.length > 0 ? talentNames : ["Your campaign"];
  const platforms: Array<Asset["platform"]> = ["IG", "TikTok", "YouTube", "IG"];
  return names.slice(0, 3).map((name, i): Asset => ({
    id: `asset-${i + 1}`,
    title: i === 0 ? "Reel 01 — Brand Launch" : i === 1 ? "Short-form — Product Demo" : "Story Series",
    platform: platforms[i % platforms.length],
    postingAccount: { id: `talent-${name.toLowerCase().replace(/\s/g, "-")}`, name, role: "Content Creator" },
    contributors: [],
    metrics: {
      impressions: 680000 - i * 80000,
      reach:       490000 - i * 60000,
      views:       390000 - i * 50000,
      engagements: 18200  - i * 2000,
      clicks:      13400  - i * 1500,
      conversions: 52     - i * 6,
    },
    postedDate: new Date(Date.now() - (8 - i * 2) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  }));
}

export function TrackChart({ timeRange, campaignIds, metrics, talentNames, objective: propObjective, onObjectiveChange, plannedData: propPlannedData, actualData: propActualData, onPlannedChange, onActualChange }: TrackChartProps) {
  const [data, setData] = useState<CampaignDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalObjective, setInternalObjective] = useState<CampaignObjective>("awareness");
  const objective = propObjective || internalObjective;
  const [internalPlannedData, setInternalPlannedData] = useState<KPIData | null>(null);
  const [internalActualData, setInternalActualData] = useState<KPIData | null>(null);
  const plannedData = propPlannedData !== undefined ? propPlannedData : internalPlannedData;
  const actualData = propActualData !== undefined ? propActualData : internalActualData;

  // Build assets from real talent names (updates when campaign changes)
  const MOCK_ASSETS = useMemo(() => buildDemoAssets(talentNames), [talentNames]);
  const [visibleAssets, setVisibleAssets] = useState<Set<string>>(new Set(MOCK_ASSETS.map(a => a.id)));
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);

  // Reset visible assets when talent list changes
  useEffect(() => {
    setVisibleAssets(new Set(MOCK_ASSETS.map(a => a.id)));
  }, [MOCK_ASSETS]);
  const [hoveredXIndex, setHoveredXIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  const objectiveConfig = CAMPAIGN_OBJECTIVES[objective as CampaignObjective];

  // Generate correct date range ending today
  const getDateRange = (range: TimeRange): { startDate: Date; endDate: Date; days: number } => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of today
    
    let startDate = new Date();
    let days = 1;

    switch (range) {
      case "1D":
        days = 1;
        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "7D":
        days = 7;
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6); // 7 days including today
        startDate.setHours(0, 0, 0, 0);
        break;
      case "30D":
        days = 30;
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 29); // 30 days including today
        startDate.setHours(0, 0, 0, 0);
        break;
      case "90D":
        days = 90;
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 89); // 90 days including today
        startDate.setHours(0, 0, 0, 0);
        break;
      case "YTD":
        startDate = new Date(endDate.getFullYear(), 0, 1);
        days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        break;
      default:
        days = 30;
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate, days };
  };

  // Generate data based on objective with correct date range
  const generateData = (range: TimeRange): CampaignDataPoint[] => {
    const { startDate, endDate, days } = getDateRange(range);
    const points: CampaignDataPoint[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const point: CampaignDataPoint = {
        date: date.toISOString().split("T")[0],
        day: i + 1,
        assets: {},
      };

      // Planned line
      if (plannedData) {
        const targetValue = getValueFromPlanned(plannedData, objectiveConfig.primary);
        const progress = i / (days - 1);
        const curve = progress < 0.3 ? progress * 2 : 0.6 + (progress - 0.3) * 0.4 * (1 - Math.exp(-(progress - 0.3) * 5));
        point.planned = Math.floor(targetValue * curve * (0.8 + Math.random() * 0.2));
      }

      // Asset lines (flattened for Recharts)
      let aggregateSum = 0;
      MOCK_ASSETS.forEach((asset, assetIndex) => {
        const assetPostDay = Math.floor((new Date(asset.postedDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        let assetValue = 0;
        
        if (i === assetPostDay) {
          // Post day - use base value
          assetValue = getValueFromAsset(asset, objectiveConfig.primary) * (0.9 + Math.random() * 0.2);
        } else if (i > assetPostDay && i <= assetPostDay + 7) {
          // Decay over 7 days after post
          const daysSincePost = i - assetPostDay;
          const baseValue = getValueFromAsset(asset, objectiveConfig.primary);
          assetValue = baseValue * Math.exp(-daysSincePost * 0.15) * (0.8 + Math.random() * 0.2);
        }
        
        // Flatten for Recharts
        (point as any)[`asset_${asset.id}`] = assetValue;
        point.assets![asset.id] = assetValue;
        
        if (visibleAssets.has(asset.id)) {
          aggregateSum += assetValue;
        }
      });

      // Campaign aggregate
      point.campaignAggregate = aggregateSum;

      points.push(point);
    }

    return points;
  };

  // Filter metrics to only include allowedMetrics for current objective
  const filteredMetrics = useMemo(() => {
    return metrics.filter((m) => CAMPAIGN_OBJECTIVES[objective as CampaignObjective].allowedMetrics.includes(m));
  }, [metrics, objective]);

  useEffect(() => {
    const generated = generateData(timeRange);
    setData(generated);
    setLoading(false);
  }, [timeRange, plannedData, objective, visibleAssets]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === "1D") {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Deterministic tooltip - shows all series at hovered x-index
  const CustomTooltip = ({ active, payload, label, coordinate }: any) => {
    if (!active || !payload || !payload.length) return null;

    const point = payload[0].payload as CampaignDataPoint;
    const chartRect = chartRef.current?.getBoundingClientRect();
    if (!chartRect) return null;

    // Determine tooltip position (collision-aware)
    const cursorX = coordinate?.x || 0;
    const chartWidth = chartRect.width - 280 - 48; // minus legend and padding
    const anchorLeft = cursorX > chartWidth * 0.65;

    // Get all visible series at this point - PRIMARY KPI ONLY
    const series: Array<{ name: string; value: number; color: string }> = [];

    // Campaign aggregate
    if (point.campaignAggregate !== undefined && point.campaignAggregate > 0) {
      series.push({
        name: "Campaign Aggregate",
        value: point.campaignAggregate,
        color: ACCENT_RED,
      });
    }

    // Asset lines - PRIMARY KPI ONLY
    Object.entries(point.assets || {}).forEach(([assetId, value]) => {
      if (visibleAssets.has(assetId) && (value as number) > 0) {
        const asset = MOCK_ASSETS.find(a => a.id === assetId);
        if (asset) {
          const colors = ["#F63148", "#E3A23A", "#8B5CF6", "#10B981", "#3B82F6"];
          const assetIndex = MOCK_ASSETS.findIndex(a => a.id === assetId);
          
          series.push({
            name: `${asset.postingAccount.name} — ${asset.title}`,
            value: value as number,
            color: colors[assetIndex % colors.length],
          });
        }
      }
    });

    // Planned line
    if (point.planned !== undefined && point.planned > 0) {
      series.push({
        name: "Planned",
        value: point.planned,
        color: "rgba(255,255,255,0.35)",
      });
    }

    if (series.length === 0) return null;

    return (
      <div
        className="rounded-lg border p-3"
        style={{
          background: "rgba(0,0,0,0.55)",
          borderColor: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
          minWidth: "240px",
          ...(anchorLeft ? { marginLeft: "-240px" } : {}),
        }}
      >
        <div
          className="mb-2 text-[10px] font-medium uppercase tracking-wider"
          style={{ color: "rgba(255,255,255,0.40)" }}
        >
          {formatDateFull(label)}
        </div>
        <div className="space-y-1.5">
          {series.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span
                  className="text-[11px]"
                  style={{ color: "rgba(255,255,255,0.60)" }}
                >
                  {s.name}
                </span>
              </div>
              <span
                className="text-[11px] font-semibold tabular-nums"
                style={{ color: "rgba(255,255,255,0.92)" }}
              >
                {formatValue(s.value, objectiveConfig.primary)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const hasData = data.length > 0 || plannedData !== null;

  const toggleAsset = (assetId: string) => {
    const newVisible = new Set(visibleAssets);
    if (newVisible.has(assetId)) {
      newVisible.delete(assetId);
    } else {
      newVisible.add(assetId);
    }
    setVisibleAssets(newVisible);
  };

  const getPrimaryValue = (asset: Asset): number => {
    return getValueFromAsset(asset, objectiveConfig.primary);
  };

  const getPrimaryLabel = () => {
    return objectiveConfig.primary.toUpperCase();
  };

  // Line colors
  const lineColors = ["#F63148", "#E3A23A", "#8B5CF6", "#10B981", "#3B82F6"];

  return (
    <div
      ref={chartRef}
      data-chart-container
      className="relative rounded-[24px]"
      style={{
        height: "460px",
        background: "radial-gradient(100% 100% at 50% 30%, rgba(255,77,77,0.12) 0%, rgba(0,0,0,0.95) 100%)",
        backdropFilter: "blur(20px)",
        padding: "24px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <FeyMeshLayer variant="chart" intensity="medium" className="absolute inset-0 rounded-[24px] pointer-events-none">
        <div />
      </FeyMeshLayer>
      <div className="relative h-full w-full">
        {/* Campaign Objective Row + Campaign Selector */}
        <div className="absolute top-[24px] left-[24px] right-[24px] z-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="text-[11px] font-medium uppercase"
              style={{
                color: "rgba(255,255,255,0.40)",
                letterSpacing: "0.08em",
              }}
            >
              CAMPAIGN OBJECTIVE
            </div>
            <div className="flex items-center gap-2">
              {(["awareness", "engagement", "traffic", "conversions"] as const).map((obj) => (
                <button
                  key={obj}
                  onClick={() => {
                    setInternalObjective(obj);
                    // Notify parent if callback provided
                    if (onObjectiveChange) {
                      onObjectiveChange(obj);
                    }
                  }}
                  className="rounded-full px-3 font-semibold transition-all"
                  style={{
                    height: "32px",
                    fontSize: "12px",
                    backgroundColor: objective === obj ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                    color: objective === obj ? "#ffffff" : "rgba(255,255,255,0.72)",
                  }}
                >
                  {obj.charAt(0).toUpperCase() + obj.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
        </div>

        {/* Performance Summary Card - Restored */}
        <div className="absolute top-[72px] right-[24px] z-20">
          <PerformanceSummaryCard
            planned={plannedData}
            actual={actualData}
            objective={objective}
          />
        </div>

        {/* Chart Area with Legend Panel */}
        <div className="h-full pt-16 pb-4 flex gap-6">
          {/* Legend Panel */}
          <LegendPanel
            assets={MOCK_ASSETS}
            visibleAssets={visibleAssets}
            onToggleAsset={toggleAsset}
            onHoverAsset={setHoveredAsset}
            objective={objective}
            getPrimaryValue={getPrimaryValue}
            formatPrimaryValue={(v) => formatValue(v, objectiveConfig.primary)}
            getPrimaryLabel={getPrimaryLabel}
          />

          {/* Chart */}
          <div className="flex-1 relative" style={{ width: "calc(100% - 280px - 24px)" }}>
            {!hasData && !loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                  <div
                    className="text-base font-semibold"
                    style={{ color: "rgba(255,255,255,0.92)" }}
                  >
                    No live performance yet
                  </div>
                  <div
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.60)" }}
                  >
                    Add planned metrics to generate a forecast. When posts go live, drop in actuals to compare.
                  </div>
                  <button
                    className="rounded-full border px-4 font-medium transition-colors hover:bg-white/10"
                    style={{
                      height: "36px",
                      borderColor: "rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.85)",
                    }}
                    onClick={() => {
                      // KPIs panel handles this now
                    }}
                  >
                    Add planned metrics
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Axis Labels - positioned to avoid overlap */}
                <div
                  className="absolute bottom-0 left-4 z-10"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.38)",
                  }}
                >
                  Time
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 40, right: 16, left: 16, bottom: 32 }}>
                    <defs>
                      <linearGradient id="aggregateArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(220, 70, 70, 0.75)" />
                        <stop offset="100%" stopColor="rgba(220, 70, 70, 0.05)" />
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid
                      strokeDasharray="2 6"
                      stroke="rgba(255,255,255,0.08)"
                      vertical={false}
                      horizontal={true}
                    />
                    
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke="rgba(255,255,255,0.08)"
                      tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                      tickLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      height={40}
                    />
                    
                    <YAxis
                      stroke="rgba(255,255,255,0.08)"
                      tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                      tickLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      width={60}
                      tickFormatter={(v) => formatValue(v, objectiveConfig.primary)}
                      label={{
                        value: objectiveConfig.yAxisLabel,
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fontSize: "11px",
                          fontWeight: 500,
                          fill: "rgba(255,255,255,0.38)",
                        },
                      }}
                    />
                    
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Vertical reference line on hover */}
                    {hoveredXIndex !== null && (
                      <ReferenceLine
                        x={hoveredXIndex}
                        stroke="rgba(255,255,255,0.10)"
                        strokeWidth={1}
                      />
                    )}
                    
                    {/* Planned line */}
                    {plannedData && (
                      <Line
                        type="monotone"
                        dataKey="planned"
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth={2}
                        strokeDasharray="6 6"
                        dot={false}
                        activeDot={{ r: 8, fill: "rgba(255,255,255,0.35)", strokeWidth: 0 }}
                      />
                    )}
                    
                    {/* Campaign aggregate (thick line) */}
                    <Area
                      type="monotone"
                      dataKey="campaignAggregate"
                      fill="url(#aggregateArea)"
                      stroke="none"
                    />
                    <Line
                      type="monotone"
                      dataKey="campaignAggregate"
                      stroke="#FF4D4D"
                      strokeWidth={2.5}
                      strokeOpacity={0.9}
                      dot={false}
                      activeDot={{ r: 6, fill: "#FF4D4D", strokeWidth: 0 }}
                      style={{
                        filter: "drop-shadow(0 0 24px rgba(255,77,77,0.35))",
                      }}
                    />
                    
                    {/* Asset lines (thin) */}
                    {MOCK_ASSETS.map((asset, index) => {
                      if (!visibleAssets.has(asset.id)) return null;
                      return (
                        <Line
                          key={asset.id}
                          type="monotone"
                          dataKey={`asset_${asset.id}`}
                          stroke={lineColors[index % lineColors.length]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6, fill: lineColors[index % lineColors.length], strokeWidth: 0 }}
                          opacity={hoveredAsset === asset.id ? 1 : 0.7}
                          style={{
                            filter: hoveredAsset === asset.id ? "drop-shadow(0 0 4px rgba(246,49,72,0.3))" : "none",
                          }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
