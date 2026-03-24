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
import { campaignTheme } from "@/lib/campaign-theme";
import type { DashboardMode, TimeRange } from "./CampaignIntelligenceDashboard";

interface CampaignIntelligenceGraphProps {
  mode: DashboardMode;
  timeRange: TimeRange;
  campaignIds: string[];
  metrics: string[];
}

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

export function CampaignIntelligenceGraph({
  mode,
  timeRange,
  campaignIds,
  metrics,
}: CampaignIntelligenceGraphProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate date range
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    const days = timeRange === "1D" ? 1 : timeRange === "7D" ? 7 : timeRange === "30D" ? 30 : 90;
    start.setDate(start.getDate() - days);
    return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
  }, [timeRange]);

  // Fetch data from API
  useEffect(() => {
    if (campaignIds.length === 0) {
      // Generate mock data when no campaigns selected
      const days = timeRange === "1D" ? 1 : timeRange === "7D" ? 7 : timeRange === "30D" ? 30 : 90;
      const mockData: DataPoint[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const point: DataPoint = { date: date.toISOString().split("T")[0] };
        if (mode === "track") {
          if (metrics.includes("views")) point.views = Math.floor(50000 + Math.random() * 20000 + i * 1000);
          if (metrics.includes("reach")) point.reach = Math.floor(800000 + Math.random() * 100000 + i * 5000);
          if (metrics.includes("engagements")) point.engagements = Math.floor(5000 + Math.random() * 2000 + i * 100);
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
          // Transform API data to match graph format
          const transformed = result.data.map((d: any) => {
            const point: DataPoint = { date: d.date };
            if (mode === "track") {
              if (metrics.includes("views")) point.views = d.views || 0;
              if (metrics.includes("reach")) point.reach = d.reach || 0;
              if (metrics.includes("engagements")) point.engagements = d.engagements || 0;
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
        // Fallback to empty data on error
        setData([]);
      });
  }, [mode, timeRange, campaignIds, metrics, dateRange]);

  const displayData = data;

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
    views: campaignTheme.colors.primary,
    reach: campaignTheme.colors.secondary,
    engagements: campaignTheme.graph.line.tertiary,
    budgetSpent: campaignTheme.colors.primary,
    budgetAllocated: campaignTheme.colors.secondary,
    remainingBudget: campaignTheme.graph.line.tertiary,
    amountPaid: campaignTheme.colors.primary,
    amountCommitted: campaignTheme.colors.secondary,
    outstandingBalance: campaignTheme.graph.line.tertiary,
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const point = displayData.find((d) => d.date === label);
    if (!point) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/20 bg-[#0B0B0E]/95 backdrop-blur-xl p-4 shadow-2xl"
        style={{ minWidth: "200px" }}
      >
        <div className="mb-2 text-xs font-medium text-[#9B9B9B]">{formatDate(label)}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="mb-1 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-[#EDEDED]">{entry.dataKey}</span>
            </div>
            <span className="text-xs font-semibold text-[#EDEDED]">
              {formatValue(entry.value, entry.dataKey)}
            </span>
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="relative h-full w-full rounded-xl border border-white/10 bg-[#0B0B0E]/50 backdrop-blur-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={campaignTheme.colors.primary} stopOpacity={0.3} />
              <stop offset="100%" stopColor={campaignTheme.colors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={campaignTheme.colors.grid}
            opacity={campaignTheme.graph.grid.opacity}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke={campaignTheme.colors.text.muted}
            tick={{ fill: campaignTheme.colors.text.muted, fontSize: 11 }}
            axisLine={{ stroke: campaignTheme.colors.grid }}
          />
          <YAxis
            stroke={campaignTheme.colors.text.muted}
            tick={{ fill: campaignTheme.colors.text.muted, fontSize: 11 }}
            axisLine={{ stroke: campaignTheme.colors.grid }}
            tickFormatter={(value) => formatValue(value, "")}
          />
          <Tooltip content={<CustomTooltip />} />
          {metrics.map((metric) => {
            const color = metricColors[metric] || campaignTheme.colors.primary;
            return (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color }}
                animationDuration={300}
                animationEasing="ease-out"
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

