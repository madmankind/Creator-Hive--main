"use client";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GradientBorderProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: keyof typeof radiusMap;
}

const radiusMap = {
  xs: "rounded-[var(--radius-xs)]",
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
  xl: "rounded-[var(--radius-xl)]",
  "2xl": "rounded-[var(--radius-2xl)]",
};

export function GradientBorder({ className, rounded = "lg", children, ...props }: GradientBorderProps) {
  return (
    <div className={cn("relative gradient-border", radiusMap[rounded], className)} {...props}>
      <div className={cn("relative", radiusMap[rounded])}>{children}</div>
    </div>
  );
}

