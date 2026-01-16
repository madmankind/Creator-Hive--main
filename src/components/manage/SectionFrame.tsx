"use client";

import { feyTokens } from "@/lib/fey-design-tokens";

interface SectionFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  radius?: number;
  contentPadding?: string;
  fill?: boolean;
}

/**
 * Fey-style immersive black 3D bezel frame (hardware cavity aesthetic).
 * 
 * CHANGELOG:
 * - Strengthened bezel: added outer hard edge, more visible inner stroke, bevel highlight/shadow
 * - Black-biased base (reduced milky look) for stronger hardware cavity feel
 * - All decorative layers remain pointer-events-none, content z-index 10
 * 
 * - OUTER WRAPPER: overflow hidden (immersive box), receives style/className
 * - INNER SURFACE: pitch-black cavity with content plane floating inside
 * - Decorative layers: z-index 0, pointer-events-none (never intercept clicks)
 * - Content: z-index 10 (always above decorations)
 * 
 * Optional props:
 * - radius: border radius (default 14px)
 * - contentPadding: padding for content wrapper (default "18px 20px")
 * - fill: if true, content wrapper uses height:100% + flex column for proper height chain (default false)
 */
export function SectionFrame({ 
  children, 
  className, 
  style,
  radius = 0, // Changed to 0 for straight edges (boxed containers)
  contentPadding = "18px 20px",
  fill = false,
}: SectionFrameProps) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden", // Default: immersive contained box
        borderRadius: `${radius}px`,
        ...style,
      }}
    >
      {/* OUTER WRAPPER: Soft wide shadow + tighter darker shadow + hard outer edge */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: `${radius}px`,
          boxShadow: "0 12px 48px rgba(0,0,0,0.70), 0 4px 16px rgba(0,0,0,0.60), 0 0 0 1px rgba(0,0,0,0.85)",
          zIndex: 0,
        }}
      />

      {/* INNER SURFACE: The actual frame that contains everything */}
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
          borderRadius: `${radius}px`,
        }}
      >
        {/* Decorative Layer A: Pitch-black base fill (black-biased, not milky) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: `${radius}px`,
            background: "rgba(2,2,6,0.95)",
            backdropFilter: "blur(2px)",
            zIndex: 0,
          }}
        />

        {/* Decorative Layer B: Inner cavity inset shadow (stronger) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: `${radius}px`,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 18px 40px rgba(0,0,0,0.80)",
            zIndex: 0,
          }}
        />

        {/* Decorative Layer C: Bevel highlight (top edge) + shadow (bottom edge) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: `${radius}px`,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 2%, transparent 8%, transparent 92%, rgba(0,0,0,0.4) 98%, rgba(0,0,0,0.6) 100%)",
            zIndex: 0,
          }}
        />

        {/* Decorative Layer D: Outer bezel stroke (more defined) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: `${radius}px`,
            border: "1px solid rgba(255,255,255,0.10)",
            zIndex: 0,
          }}
        />

        {/* Content plane underlay: subtle inner surface */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: `${Math.max(0, radius - 2)}px`,
            background: "rgba(8,8,14,0.35)",
            margin: "1px",
            zIndex: 1,
          }}
        />

        {/* Content wrapper: Above all decorations, establishes height chain */}
        <div
          className="relative"
          style={{
            zIndex: 10,
            padding: contentPadding,
            display: fill ? "flex" : "block",
            flexDirection: fill ? "column" : undefined,
            flex: fill ? 1 : undefined,
            minHeight: fill ? 0 : undefined,
            height: fill ? "100%" : undefined,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
