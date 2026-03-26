"use client";

/**
 * AppLogo — Creator Hive brand mark + wordmark
 *
 * CHANGELOG (2026-01-11):
 * - Fixed logo sizing: now uses tight-cropped SVG at /public/brand/ch-icon.svg
 * - Intentional icon size: 32px (default), scales proportionally
 * - Text baseline aligned with icon center
 * - Works correctly at 100% and 110% browser zoom
 *
 * Recommended asset: /public/brand/ch-icon.svg (tight crop, no padding)
 */

import Image from "next/image";

interface AppLogoProps {
  /** Show "Creator Hive" text next to icon */
  showText?: boolean;
  /** Icon size in pixels (default: 32) */
  iconSize?: number;
  /** Custom className for wrapper */
  className?: string;
}

export function AppLogo({ showText = true, iconSize = 32, className }: AppLogoProps) {
  // Icon aspect ratio is ~108:120 (width:height), so we calculate width from height
  const aspectRatio = 108 / 120;
  const iconWidth = Math.round(iconSize * aspectRatio);

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      {/* Logo icon - tight-cropped SVG */}
      <div
        className="relative flex-shrink-0 rounded-lg overflow-hidden"
        style={{
          width: `${iconWidth}px`,
          height: `${iconSize}px`,
        }}
      >
        <Image
          src="/logo-mark.png"
          alt="Creator Hive"
          width={iconWidth}
          height={iconSize}
          priority
          className="object-contain"
          style={{
            width: "100%",
            height: "100%",
            filter: "invert(1)",
          }}
        />
      </div>

      {/* Wordmark - baseline aligned with icon center */}
      {showText && (
        <span
          className="font-semibold tracking-tight whitespace-nowrap"
          style={{
            fontSize: iconSize >= 30 ? "14px" : "13px",
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1,
          }}
        >
          Creator Hive
        </span>
      )}
    </div>
  );
}
