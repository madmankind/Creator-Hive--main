"use client";

import { feyTokens } from "@/lib/fey-design-tokens";
import { PillSegment } from "./primitives/PillSegment";

interface ObjectiveSelectorProps {
  value: "awareness" | "engagement" | "traffic" | "conversions";
  onChange: (value: "awareness" | "engagement" | "traffic" | "conversions") => void;
}

export function ObjectiveSelector({ value, onChange }: ObjectiveSelectorProps) {
  return (
    <div className="mb-4">
      <div
        className="mb-2 text-[9px] font-medium uppercase tracking-wider"
        style={{ color: feyTokens.colors.text.label }}
      >
        Campaign Objective
      </div>
      <PillSegment
        options={[
          { value: "awareness", label: "Awareness" },
          { value: "engagement", label: "Engagement" },
          { value: "traffic", label: "Traffic" },
          { value: "conversions", label: "Conversions" },
        ]}
        value={value}
        onChange={(v) => onChange(v as typeof value)}
        size="sm"
      />
    </div>
  );
}







