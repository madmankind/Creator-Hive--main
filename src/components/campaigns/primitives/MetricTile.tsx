"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "./FeySurface";

interface MetricTileProps {
  label: string;
  value: string | number;
  change?: string | null;
  changeType?: "positive" | "negative" | "neutral";
  className?: string;
  icon?: ReactNode;
}

export function MetricTile({
  label,
  value,
  change,
  changeType = "neutral",
  className,
  icon,
}: MetricTileProps) {
  const changeColors = {
    positive: feyTokens.colors.status.success,
    negative: feyTokens.colors.status.error,
    neutral: feyTokens.colors.text.muted,
  };

  return (
    <div className={cn("transition-transform hover:-translate-y-0.5", className)}>
    <FeySurface 
      variant="card" 
      overlay={true} 
      padding="lg"
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className="text-[9px] font-medium uppercase tracking-wider"
          style={{ color: feyTokens.colors.text.label }}
        >
          {label}
        </span>
        {icon}
      </div>
      <div
        className="text-2xl font-semibold leading-tight tabular-nums"
        style={{ color: feyTokens.colors.text.primary }}
      >
        {value}
      </div>
      {change && (
        <div
          className="mt-2 text-[10px] font-medium"
          style={{ color: changeColors[changeType] }}
        >
          {change}
        </div>
      )}
    </FeySurface>
    </div>
  );
}
