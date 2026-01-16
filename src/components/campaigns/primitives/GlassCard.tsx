"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { feyTokens } from "@/lib/fey-design-tokens";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function GlassCard({ children, className, hover = false, padding = "md" }: GlassCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "rounded-[22px] border",
        feyTokens.glass.card.background,
        feyTokens.glass.card.border,
        feyTokens.glass.card.backdrop,
        paddingClasses[padding],
        hover && "transition-all hover:border-white/20 hover:shadow-lg",
        className
      )}
      style={{
        boxShadow: feyTokens.shadows.card,
      }}
    >
      {children}
    </div>
  );
}







