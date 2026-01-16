"use client";

import { useState, useEffect } from "react";
import { PillSegment } from "./primitives/PillSegment";
import { X } from "lucide-react";
import type { CampaignObjective } from "@/types/campaign";

const ACCENT_RED = "#F63148";

export interface KPIData {
  mode: "planned" | "actual";
  totalCost: number;
  totalFollowers: number;
  estImpressions: number;
  estReach: number;
  estEngagements: number;
  estViews: number;
  estClicks?: number; // For traffic objective
  estConversions?: number; // For conversions objective
  eCPM: number;
  eCPE: number;
  eCPV: number;
  er: number;
}

interface KPIPlannerProps {
  onDataChange?: (data: KPIData) => void;
  onClose?: () => void;
  objective?: CampaignObjective;
  dense?: boolean;
}

// Forecast formulas (defaults per spec)
const calculateForecast = (followers: number, cost: number) => {
  if (!followers || followers === 0) {
    return {
      estImpressions: 0,
      estReach: 0,
      estViews: 0,
      estEngagements: 0,
      estClicks: 0,
      estConversions: 0,
    };
  }

  // estImpressions = totalFollowers * 0.30
  const estImpressions = Math.round(followers * 0.30);
  // estReach = estImpressions * 0.61
  const estReach = Math.round(estImpressions * 0.61);
  // estViews = estImpressions * 0.85
  const estViews = Math.round(estImpressions * 0.85);
  // estEngagements = estImpressions * 0.027
  const estEngagements = Math.round(estImpressions * 0.027);
  // estClicks = estImpressions * 0.02 (2% CTR default)
  const estClicks = Math.round(estImpressions * 0.02);
  // estConversions = estClicks * 0.03 (3% conversion rate default)
  const estConversions = Math.round(estClicks * 0.03);

  return {
    estImpressions,
    estReach,
    estViews,
    estEngagements,
    estClicks,
    estConversions,
  };
};

// Format number with commas
const formatNumberInput = (value: number): string => {
  if (value === 0) return "";
  return Math.round(value).toLocaleString("en-US");
};

// Parse comma-formatted string to number
const parseNumberInput = (str: string): number => {
  return parseInt(str.replace(/,/g, "")) || 0;
};

export function KPIPlanner({ onDataChange, onClose, objective = "awareness", dense = false }: KPIPlannerProps) {
  const [mode, setMode] = useState<"planned" | "actual">("planned");
  // Separate state for planned and actual - no shared mutations
  const [plannedData, setPlannedData] = useState<KPIData>({
    mode: "planned",
    totalCost: 0,
    totalFollowers: 0,
    estImpressions: 0,
    estReach: 0,
    estEngagements: 0,
    estViews: 0,
    estClicks: 0,
    estConversions: 0,
    eCPM: 0,
    eCPE: 0,
    eCPV: 0,
    er: 0,
  });
  const [actualData, setActualData] = useState<KPIData>({
    mode: "actual",
    totalCost: 0,
    totalFollowers: 0,
    estImpressions: 0,
    estReach: 0,
    estEngagements: 0,
    estViews: 0,
    estClicks: 0,
    estConversions: 0,
    eCPM: 0,
    eCPE: 0,
    eCPV: 0,
    er: 0,
  });

  // Current data based on mode
  const data = mode === "planned" ? plannedData : actualData;

  // Calculate derived KPIs - separate for planned and actual
  useEffect(() => {
    const updateKPIs = (currentData: KPIData, setter: (data: KPIData) => void) => {
      const cost = currentData.totalCost;
      const impressions = currentData.estImpressions || 0;
      const engagements = currentData.estEngagements || 0;
      const views = currentData.estViews || 0;

      const eCPM = cost > 0 && impressions > 0 ? cost / (impressions / 1000) : 0;
      const eCPE = cost > 0 && engagements > 0 ? cost / engagements : 0;
      const eCPV = cost > 0 && views > 0 ? cost / views : 0;
      const er = impressions > 0 ? (engagements / impressions) * 100 : 0;

      const updated: KPIData = {
        ...currentData,
        mode: currentData.mode,
        eCPM: Math.round(eCPM * 100) / 100,
        eCPE: Math.round(eCPE * 100) / 100,
        eCPV: Math.round(eCPV * 100) / 100,
        er: Math.round(er * 10) / 10,
      };
      setter(updated);
    };

    if (mode === "planned") {
      updateKPIs(plannedData, (newData) => {
        setPlannedData(newData);
        onDataChange?.(newData);
      });
    } else {
      updateKPIs(actualData, (newData) => {
        setActualData(newData);
        onDataChange?.(newData);
      });
    }
  }, [plannedData.totalCost, plannedData.estImpressions, plannedData.estEngagements, plannedData.estViews, actualData.totalCost, actualData.estImpressions, actualData.estEngagements, actualData.estViews, mode]);

  const handleInputChange = (field: keyof KPIData, value: string) => {
    const numValue = parseNumberInput(value);
    
    if (mode === "planned") {
      let newPlanned: KPIData = { ...plannedData, [field]: numValue, mode: "planned" as const };

      // Auto-calculate forecast if followers/cost changed
      if (field === "totalFollowers" || field === "totalCost") {
        const forecast = calculateForecast(
          field === "totalFollowers" ? numValue : newPlanned.totalFollowers,
          field === "totalCost" ? numValue : newPlanned.totalCost
        );
        newPlanned.estImpressions = forecast.estImpressions;
        newPlanned.estReach = forecast.estReach;
        newPlanned.estViews = forecast.estViews;
        newPlanned.estEngagements = forecast.estEngagements;
        newPlanned.estClicks = forecast.estClicks;
        newPlanned.estConversions = forecast.estConversions;
      }

      setPlannedData(newPlanned);
      onDataChange?.({ ...newPlanned, mode: "planned" as const });
    } else {
      // Actual mode - no auto-calculation, just update the field
      const newActual: KPIData = { ...actualData, [field]: numValue, mode: "actual" as const };
      setActualData(newActual);
      onDataChange?.({ ...newActual, mode: "actual" as const });
    }
  };

  const handleBlur = (field: keyof KPIData) => {
    // Normalize to integer on blur
    if (mode === "planned") {
      const value = plannedData[field];
      if (typeof value === "number") {
        const normalized = Math.round(value);
        const newPlanned = { ...plannedData, [field]: normalized };
        setPlannedData(newPlanned);
        onDataChange?.({ ...newPlanned, mode: "planned" });
      }
    } else {
      const value = actualData[field];
      if (typeof value === "number") {
        const normalized = Math.round(value);
        const newActual = { ...actualData, [field]: normalized };
        setActualData(newActual);
        onDataChange?.({ ...newActual, mode: "actual" });
      }
    }
  };

  return (
    <div className="w-full">
      {/* Tabs Row */}
      <div className="flex items-center justify-between mb-2">
        <PillSegment
          options={[
            { value: "planned", label: "Planned" },
            { value: "actual", label: "Actual" },
          ]}
          value={mode}
          onChange={(v) => {
            const newMode = v as "planned" | "actual";
            setMode(newMode);
            // Switch between planned and actual data - no mutation
            const currentData = newMode === "planned" ? plannedData : actualData;
            onDataChange?.({ ...currentData, mode: newMode });
          }}
          size="sm"
        />
        <div className="flex items-center gap-3">
          <div
            className="text-[10px] font-medium uppercase"
            style={{
              color: "rgba(255,255,255,0.40)",
              letterSpacing: "0.12em",
            }}
          >
            {mode === "planned" ? "FORECAST" : "DELIVERED"}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              style={{ color: "rgba(255,255,255,0.60)" }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="mb-2">
        <p
          className="text-[10px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.60)" }}
        >
          {mode === "planned" ? (
            <>
              Enter total cost + total followers. We'll forecast performance.
              <br />
              Replace with actuals when posts go live.
            </>
          ) : (
            "Enter delivered results. We'll compare against plan automatically."
          )}
        </p>
      </div>

      {/* Input Fields */}
      {mode === "planned" ? (
        <>
          {/* Row 1: Total Cost + Total Followers */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label
                className="mb-0.5 block text-[8px] font-medium uppercase"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                TOTAL COST (AED)
              </label>
              <input
                type="text"
                value={formatNumberInput(data.totalCost)}
                onChange={(e) => handleInputChange("totalCost", e.target.value)}
                onBlur={() => handleBlur("totalCost")}
                placeholder=""
                className="w-full rounded-[10px] bg-[rgba(255,255,255,0.06)] px-2.5 text-[11px] font-semibold outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                style={{
                  height: "28px",
                  color: "rgba(255,255,255,0.92)",
                  fontVariantNumeric: "tabular-nums",
                  border: "0",
                }}
              />
            </div>
            <div>
              <label
                className="mb-0.5 block text-[8px] font-medium uppercase"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                TOTAL FOLLOWERS
              </label>
              <input
                type="text"
                value={formatNumberInput(data.totalFollowers)}
                onChange={(e) => handleInputChange("totalFollowers", e.target.value)}
                onBlur={() => handleBlur("totalFollowers")}
                placeholder=""
                className="w-full rounded-[10px] bg-[rgba(255,255,255,0.06)] px-2.5 text-[11px] font-semibold outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                style={{
                  height: "28px",
                  color: "rgba(255,255,255,0.92)",
                  fontVariantNumeric: "tabular-nums",
                  border: "0",
                }}
              />
            </div>
          </div>

          {/* Row 2: Est. Impressions + Est. Reach (computed, locked) */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label
                className="mb-0.5 block text-[8px] font-medium uppercase"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                EST. IMPRESSIONS
              </label>
              <input
                type="text"
                value={formatNumberInput(data.estImpressions)}
                readOnly
                className="w-full rounded-[10px] bg-[rgba(255,255,255,0.04)] px-2.5 text-[11px] font-semibold outline-none opacity-60"
                style={{
                  height: "28px",
                  color: "rgba(255,255,255,0.92)",
                  fontVariantNumeric: "tabular-nums",
                  border: "0",
                }}
              />
            </div>
            <div>
              <label
                className="mb-0.5 block text-[8px] font-medium uppercase"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                EST. REACH
              </label>
              <input
                type="text"
                value={formatNumberInput(data.estReach)}
                readOnly
                className="w-full rounded-[10px] bg-[rgba(255,255,255,0.04)] px-2.5 text-[11px] font-semibold outline-none opacity-60"
                style={{
                  height: "28px",
                  color: "rgba(255,255,255,0.92)",
                  fontVariantNumeric: "tabular-nums",
                  border: "0",
                }}
              />
            </div>
          </div>

          {/* Row 3: Est. Engagements + Est. Views (computed, locked) */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label
                className="mb-0.5 block text-[8px] font-medium uppercase"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                EST. ENGAGEMENTS
              </label>
              <input
                type="text"
                value={formatNumberInput(data.estEngagements)}
                readOnly
                className="w-full rounded-[10px] bg-[rgba(255,255,255,0.04)] px-2.5 text-[11px] font-semibold outline-none opacity-60"
                style={{
                  height: "28px",
                  color: "rgba(255,255,255,0.92)",
                  fontVariantNumeric: "tabular-nums",
                  border: "0",
                }}
              />
            </div>
            <div>
              <label
                className="mb-0.5 block text-[8px] font-medium uppercase"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                EST. VIEWS
              </label>
              <input
                type="text"
                value={formatNumberInput(data.estViews)}
                readOnly
                className="w-full rounded-[10px] bg-[rgba(255,255,255,0.04)] px-2.5 text-[11px] font-semibold outline-none opacity-60"
                style={{
                  height: "28px",
                  color: "rgba(255,255,255,0.92)",
                  fontVariantNumeric: "tabular-nums",
                  border: "0",
                }}
              />
            </div>
          </div>

          {/* Row 4: Est. Clicks + Est. Conversions (for Traffic/Conversions objectives) */}
          {(objective === "traffic" || objective === "conversions") && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label
                  className="mb-0.5 block text-[8px] font-medium uppercase"
                  style={{
                    color: "rgba(255,255,255,0.40)",
                    letterSpacing: "0.12em",
                  }}
                >
                  EST. CLICKS
                </label>
                <input
                  type="text"
                  value={formatNumberInput(data.estClicks || 0)}
                  readOnly
                  className="w-full rounded-[10px] bg-[rgba(255,255,255,0.04)] px-2.5 text-[11px] font-semibold outline-none opacity-60"
                  style={{
                    height: "28px",
                    color: "rgba(255,255,255,0.92)",
                    fontVariantNumeric: "tabular-nums",
                    border: "0",
                  }}
                />
              </div>
              <div>
                <label
                  className="mb-0.5 block text-[8px] font-medium uppercase"
                  style={{
                    color: "rgba(255,255,255,0.40)",
                    letterSpacing: "0.12em",
                  }}
                >
                  EST. CONVERSIONS
                </label>
                <input
                  type="text"
                  value={formatNumberInput(data.estConversions || 0)}
                  readOnly
                  className="w-full rounded-[10px] bg-[rgba(255,255,255,0.04)] px-2.5 text-[11px] font-semibold outline-none opacity-60"
                  style={{
                    height: "28px",
                    color: "rgba(255,255,255,0.92)",
                    fontVariantNumeric: "tabular-nums",
                    border: "0",
                  }}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Actual tab: 4 inputs in 2x2 grid */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label
                className="mb-0.5 block text-[8px] font-medium uppercase"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                IMPRESSIONS
              </label>
              <input
                type="text"
                value={formatNumberInput(data.estImpressions)}
                onChange={(e) => handleInputChange("estImpressions", e.target.value)}
                onBlur={() => handleBlur("estImpressions")}
                placeholder=""
                className="w-full rounded-[10px] bg-[rgba(255,255,255,0.06)] px-2.5 text-[11px] font-semibold outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                style={{
                  height: "28px",
                  color: "rgba(255,255,255,0.92)",
                  fontVariantNumeric: "tabular-nums",
                  border: "0",
                }}
              />
            </div>
            <div>
              <label
                className="mb-0.5 block text-[8px] font-medium uppercase"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                REACH
              </label>
              <input
                type="text"
                value={formatNumberInput(data.estReach)}
                onChange={(e) => handleInputChange("estReach", e.target.value)}
                onBlur={() => handleBlur("estReach")}
                placeholder=""
                className="w-full rounded-[10px] bg-[rgba(255,255,255,0.06)] px-2.5 text-[11px] font-semibold outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                style={{
                  height: "28px",
                  color: "rgba(255,255,255,0.92)",
                  fontVariantNumeric: "tabular-nums",
                  border: "0",
                }}
              />
            </div>
            <div>
              <label
                className="mb-0.5 block text-[8px] font-medium uppercase"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                VIEWS
              </label>
              <input
                type="text"
                value={formatNumberInput(data.estViews)}
                onChange={(e) => handleInputChange("estViews", e.target.value)}
                onBlur={() => handleBlur("estViews")}
                placeholder=""
                className="w-full rounded-[10px] bg-[rgba(255,255,255,0.06)] px-2.5 text-[11px] font-semibold outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                style={{
                  height: "28px",
                  color: "rgba(255,255,255,0.92)",
                  fontVariantNumeric: "tabular-nums",
                  border: "0",
                }}
              />
            </div>
            <div>
              <label
                className="mb-0.5 block text-[8px] font-medium uppercase"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                ENGAGEMENTS
              </label>
              <input
                type="text"
                value={formatNumberInput(data.estEngagements)}
                onChange={(e) => handleInputChange("estEngagements", e.target.value)}
                onBlur={() => handleBlur("estEngagements")}
                placeholder=""
                className="w-full rounded-[10px] bg-[rgba(255,255,255,0.06)] px-2.5 text-[11px] font-semibold outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                style={{
                  height: "28px",
                  color: "rgba(255,255,255,0.92)",
                  fontVariantNumeric: "tabular-nums",
                  border: "0",
                }}
              />
            </div>
          </div>

          {/* Row 2: Clicks + Conversions (for Traffic/Conversions objectives) */}
          {(objective === "traffic" || objective === "conversions") && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label
                  className="mb-0.5 block text-[8px] font-medium uppercase"
                  style={{
                    color: "rgba(255,255,255,0.40)",
                    letterSpacing: "0.12em",
                  }}
                >
                  CLICKS
                </label>
                <input
                  type="text"
                  value={formatNumberInput(data.estClicks || 0)}
                  onChange={(e) => handleInputChange("estClicks", e.target.value)}
                  onBlur={() => handleBlur("estClicks")}
                  placeholder=""
                  className="w-full rounded-[10px] bg-[rgba(255,255,255,0.06)] px-2.5 text-[11px] font-semibold outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                  style={{
                    height: "28px",
                    color: "rgba(255,255,255,0.92)",
                    fontVariantNumeric: "tabular-nums",
                    border: "0",
                  }}
                />
              </div>
              <div>
                <label
                  className="mb-0.5 block text-[8px] font-medium uppercase"
                  style={{
                    color: "rgba(255,255,255,0.40)",
                    letterSpacing: "0.12em",
                  }}
                >
                  CONVERSIONS
                </label>
                <input
                  type="text"
                  value={formatNumberInput(data.estConversions || 0)}
                  onChange={(e) => handleInputChange("estConversions", e.target.value)}
                  onBlur={() => handleBlur("estConversions")}
                  placeholder=""
                  className="w-full rounded-[10px] bg-[rgba(255,255,255,0.06)] px-2.5 text-[11px] font-semibold outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                  style={{
                    height: "28px",
                    color: "rgba(255,255,255,0.92)",
                    fontVariantNumeric: "tabular-nums",
                    border: "0",
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div>
          <div
            className="text-[8px] font-medium uppercase mb-0.5"
            style={{
              color: "rgba(255,255,255,0.40)",
              letterSpacing: "0.12em",
            }}
          >
            eCPM
          </div>
          <div
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            {data.eCPM > 0 ? `AED ${data.eCPM.toFixed(2)}` : "—"}
          </div>
        </div>
        <div>
          <div
            className="text-[8px] font-medium uppercase mb-0.5"
            style={{
              color: "rgba(255,255,255,0.40)",
              letterSpacing: "0.12em",
            }}
          >
            eCPE
          </div>
          <div
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            {data.eCPE > 0 ? `AED ${data.eCPE.toFixed(2)}` : "—"}
          </div>
        </div>
        <div>
          <div
            className="text-[8px] font-medium uppercase mb-0.5"
            style={{
              color: "rgba(255,255,255,0.40)",
              letterSpacing: "0.12em",
            }}
          >
            eCPV
          </div>
          <div
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            {data.eCPV > 0 ? `AED ${data.eCPV.toFixed(2)}` : "—"}
          </div>
        </div>
        <div>
          <div
            className="text-[8px] font-medium uppercase mb-0.5"
            style={{
              color: "rgba(255,255,255,0.40)",
              letterSpacing: "0.12em",
            }}
          >
            ENG. RATE
          </div>
          <div
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            {data.er > 0 ? `${data.er.toFixed(1)}%` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
