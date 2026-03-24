"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { feyTokens } from "@/lib/fey-design-tokens";

interface GlowPillProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
}

export function GlowPill({
  children,
  active = false,
  onClick,
  className,
  size = "md",
}: GlowPillProps) {
  const sizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full font-medium transition-all",
        sizeClasses[size],
        active
          ? "text-white"
          : "text-white/60 hover:text-white/80 hover:bg-white/5",
        className
      )}
      style={
        active
          ? {
              backgroundColor: feyTokens.colors.red.pill,
              boxShadow: feyTokens.shadows.glow,
            }
          : {
              border: `1px solid ${feyTokens.colors.text.label}`,
            }
      }
    >
      {children}
    </button>
  );
}







