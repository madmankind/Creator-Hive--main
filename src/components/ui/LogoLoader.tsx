"use client";

import { useEffect, useState } from "react";

interface LogoLoaderProps {
  /** Called when the fill animation completes */
  onDone?: () => void;
  /** Duration of fill animation in ms — default 1400 */
  duration?: number;
  /** Show the wordmark below the mark — default true */
  showWordmark?: boolean;
  /** Size of the logo mark in px — default 72 */
  size?: number;
}

/**
 * Creator Hive branded loading screen.
 * The C-mark "fills up" from bottom to top over ~1.4s,
 * then fades out. Calls onDone after the exit fade.
 */
export function LogoLoader({
  onDone,
  duration = 1400,
  showWordmark = true,
  size = 72,
}: LogoLoaderProps) {
  const [fillPct, setFillPct] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Ramp fill from 0 → 100 over `duration` ms using rAF
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const raw = elapsed / duration;
      // Ease-out cubic
      const t = Math.min(raw, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setFillPct(eased * 100);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // Hold briefly then exit
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => onDone?.(), 400);
        }, 180);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5"
      style={{
        background: "#07070B",
        opacity: exiting ? 0 : 1,
        transition: exiting ? "opacity 0.38s ease" : "none",
        pointerEvents: "all",
      }}
    >
      {/* Ambient glow behind the mark — intensifies as fill rises */}
      <div
        style={{
          position: "absolute",
          width: size * 2.8,
          height: size * 2.8,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(124,92,255,0.55) 0%, rgba(34,211,238,0.18) 55%, transparent 80%)",
          filter: "blur(48px)",
          opacity: fillPct / 100,
          transition: "opacity 0.08s linear",
          pointerEvents: "none",
        }}
      />

      {/* Logo mark with fill-up mask */}
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        {/* Dim base — always visible at low opacity */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.svg"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: 0.12,
          }}
        />
        {/* Filled portion — clip rises from bottom */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.svg"
          alt="Creator Hive"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            clipPath: `inset(${100 - fillPct}% 0 0 0)`,
            opacity: 1,
            filter: fillPct > 85 ? "brightness(1.2) drop-shadow(0 0 12px rgba(255,255,255,0.4))" : "none",
          }}
        />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            opacity: Math.max(0, (fillPct - 40) / 60),
            transform: `translateY(${Math.max(0, 8 - (fillPct / 100) * 8)}px)`,
            transition: "none",
          }}
        >
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "rgba(255,255,255,0.88)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Creator Hive
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.30)",
              letterSpacing: "0.04em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            UAE
          </span>
        </div>
      )}

      {/* Thin progress bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2px",
          width: `${fillPct}%`,
          background: "linear-gradient(90deg, rgba(124,92,255,0.6), rgba(34,211,238,0.8))",
          transition: "none",
        }}
      />
    </div>
  );
}
