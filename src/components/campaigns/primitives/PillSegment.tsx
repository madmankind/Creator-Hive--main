"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { feyTokens } from "@/lib/fey-design-tokens";

interface PillSegmentOption {
  value: string;
  label: string;
}

interface PillSegmentProps {
  options: PillSegmentOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  className?: string;
}

export function PillSegment({
  options,
  value,
  onChange,
  size = "md",
  className,
}: PillSegmentProps) {
  const sizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full font-medium transition-all",
              sizeClasses[size]
            )}
            style={
              isActive
                ? {
                    backgroundColor: "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    height: size === "sm" ? "28px" : "32px",
                    fontSize: size === "sm" ? "11px" : "12px",
                    paddingLeft: size === "sm" ? "10px" : "12px",
                    paddingRight: size === "sm" ? "10px" : "12px",
                  }
                : {
                    backgroundColor: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.72)",
                    height: size === "sm" ? "28px" : "32px",
                    fontSize: size === "sm" ? "11px" : "12px",
                    paddingLeft: size === "sm" ? "10px" : "12px",
                    paddingRight: size === "sm" ? "10px" : "12px",
                  }
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

