"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import type { DashboardMode, TimeRange } from "@/features/campaign-intelligence/CampaignIntelligenceDashboard";
import { CAMPAIGN_OBJECTIVES, type CampaignObjective } from "@/lib/campaignObjectives";

interface HeroChartProps {
  mode: DashboardMode;
  timeRange: TimeRange;
  campaignIds: string[];
  metrics: string[];
  objective?: CampaignObjective;
}

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

export function HeroChart({ mode, timeRange, campaignIds, metrics, objective }: HeroChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter metrics to only include allowedMetrics for current objective (track mode only)
  const filteredMetrics = useMemo(() => {
    if (mode === "track" && objective) {
      const allowedMetrics = CAMPAIGN_OBJECTIVES[objective].allowedMetrics;
      return metrics.filter((m) => allowedMetrics.includes(m));
    }
    return metrics;
  }, [mode, objective, metrics]);

  const yAxisLabel = mode === "track" && objective 
    ? CAMPAIGN_OBJECTIVES[objective].yAxisLabel 
    : undefined;

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    const days = timeRange === "1D" ? 1 : timeRange === "7D" ? 7 : timeRange === "30D" ? 30 : 90;
    start.setDate(start.getDate() - days);
    return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
  }, [timeRange]);

  useEffect(() => {
    if (campaignIds.length === 0) {
      // Generate mock data
      const days = timeRange === "1D" ? 1 : timeRange === "7D" ? 7 : timeRange === "30D" ? 30 : 90;
      const mockData: DataPoint[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const point: DataPoint = { date: date.toISOString().split("T")[0] };
        if (mode === "track") {
          if (filteredMetrics.includes("reach")) point.reach = Math.floor(800000 + Math.random() * 100000 + i * 5000);
          if (filteredMetrics.includes("impressions")) point.impressions = Math.floor(1000000 + Math.random() * 200000 + i * 10000);
          if (filteredMetrics.includes("engagements")) point.engagements = Math.floor(5000 + Math.random() * 2000 + i * 100);
          if (filteredMetrics.includes("clicks")) point.clicks = Math.floor(2000 + Math.random() * 500 + i * 50);
          if (filteredMetrics.includes("conversions")) point.conversions = Math.floor(10 + Math.random() * 5 + i);
        } else if (mode === "manage") {
          if (metrics.includes("budgetSpent")) point.budgetSpent = Math.floor(20000 + Math.random() * 5000 + i * 200);
          if (metrics.includes("budgetAllocated")) point.budgetAllocated = 25000;
          if (metrics.includes("remainingBudget")) point.remainingBudget = 25000 - (Math.floor(20000 + Math.random() * 5000 + i * 200) as number);
        } else if (mode === "pay") {
          if (metrics.includes("amountPaid")) point.amountPaid = Math.floor(15000 + Math.random() * 3000 + i * 150);
          if (metrics.includes("amountCommitted")) point.amountCommitted = 20000;
          if (metrics.includes("outstandingBalance")) point.outstandingBalance = 20000 - (Math.floor(15000 + Math.random() * 3000 + i * 150) as number);
        }
        mockData.push(point);
      }
      setData(mockData);
      setLoading(false);
      return;
    }

    setLoading(true);
    const endpoint = mode === "pay" ? "/api/campaigns/payments" : "/api/campaigns/metrics";
    const params = new URLSearchParams({
      campaignIds: campaignIds.join(","),
      startDate: dateRange.start,
      endDate: dateRange.end,
    });

    fetch(`${endpoint}?${params}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.data) {
          const transformed = result.data.map((d: any) => {
            const point: DataPoint = { date: d.date };
            if (mode === "track") {
              if (filteredMetrics.includes("reach")) point.reach = d.reach || 0;
              if (filteredMetrics.includes("impressions")) point.impressions = d.impressions || 0;
              if (filteredMetrics.includes("engagements")) point.engagements = d.engagements || 0;
              if (filteredMetrics.includes("clicks")) point.clicks = d.clicks || 0;
              if (filteredMetrics.includes("conversions")) point.conversions = d.conversions || 0;
            } else if (mode === "manage") {
              if (metrics.includes("budgetSpent")) point.budgetSpent = d.spend || 0;
              if (metrics.includes("budgetAllocated")) point.budgetAllocated = d.budgetAllocated || 0;
              if (metrics.includes("remainingBudget")) point.remainingBudget = (d.budgetAllocated || 0) - (d.spend || 0);
            } else if (mode === "pay") {
              if (metrics.includes("amountPaid")) point.amountPaid = d.amountPaid || 0;
              if (metrics.includes("amountCommitted")) point.amountCommitted = d.amountCommitted || 0;
              if (metrics.includes("outstandingBalance")) point.outstandingBalance = d.outstandingBalance || 0;
            }
            return point;
          });
          setData(transformed);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setData([]);
      });
  }, [mode, timeRange, campaignIds, metrics, dateRange]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === "1D") return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatValue = (value: number, metric: string) => {
    if (metric.includes("Budget") || metric.includes("amount") || metric.includes("Balance")) {
      return `AED ${(value / 1000).toFixed(1)}K`;
    }
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-white/10 bg-[#0A0A0E]/95 backdrop-blur-xl p-3 shadow-2xl"
        style={{ minWidth: "180px" }}
      >
        <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
          {formatDate(label)}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="mb-1.5 flex items-center justify-between gap-3 last:mb-0">
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[11px] text-white/80">{metricLabels[entry.dataKey] || entry.dataKey}</span>
            </div>
            <span className="text-[11px] font-semibold text-white">
              {formatValue(entry.value, entry.dataKey)}
            </span>
          </div>
        ))}
      </motion.div>
    );
  };

  // Get latest values for right-side tags
  const latestValues = useMemo(() => {
    if (data.length === 0) return [];
    const lastPoint = data[data.length - 1];
    return filteredMetrics
      .map((metric) => {
        const value = lastPoint[metric];
        if (value === undefined) return null;
        return {
          metric,
          value: typeof value === "number" ? value : 0,
          color: metricColors[metric] || "#E5484D",
          label: metricLabels[metric] || metric,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
  }, [data, filteredMetrics]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-[22px] border border-white/8 bg-white/[0.02]">
        <div className="text-white/40 text-sm">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-[22px] border border-white/8 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 24, right: 80, left: 24, bottom: 24 }}>
          <defs>
            <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E5484D" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#E5484D" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickFormatter={(value) => formatValue(value, "")}
            width={60}
            label={yAxisLabel ? {
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
              style: {
                textAnchor: "middle",
                fontSize: "10px",
                fill: "rgba(255,255,255,0.5)",
              },
            } : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          {filteredMetrics.map((metric) => {
            const color = metricColors[metric] || "#E5484D";
            return (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
                animationDuration={300}
                animationEasing="ease-out"
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Right-side value tags (Fey-style) */}
      {latestValues.length > 0 && (
        <div className="absolute right-4 top-6 flex flex-col gap-2">
          {latestValues.map((item, index) => (
            <motion.div
              key={item.metric}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-md border border-white/10 bg-[#0A0A0E]/80 backdrop-blur-sm px-2.5 py-1.5"
            >
              <div className="mb-0.5 flex items-center gap-1.5">
                <div
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[9px] font-medium uppercase tracking-wider text-white/50">
                  {item.label}
                </span>
              </div>
              <div className="text-xs font-semibold text-white">
                {formatValue(item.value, item.metric)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


