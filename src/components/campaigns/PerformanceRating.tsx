"use client";

import { feyTokens } from "@/lib/fey-design-tokens";
import type { KPIData } from "./KPIInputStrip";

interface PerformanceRatingProps {
  planned: Partial<KPIData>;
  actual: Partial<KPIData>;
  objective: "awareness" | "engagement" | "traffic" | "conversions";
}

export function PerformanceRating({ planned, actual, objective }: PerformanceRatingProps) {
  // Calculate derived metrics from KPI data
  const calculateCPM = (cost: number, impressions: number) => {
    if (!impressions || impressions === 0) return null;
    return (cost / (impressions / 1000));
  };

  const calculateCPE = (cost: number, engagements: number) => {
    if (!engagements || engagements === 0) return null;
    return cost / engagements;
  };

  const calculateCPV = (cost: number, views: number) => {
    if (!views || views === 0) return null;
    return cost / views;
  };

  const plannedCPM = planned.totalCost && planned.impressions 
    ? calculateCPM(planned.totalCost, planned.impressions) 
    : null;
  const actualCPM = actual.totalCost && actual.impressions 
    ? calculateCPM(actual.totalCost, actual.impressions) 
    : null;
  const plannedCPE = planned.totalCost && planned.engagements 
    ? calculateCPE(planned.totalCost, planned.engagements) 
    : null;
  const actualCPE = actual.totalCost && actual.engagements 
    ? calculateCPE(actual.totalCost, actual.engagements) 
    : null;

  // Calculate deltas for primary metrics
  const getDelta = (plannedVal: number | null, actualVal: number | null, lowerIsBetter: boolean) => {
    if (plannedVal === null || actualVal === null || plannedVal === 0) return null;
    const delta = ((actualVal - plannedVal) / plannedVal) * 100;
    return lowerIsBetter ? -delta : delta; // Invert for cost metrics
  };

  let primaryMetric = "";
  let delta: number | null = null;
  let rationale = "";

  switch (objective) {
    case "awareness":
      if (actualCPM !== null && plannedCPM !== null) {
        primaryMetric = "CPM";
        delta = getDelta(plannedCPM, actualCPM, true);
        rationale = delta !== null && delta < 0 
          ? `CPM is ${Math.abs(delta).toFixed(0)}% better than forecast`
          : delta !== null && delta > 0
          ? `CPM is ${delta.toFixed(0)}% higher than forecast`
          : "CPM matches forecast";
      } else if (actual.reach !== undefined && planned.reach !== undefined) {
        primaryMetric = "Reach";
        delta = getDelta(planned.reach, actual.reach, false);
        rationale = delta !== null && delta > 0
          ? `Reach is ${delta.toFixed(0)}% above forecast`
          : delta !== null && delta < 0
          ? `Reach is ${Math.abs(delta).toFixed(0)}% below forecast`
          : "Reach matches forecast";
      }
      break;
    case "engagement":
      if (actualCPE !== null && plannedCPE !== null) {
        primaryMetric = "CPE";
        delta = getDelta(plannedCPE, actualCPE, true);
        rationale = delta !== null && delta < 0
          ? `CPE is ${Math.abs(delta).toFixed(0)}% better than forecast`
          : delta !== null && delta > 0
          ? `CPE is ${delta.toFixed(0)}% higher than forecast`
          : "CPE matches forecast";
      } else if (actual.engagements !== undefined && planned.engagements !== undefined) {
        primaryMetric = "Engagements";
        delta = getDelta(planned.engagements, actual.engagements, false);
        rationale = delta !== null && delta > 0
          ? `Engagements are ${delta.toFixed(0)}% above forecast`
          : delta !== null && delta < 0
          ? `Engagements are ${Math.abs(delta).toFixed(0)}% below forecast`
          : "Engagements match forecast";
      }
      break;
    case "traffic":
    case "conversions":
      // Similar logic for other objectives
      break;
  }

  // Determine rating
  let rating: "Needs Work" | "On Track" | "Strong" | "Exceptional" = "On Track";
  let ratingColor: string = feyTokens.colors.status.warning;

  if (delta !== null) {
    if (delta < -10) {
      rating = "Needs Work";
      ratingColor = feyTokens.colors.status.error;
    } else if (delta >= -10 && delta < 5) {
      rating = "On Track";
      ratingColor = feyTokens.colors.status.warning;
    } else if (delta >= 5 && delta < 20) {
      rating = "Strong";
      ratingColor = feyTokens.colors.status.success;
    } else if (delta >= 20) {
      rating = "Exceptional";
      ratingColor = feyTokens.colors.status.success;
    }
  }

  return (
    <div
      className="rounded-lg border p-3"
      style={{
        background: `${feyTokens.colors.base.darker}EE`,
        borderColor: feyTokens.borders.default,
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div
          className="text-[9px] font-medium uppercase tracking-wider"
          style={{ color: feyTokens.colors.text.label }}
        >
          Performance Rating
        </div>
        <div
          className="rounded-full px-2 py-0.5 text-[9px] font-medium"
          style={{
            background: `${ratingColor}20`,
            color: ratingColor,
          }}
        >
          {rating}
        </div>
      </div>
      {rationale && (
        <div
          className="text-xs"
          style={{ color: feyTokens.colors.text.secondary }}
        >
          {rationale}
        </div>
      )}
    </div>
  );
}

