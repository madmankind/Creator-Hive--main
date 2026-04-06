"use client";

import { useEffect, useState } from "react";

interface LogoLoaderProps {
  onDone?: () => void;
  duration?: number;
  showWordmark?: boolean;
  size?: number;
}

export function LogoLoader({
  onDone,
  duration = 1400,
  showWordmark = true,
  size = 72,
}: LogoLoaderProps) {
  const [fillPct, setFillPct] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setFillPct(eased * 100);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => onDone?.(), 380);
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
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        width: size * 3,
        height: size * 3,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(124,92,255,0.5) 0%, rgba(34,211,238,0.15) 55%, transparent 80%)",
        filter: "blur(52px)",
        opacity: fillPct / 100,
        pointerEvents: "none",
      }} />

      {/* Logo container */}
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        {/* Spinning orbit ring */}
        <div style={{
          position: "absolute",
          inset: -6,
          borderRadius: "50%",
          border: "1.5px solid transparent",
          borderTopColor: `rgba(124,92,255,${Math.min(1, fillPct / 40)})`,
          borderRightColor: `rgba(34,211,238,${Math.min(0.6, fillPct / 60)})`,
          animation: "spin 1.1s linear infinite",
          opacity: fillPct < 95 ? 1 : 0,
          transition: "opacity 0.3s ease",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        {/* Ghost base */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "contain",
            filter: "none",
            opacity: 0.10,
          }}
        />
        {/* Filled — clips up from bottom */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.png"
          alt="Creator Hive"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "contain",
            filter: fillPct > 85
              ? "brightness(1.3) drop-shadow(0 0 14px rgba(255,255,255,0.5))"
              : "none",
            clipPath: `inset(${100 - fillPct}% 0 0 0)`,
          }}
        />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          opacity: Math.max(0, (fillPct - 40) / 60),
          transform: `translateY(${Math.max(0, 8 - (fillPct / 100) * 8)}px)`,
        }}>
          <span style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.88)", fontFamily: "Inter, sans-serif" }}>
            Creator Hive
          </span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em", fontFamily: "Inter, sans-serif" }}>
            UAE
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        height: "2px", width: `${fillPct}%`,
        background: "linear-gradient(90deg, rgba(124,92,255,0.6), rgba(34,211,238,0.8))",
      }} />
    </div>
  );
}
