"use client";

import type { KPIData } from "./KPIPlanner";
import { type CampaignObjective } from "@/types/campaign";
import { CAMPAIGN_OBJECTIVES, getValueFromPlanned, getValueFromActual, formatValue } from "@/lib/campaignObjectives";

const ACCENT_RED = "#F63148";

interface PerformanceSummaryCardProps {
  planned: KPIData | null;
  actual: KPIData | null;
  objective: CampaignObjective;
}

export function PerformanceSummaryCard({
  planned,
  actual,
  objective,
}: PerformanceSummaryCardProps) {
  const objectiveConfig = CAMPAIGN_OBJECTIVES[objective];

  // Calculate performance score
  const calculateScore = () => {
    if (!planned || !actual) return { score: 0, label: "On plan", bg: "rgba(245,158,11,0.18)", color: "#F59E0B" };

    let score = 0;
    const plannedValue = getValueFromPlanned(planned, objectiveConfig.primary);
    const actualValue = getValueFromActual(actual, objectiveConfig.primary);

    if (plannedValue > 0) {
      score = (actualValue / plannedValue) * 100;
    }

    if (score >= 120) {
      return { score, label: "Outperforming", bg: "rgba(34,197,94,0.18)", color: "#22C55E" };
    } else if (score >= 85) {
      return { score, label: "On plan", bg: "rgba(245,158,11,0.18)", color: "#F59E0B" };
    } else {
      return { score, label: "Underperforming", bg: "rgba(239,68,68,0.18)", color: "#EF4444" };
    }
  };

  const performance = calculateScore();

  // Get primary KPI value only
  const primaryValue = actual 
    ? getValueFromActual(actual, objectiveConfig.primary)
    : planned 
    ? getValueFromPlanned(planned, objectiveConfig.primary)
    : 0;

  const primaryDelta = planned && actual 
    ? (() => {
        const plannedVal = getValueFromPlanned(planned, objectiveConfig.primary);
        const actualVal = getValueFromActual(actual, objectiveConfig.primary);
        if (!plannedVal || plannedVal === 0) return null;
        return Math.round(((actualVal - plannedVal) / plannedVal) * 100);
      })()
    : null;

  return (
    <div
      className="rounded-[20px]"
      style={{
        width: "220px",
        padding: "16px",
        background: "rgba(10,10,12,0.75)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div
          className="text-xs font-semibold"
          style={{ color: "rgba(255,255,255,0.92)" }}
        >
          Performance summary
        </div>
        <div
          className="rounded-full px-2 py-0.5 text-[9px] font-medium"
          style={{
            background: performance.bg,
            color: performance.color,
          }}
        >
          {performance.label}
        </div>
      </div>

      {/* Primary KPI Only */}
      <div>
        <div
          className="mb-1 text-[10px] font-medium uppercase"
          style={{
            color: "rgba(255,255,255,0.40)",
            letterSpacing: "0.12em",
          }}
        >
          {objectiveConfig.primary.toUpperCase()}
        </div>
        <div
          className="text-base font-bold tabular-nums mb-0.5"
          style={{ color: "rgba(255,255,255,0.92)" }}
        >
          {formatValue(primaryValue, objectiveConfig.primary)}
        </div>
        {primaryDelta !== null && (
          <div
            className="text-xs"
            style={{
              color: primaryDelta >= 0 ? "#22C55E" : "#EF4444",
            }}
          >
            {primaryDelta >= 0 ? "+" : ""}{primaryDelta}% vs plan
          </div>
        )}
      </div>
    </div>
  );
}
