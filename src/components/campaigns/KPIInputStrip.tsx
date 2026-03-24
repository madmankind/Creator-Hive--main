"use client";

import { useState } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { PillSegment } from "./primitives/PillSegment";

export interface KPIData {
  mode: "planned" | "actual";
  totalCost: number;
  reach: number;
  impressions: number;
  views: number;
  engagements: number;
  linkClicks: number;
  conversions: number;
  revenue: number;
}

interface KPIInputStripProps {
  onDataChange?: (data: KPIData) => void;
}

export function KPIInputStrip({ onDataChange }: KPIInputStripProps) {
  const [mode, setMode] = useState<"planned" | "actual">("planned");
  const [data, setData] = useState<KPIData>({
    mode: "planned",
    totalCost: 0,
    reach: 0,
    impressions: 0,
    views: 0,
    engagements: 0,
    linkClicks: 0,
    conversions: 0,
    revenue: 0,
  });

  const handleInputChange = (field: keyof KPIData, value: number) => {
    const newData = { ...data, [field]: value, mode };
    setData(newData);
    onDataChange?.(newData);
  };

  // Derived metrics
  const cpm = data.impressions > 0 ? (data.totalCost / (data.impressions / 1000)) : 0;
  const cpv = data.views > 0 ? (data.totalCost / data.views) : 0;
  const cpe = data.engagements > 0 ? (data.totalCost / data.engagements) : 0;
  const er = data.impressions > 0 ? ((data.engagements / data.impressions) * 100) : 0;
  const cpa = data.conversions > 0 ? (data.totalCost / data.conversions) : 0;
  const roas = data.revenue > 0 ? (data.revenue / data.totalCost) : 0;

  return (
    <div
      className="rounded-lg border p-3 w-80"
      style={{
        background: `${feyTokens.colors.base.darker}EE`,
        borderColor: feyTokens.borders.default,
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <PillSegment
          options={[
            { value: "planned", label: "Planned" },
            { value: "actual", label: "Actual" },
          ]}
          value={mode}
          onChange={(v) => {
            setMode(v as "planned" | "actual");
            setData({ ...data, mode: v as "planned" | "actual" });
          }}
          size="sm"
        />
        <div
          className="text-[9px] font-medium uppercase tracking-wider"
          style={{ color: feyTokens.colors.text.label }}
        >
          {mode === "planned" ? "Forecast" : "Delivered"}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div>
          <label
            className="mb-1 block text-[9px] font-medium uppercase tracking-wider"
            style={{ color: feyTokens.colors.text.label }}
          >
            Cost (AED)
          </label>
          <input
            type="number"
            value={data.totalCost || ""}
            onChange={(e) => handleInputChange("totalCost", parseFloat(e.target.value) || 0)}
            className="w-full rounded border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-1"
            style={{
              borderColor: feyTokens.borders.default,
              color: feyTokens.colors.text.primary,
            }}
            placeholder="0"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-[9px] font-medium uppercase tracking-wider"
            style={{ color: feyTokens.colors.text.label }}
          >
            Reach
          </label>
          <input
            type="number"
            value={data.reach || ""}
            onChange={(e) => handleInputChange("reach", parseFloat(e.target.value) || 0)}
            className="w-full rounded border bg-transparent px-2 py-1 text-xs focus:outline-none"
            style={{
              borderColor: feyTokens.borders.default,
              color: feyTokens.colors.text.primary,
            }}
            placeholder="0"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-[9px] font-medium uppercase tracking-wider"
            style={{ color: feyTokens.colors.text.label }}
          >
            Impressions
          </label>
          <input
            type="number"
            value={data.impressions || ""}
            onChange={(e) => handleInputChange("impressions", parseFloat(e.target.value) || 0)}
            className="w-full rounded border bg-transparent px-2 py-1 text-xs focus:outline-none"
            style={{
              borderColor: feyTokens.borders.default,
              color: feyTokens.colors.text.primary,
            }}
            placeholder="0"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-[9px] font-medium uppercase tracking-wider"
            style={{ color: feyTokens.colors.text.label }}
          >
            Engagements
          </label>
          <input
            type="number"
            value={data.engagements || ""}
            onChange={(e) => handleInputChange("engagements", parseFloat(e.target.value) || 0)}
            className="w-full rounded border bg-transparent px-2 py-1 text-xs focus:outline-none"
            style={{
              borderColor: feyTokens.borders.default,
              color: feyTokens.colors.text.primary,
            }}
            placeholder="0"
          />
        </div>
      </div>

      {/* Derived metrics chips */}
      {(cpm > 0 || cpv > 0 || cpe > 0 || er > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {cpm > 0 && (
            <div
              className="rounded-full border px-2 py-0.5 text-[9px] font-medium"
              style={{
                borderColor: feyTokens.borders.default,
                background: feyTokens.glass.panel.background,
                color: feyTokens.colors.text.secondary,
              }}
            >
              CPM: AED {cpm.toFixed(2)}
            </div>
          )}
          {cpv > 0 && (
            <div
              className="rounded-full border px-2 py-0.5 text-[9px] font-medium"
              style={{
                borderColor: feyTokens.borders.default,
                background: feyTokens.glass.panel.background,
                color: feyTokens.colors.text.secondary,
              }}
            >
              CPV: AED {cpv.toFixed(2)}
            </div>
          )}
          {cpe > 0 && (
            <div
              className="rounded-full border px-2 py-0.5 text-[9px] font-medium"
              style={{
                borderColor: feyTokens.borders.default,
                background: feyTokens.glass.panel.background,
                color: feyTokens.colors.text.secondary,
              }}
            >
              CPE: AED {cpe.toFixed(2)}
            </div>
          )}
          {er > 0 && (
            <div
              className="rounded-full border px-2 py-0.5 text-[9px] font-medium"
              style={{
                borderColor: feyTokens.borders.default,
                background: feyTokens.glass.panel.background,
                color: feyTokens.colors.text.secondary,
              }}
            >
              ER: {er.toFixed(1)}%
            </div>
          )}
          {cpa > 0 && (
            <div
              className="rounded-full border px-2 py-0.5 text-[9px] font-medium"
              style={{
                borderColor: feyTokens.borders.default,
                background: feyTokens.glass.panel.background,
                color: feyTokens.colors.text.secondary,
              }}
            >
              CPA: AED {cpa.toFixed(2)}
            </div>
          )}
          {roas > 0 && (
            <div
              className="rounded-full border px-2 py-0.5 text-[9px] font-medium"
              style={{
                borderColor: feyTokens.borders.default,
                background: feyTokens.glass.panel.background,
                color: feyTokens.colors.text.secondary,
              }}
            >
              ROAS: {roas.toFixed(2)}x
            </div>
          )}
        </div>
      )}
    </div>
  );
}

