"use client";

import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "./primitives/FeySurface";
import type { KPIData } from "./KPIInputStrip";

interface CampaignPerformanceSummaryProps {
  objective: "awareness" | "engagement" | "traffic" | "conversions";
  planned: Partial<KPIData> | null;
  actual: Partial<KPIData> | null;
}

export function CampaignPerformanceSummary({
  objective,
  planned,
  actual,
}: CampaignPerformanceSummaryProps) {
  // Calculate derived metrics
  const calculateCPM = (cost: number, impressions: number) => {
    if (!impressions || impressions === 0) return null;
    return cost / (impressions / 1000);
  };

  const calculateCPE = (cost: number, engagements: number) => {
    if (!engagements || engagements === 0) return null;
    return cost / engagements;
  };

  const calculateCPV = (cost: number, views: number) => {
    if (!views || views === 0) return null;
    return cost / views;
  };

  const calculateCPA = (cost: number, conversions: number) => {
    if (!conversions || conversions === 0) return null;
    return cost / conversions;
  };

  const calculateER = (engagements: number, impressions: number) => {
    if (!impressions || impressions === 0) return null;
    return (engagements / impressions) * 100;
  };

  // Get metrics based on objective
  const getMetrics = () => {
    if (!planned || !actual) return null;

    switch (objective) {
      case "awareness": {
        const plannedCPM = planned.totalCost && planned.impressions
          ? calculateCPM(planned.totalCost, planned.impressions)
          : null;
        const actualCPM = actual.totalCost && actual.impressions
          ? calculateCPM(actual.totalCost, actual.impressions)
          : null;
        const plannedER = planned.engagements && planned.impressions
          ? calculateER(planned.engagements, planned.impressions)
          : null;
        const actualER = actual.engagements && actual.impressions
          ? calculateER(actual.engagements, actual.impressions)
          : null;

        return {
          primary: {
            label: "Impressions",
            planned: planned.impressions || 0,
            actual: actual.impressions || 0,
          },
          cpm: {
            label: "CPM",
            planned: plannedCPM,
            actual: actualCPM,
            format: (v: number | null) => v ? `AED ${v.toFixed(2)}` : "—",
          },
          er: {
            label: "ER%",
            planned: plannedER,
            actual: actualER,
            format: (v: number | null) => v ? `${v.toFixed(1)}%` : "—",
          },
        };
      }
      case "engagement": {
        const plannedCPE = planned.totalCost && planned.engagements
          ? calculateCPE(planned.totalCost, planned.engagements)
          : null;
        const actualCPE = actual.totalCost && actual.engagements
          ? calculateCPE(actual.totalCost, actual.engagements)
          : null;
        const plannedER = planned.engagements && planned.impressions
          ? calculateER(planned.engagements, planned.impressions)
          : null;
        const actualER = actual.engagements && actual.impressions
          ? calculateER(actual.engagements, actual.impressions)
          : null;

        return {
          primary: {
            label: "Engagements",
            planned: planned.engagements || 0,
            actual: actual.engagements || 0,
          },
          cpe: {
            label: "CPE",
            planned: plannedCPE,
            actual: actualCPE,
            format: (v: number | null) => v ? `AED ${v.toFixed(2)}` : "—",
          },
          er: {
            label: "ER%",
            planned: plannedER,
            actual: actualER,
            format: (v: number | null) => v ? `${v.toFixed(1)}%` : "—",
          },
        };
      }
      case "traffic": {
        const plannedCPC = planned.totalCost && planned.linkClicks
          ? planned.totalCost / planned.linkClicks
          : null;
        const actualCPC = actual.totalCost && actual.linkClicks
          ? actual.totalCost / actual.linkClicks
          : null;

        return {
          primary: {
            label: "Link Clicks",
            planned: planned.linkClicks || 0,
            actual: actual.linkClicks || 0,
          },
          cpc: {
            label: "CPC",
            planned: plannedCPC,
            actual: actualCPC,
            format: (v: number | null) => v ? `AED ${v.toFixed(2)}` : "—",
          },
        };
      }
      case "conversions": {
        const plannedCPA = planned.totalCost && planned.conversions
          ? calculateCPA(planned.totalCost, planned.conversions)
          : null;
        const actualCPA = actual.totalCost && actual.conversions
          ? calculateCPA(actual.totalCost, actual.conversions)
          : null;

        return {
          primary: {
            label: "Conversions",
            planned: planned.conversions || 0,
            actual: actual.conversions || 0,
          },
          cpa: {
            label: "CPA",
            planned: plannedCPA,
            actual: actualCPA,
            format: (v: number | null) => v ? `AED ${v.toFixed(2)}` : "—",
          },
        };
      }
    }
  };

  // Calculate performance grade
  const calculateGrade = () => {
    if (!planned || !actual) return { grade: "On track", color: feyTokens.colors.status.warning };

    const metrics = getMetrics();
    if (!metrics) return { grade: "On track", color: feyTokens.colors.status.warning };

    const primary = metrics.primary;
    if (!primary.planned || primary.planned === 0) return { grade: "On track", color: feyTokens.colors.status.warning };

    const delta = ((primary.actual - primary.planned) / primary.planned) * 100;

    // For cost metrics, invert the logic
    const costMetric = metrics.cpm || metrics.cpe || metrics.cpc || metrics.cpa;
    let score = delta;
    if (costMetric && costMetric.planned && costMetric.actual && costMetric.planned > 0) {
      const costDelta = ((costMetric.planned - costMetric.actual) / costMetric.planned) * 100;
      score = (delta * 0.6) + (costDelta * 0.4);
    }

    if (score >= 25) {
      return { grade: "Exceptional", color: feyTokens.colors.status.success };
    } else if (score >= 5) {
      return { grade: "Strong", color: feyTokens.colors.status.success };
    } else if (score >= -10) {
      return { grade: "On track", color: feyTokens.colors.status.warning };
    } else if (score >= -30) {
      return { grade: "Needs attention", color: feyTokens.colors.status.warning };
    } else {
      return { grade: "At risk", color: feyTokens.colors.status.error };
    }
  };

  const metrics = getMetrics();
  const grade = calculateGrade();

  if (!metrics) {
    return (
      <FeySurface variant="card" padding="md" className="w-72">
        <div
          className="text-xs"
          style={{ color: feyTokens.colors.text.muted }}
        >
          Add planned and actual metrics to see performance summary.
        </div>
      </FeySurface>
    );
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const getDelta = (planned: number, actual: number) => {
    if (!planned || planned === 0) return null;
    return ((actual - planned) / planned) * 100;
  };

  return (
    <FeySurface variant="card" padding="md" className="w-80">
      <div className="mb-3 flex items-center justify-between">
        <div
          className="text-[9px] font-medium uppercase tracking-wider"
          style={{ color: feyTokens.colors.text.label }}
        >
          Campaign Performance Summary
        </div>
        <div
          className="rounded-full px-2 py-0.5 text-[9px] font-medium"
          style={{
            background: `${grade.color}20`,
            color: grade.color,
          }}
        >
          {grade.grade}
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Primary Metric */}
        <div>
          <div
            className="mb-1 text-[9px] font-medium uppercase tracking-wider"
            style={{ color: feyTokens.colors.text.label }}
          >
            {metrics.primary.label}
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span style={{ color: feyTokens.colors.text.muted }}>Planned:</span>
              <span style={{ color: feyTokens.colors.text.primary }} className="font-medium tabular-nums">
                {formatNumber(metrics.primary.planned)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: feyTokens.colors.text.muted }}>Actual:</span>
              <span style={{ color: feyTokens.colors.text.primary }} className="font-medium tabular-nums">
                {formatNumber(metrics.primary.actual)}
              </span>
            </div>
          </div>
          {(() => {
            const delta = getDelta(metrics.primary.planned, metrics.primary.actual);
            if (delta === null) return null;
            return (
              <div
                className="mt-1 text-[10px] font-medium"
                style={{
                  color: delta >= 0 ? feyTokens.colors.status.success : feyTokens.colors.status.error,
                }}
              >
                {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
              </div>
            );
          })()}
        </div>

        {/* Cost Metrics */}
        {(metrics.cpm || metrics.cpe || metrics.cpc || metrics.cpa) && (
          <div>
            <div
              className="mb-1 text-[9px] font-medium uppercase tracking-wider"
              style={{ color: feyTokens.colors.text.label }}
            >
              {(metrics.cpm || metrics.cpe || metrics.cpc || metrics.cpa)?.label}
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span style={{ color: feyTokens.colors.text.muted }}>Planned:</span>
                <span style={{ color: feyTokens.colors.text.primary }} className="font-medium tabular-nums">
                  {(metrics.cpm || metrics.cpe || metrics.cpc || metrics.cpa)?.format(
                    (metrics.cpm || metrics.cpe || metrics.cpc || metrics.cpa)?.planned || null
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: feyTokens.colors.text.muted }}>Actual:</span>
                <span style={{ color: feyTokens.colors.text.primary }} className="font-medium tabular-nums">
                  {(metrics.cpm || metrics.cpe || metrics.cpc || metrics.cpa)?.format(
                    (metrics.cpm || metrics.cpe || metrics.cpc || metrics.cpa)?.actual || null
                  )}
                </span>
              </div>
            </div>
            {(() => {
              const costMetric = metrics.cpm || metrics.cpe || metrics.cpc || metrics.cpa;
              if (!costMetric?.planned || !costMetric?.actual || costMetric.planned === 0) return null;
              const delta = ((costMetric.planned - costMetric.actual) / costMetric.planned) * 100;
              return (
                <div
                  className="mt-1 text-[10px] font-medium"
                  style={{
                    color: delta >= 0 ? feyTokens.colors.status.success : feyTokens.colors.status.error,
                  }}
                >
                  {delta >= 0 ? "+" : ""}{delta.toFixed(1)}% efficiency
                </div>
              );
            })()}
          </div>
        )}

        {/* ER% if available */}
        {metrics.er && (
          <div>
            <div
              className="mb-1 text-[9px] font-medium uppercase tracking-wider"
              style={{ color: feyTokens.colors.text.label }}
            >
              {metrics.er.label}
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span style={{ color: feyTokens.colors.text.muted }}>Planned:</span>
                <span style={{ color: feyTokens.colors.text.primary }} className="font-medium tabular-nums">
                  {metrics.er.format(metrics.er.planned)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: feyTokens.colors.text.muted }}>Actual:</span>
                <span style={{ color: feyTokens.colors.text.primary }} className="font-medium tabular-nums">
                  {metrics.er.format(metrics.er.actual)}
                </span>
              </div>
            </div>
            {(() => {
              if (!metrics.er.planned || !metrics.er.actual || metrics.er.planned === 0) return null;
              const delta = ((metrics.er.actual - metrics.er.planned) / metrics.er.planned) * 100;
              return (
                <div
                  className="mt-1 text-[10px] font-medium"
                  style={{
                    color: delta >= 0 ? feyTokens.colors.status.success : feyTokens.colors.status.error,
                  }}
                >
                  {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </FeySurface>
  );
}







