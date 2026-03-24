"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div className={cn("inline-flex rounded-lg bg-white/5 p-1 border border-white/10", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    value === option.value
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                      : "text-white/70 hover:text-white/90"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

