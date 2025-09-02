"use client";
import { useState } from "react";
import SegmentedToggle from "./SegmentedToggle";
import HeroSearch from "./HeroSearch";
import Image from "next/image";

export default function Hero() {
  const [mode, setMode] = useState<"hire" | "getHired">("hire");

  return (
    <section className="relative hero-glow min-h-[92vh] flex flex-col items-center justify-start pt-[min(14vh,160px)]">
      {/* Logo (optional top-left) */}
      <div className="absolute left-6 top-6 opacity-80">
        <Image src="/brand/CH Main logo_black bg.svg" alt="Creator Hive" width={120} height={24} priority />
      </div>

      {/* Toggle */}
      <SegmentedToggle defaultValue="hire" onChange={(v) => setMode(v)} />

      {/* Optional single-line subcopy */}
      <p className="mt-6 text-sm" style={{ color: 'var(--text-dim)' }}>
        {mode === "hire" ? "Book top 1% talent seamlessly." : "Join the hive and get hired."}
      </p>

      {/* Search row */}
      <div className="mt-10 w-full px-5">
        <HeroSearch onDiscover={(q) => console.log("discover:", q)} />
      </div>
    </section>
  );
}