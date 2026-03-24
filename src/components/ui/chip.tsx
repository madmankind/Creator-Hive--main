"use client";

import { cn } from "@/lib/utils";

type ChipProps = {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
};

/**
 * Uniform chip/capsule component. Sizing is identical for selected/unselected.
 * Only colors/ring change when selected — no pill grow/shrink.
 */
export function Chip({
  selected = false,
  onClick,
  children,
  disabled,
  type = "button",
  className,
}: ChipProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 rounded-full px-3 text-[11px] font-medium ring-1 transition inline-flex items-center justify-center shrink-0 whitespace-nowrap",
        selected
          ? "bg-white/15 text-white ring-white/20"
          : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/8",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}
