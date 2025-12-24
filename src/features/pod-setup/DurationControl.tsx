"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DurationControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function DurationControl({
  value,
  onChange,
  min = 1,
  max = 365,
}: DurationControlProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center",
          "bg-white/5 border border-white/10",
          "hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed",
          "transition-colors"
        )}
      >
        <Minus className="h-3.5 w-3.5 text-white/70" />
      </button>
      
      <div className="flex items-center gap-1.5 min-w-[80px] justify-center">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = parseInt(e.target.value) || min;
            onChange(Math.max(min, Math.min(max, newValue)));
          }}
          className="w-16 text-center text-sm font-semibold text-white bg-transparent border-none outline-none"
        />
        <span className="text-xs text-white/50">days</span>
      </div>
      
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center",
          "bg-white/5 border border-white/10",
          "hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed",
          "transition-colors"
        )}
      >
        <Plus className="h-3.5 w-3.5 text-white/70" />
      </button>
    </div>
  );
}


