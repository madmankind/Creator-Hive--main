"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeyMeshLayer } from "./FeyMeshLayer";

interface FeySurfaceProps {
  children: ReactNode;
  variant?: "panel" | "card" | "modal" | "hero";
  overlay?: boolean;
  mesh?: boolean;
  meshVariant?: "chart" | "panel" | "background";
  interactive?: boolean;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export function FeySurface({
  children,
  variant = "card",
  overlay = true,
  mesh = false,
  meshVariant = "panel",
  interactive = false,
  className,
  padding = "md",
}: FeySurfaceProps) {
  const variantStyles = {
    panel: {
      background: feyTokens.glass.panel.background,
      border: feyTokens.borders.default,
      shadow: feyTokens.shadows.surface,
    },
    card: {
      background: feyTokens.glass.card.background,
      border: feyTokens.borders.default,
      shadow: feyTokens.shadows.card,
    },
    modal: {
      background: `${feyTokens.colors.base.darker}EE`,
      border: feyTokens.borders.hover,
      shadow: feyTokens.shadows.modal,
    },
    hero: {
      background: feyTokens.glass.card.background,
      border: feyTokens.borders.default,
      shadow: feyTokens.shadows.card,
    },
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const style = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative rounded-[18px] border overflow-hidden",
        paddingClasses[padding],
        interactive && "transition-all cursor-pointer",
        interactive && "hover:border-white/10 hover:shadow-lg",
        className
      )}
      style={{
        background: style.background,
        borderColor: style.border,
        boxShadow: style.shadow,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Inset highlight (top edge) for glass depth */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
        }}
      />

      {/* Mesh layer (Fey-style dot matrix) */}
      {mesh && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[18px]">
          <FeyMeshLayer intensity="medium" variant={meshVariant} className="h-full w-full">
            <div />
          </FeyMeshLayer>
        </div>
      )}

      {/* Legacy overlay (for backward compatibility) */}
      {overlay && !mesh && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: feyTokens.overlays.dots,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Ribbed gradient */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: feyTokens.overlays.ribbed,
            }}
          />
          {/* Subtle noise */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: feyTokens.overlays.noise,
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

