"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeyMeshLayerProps {
  children: ReactNode;
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
  variant?: "chart" | "panel" | "background";
}

/**
 * FeyMeshLayer - Applies the signature dotted/mesh texture overlay
 * Matches Fey's chart background aesthetic: subtle dot-matrix pattern
 */
export function FeyMeshLayer({
  children,
  className,
  intensity = "medium",
  variant = "panel",
}: FeyMeshLayerProps) {
  const intensityStyles = {
    subtle: { opacity: 0.06, dotSize: "1px", spacing: "60px" },
    medium: { opacity: 0.10, dotSize: "1px", spacing: "60px" },
    strong: { opacity: 0.14, dotSize: "1.5px", spacing: "50px" },
  };

  const variantStyles = {
    chart: {
      // Chart-specific: stronger in center, fade at edges
      mask: "radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)",
    },
    panel: {
      // Panel: uniform with slight edge fade
      mask: "radial-gradient(ellipse 100% 100% at center, black 60%, transparent 100%)",
    },
    background: {
      // Background: very subtle, uniform
      mask: "none",
    },
  };

  const style = intensityStyles[intensity];
  const variantStyle = variantStyles[variant];

  return (
    <div className={cn("relative", className)}>
      {/* Base content */}
      {children}

      {/* Mesh overlay - positioned absolutely */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: style.opacity,
          maskImage: variantStyle.mask,
          WebkitMaskImage: variantStyle.mask,
        }}
      >
        {/* Dot matrix pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) ${style.dotSize}, transparent ${style.dotSize})`,
            backgroundSize: `${style.spacing} ${style.spacing}`,
            backgroundPosition: "0 0",
          }}
        />
        {/* Ribbed gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 1px,
              rgba(255,255,255,0.02) 1px,
              rgba(255,255,255,0.02) 2px
            )`,
          }}
        />
        {/* Subtle noise */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </div>
  );
}







