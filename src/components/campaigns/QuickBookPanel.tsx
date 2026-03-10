"use client";

// QuickBookPanel — surfaced in the dashboard Discover screen
// Shows package cards for re-booking. Seasonal packages auto-surface near key dates.

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PACKAGES,
  PACKAGE_CATEGORY_META,
  PackageConfig,
  PackageCategory,
  getPackagePriceLabel,
} from "@/lib/packages";

// ── Seasonal surfacing logic ─────────────────────────────────────────────────
// Show seasonal packages 8 weeks before key MENA dates

function isSeasonalSeason(): boolean {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-based
  const day = now.getDate();

  // Ramadan 2026: ~Feb 18 – Mar 19; show from Jan 1
  // Ramadan 2025: ~Feb 28 – Mar 29; show from Jan 10
  // National Day UAE: Dec 2; show from Oct 7
  // Eid al-Fitr: ~Mar/Apr; show ~8 weeks prior

  // Broad check: Jan–Mar = Ramadan season, Oct–Dec = National Day season
  const isRamadanSeason = (month >= 1 && month <= 3);
  const isNationalDaySeason = (month >= 10 && month <= 12);
  return isRamadanSeason || isNationalDaySeason;
}

function getSeasonalBanner(): { title: string; subtitle: string } | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  if (month >= 1 && month <= 3) {
    return { title: "☽ Ramadan 2026 is coming", subtitle: "Book your seasonal campaign team now — slots are limited" };
  }
  if (month >= 10 && month <= 12) {
    return { title: "🇦🇪 National Day season", subtitle: "Book your UAE National Day campaign team — Dec 2 edition" };
  }
  return null;
}

// Package category → Fey-style subtle background tint
const CATEGORY_TINT: Record<string, string> = {
  ugc:       "rgba(124,92,255,0.06)",
  social:    "rgba(34,211,238,0.05)",
  video:     "rgba(16,185,129,0.05)",
  seasonal:  "rgba(234,179,8,0.05)",
  awareness: "rgba(99,102,241,0.05)",
  performance: "rgba(249,115,22,0.05)",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function QuickBookPanel() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<PackageCategory | null>(null);

  const seasonalBanner = useMemo(() => getSeasonalBanner(), []);
  const showSeasonal = useMemo(() => isSeasonalSeason(), []);

  const filteredPackages = useMemo(() => {
    if (!selectedCategory) {
      // Default: show one starter per category
      const seen = new Set<PackageCategory>();
      return PACKAGES.filter((p) => {
        if (p.tier === "elite") return false;
        if (p.category === "seasonal" && !showSeasonal) return false;
        if (seen.has(p.category)) return false;
        seen.add(p.category);
        return true;
      });
    }
    return PACKAGES.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, showSeasonal]);

  const handleSelect = (pkg: PackageConfig) => {
    // Navigate to welcome with package pre-selected
    router.push(`/?package=${pkg.id}`);
  };

  const categories = Object.entries(PACKAGE_CATEGORY_META) as [PackageCategory, { label: string; description: string; emoji: string }][];

  return (
    <div className="w-full">
      {/* Seasonal banner */}
      {seasonalBanner && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/[0.08] border border-amber-400/[0.18]"
        >
          <div className="flex-1">
            <p className="text-[12px] font-medium text-amber-300/90">{seasonalBanner.title}</p>
            <p className="text-[10px] text-white/35 mt-0.5">{seasonalBanner.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCategory("seasonal")}
            className="px-3 py-1.5 rounded-lg bg-amber-500/[0.18] text-amber-300/80 text-[11px] hover:bg-amber-500/[0.28] transition-colors shrink-0"
          >
            View packages →
          </button>
        </motion.div>
      )}

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-[11px] ring-1 transition-all duration-150",
            !selectedCategory
              ? "bg-white/[0.10] text-white ring-white/[0.22]"
              : "bg-white/[0.04] text-white/40 ring-white/[0.07] hover:bg-white/[0.07] hover:text-white/65"
          )}
        >
          All
        </button>
        {categories.map(([cat, meta]) => {
          if (cat === "seasonal" && !showSeasonal) return null;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory((prev) => prev === cat ? null : cat)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] ring-1 transition-all duration-150",
                selectedCategory === cat
                  ? "bg-white/[0.10] text-white ring-white/[0.22]"
                  : "bg-white/[0.04] text-white/40 ring-white/[0.07] hover:bg-white/[0.07] hover:text-white/65"
              )}
            >
              <span className="text-[12px] leading-none">{meta.emoji}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Package grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory ?? "all"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {filteredPackages.map((pkg) => (
            <QuickBookCard key={pkg.id} pkg={pkg} onSelect={handleSelect} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Package Card ──────────────────────────────────────────────────────────────

function QuickBookCard({ pkg, onSelect }: { pkg: PackageConfig; onSelect: (p: PackageConfig) => void }) {
  const isElite = pkg.tier === "elite";
  const isSeasonal = pkg.category === "seasonal";
  const tint = CATEGORY_TINT[pkg.category] ?? "rgba(255,255,255,0.025)";

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(pkg)}
      whileHover={{ scale: 1.012 }}
      whileTap={{ scale: 0.988 }}
      className="group relative text-left w-full rounded-2xl transition-all duration-200 overflow-hidden"
      style={{
        background: tint,
        border: "none",
        boxShadow: "none",
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2.5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[15px]">{pkg.emoji}</span>
              <span className="text-[13px] font-medium text-white/85 tracking-[-0.01em]">{pkg.name}</span>
            </div>
            <p className="text-[10px] text-white/32 leading-relaxed">{pkg.tagline}</p>
          </div>
          <div className="shrink-0 ml-2 px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/[0.05] text-white/32">
            {isSeasonal ? "Seasonal" : isElite ? "Elite" : "Starter"}
          </div>
        </div>

        {/* Roles */}
        <div className="flex flex-wrap gap-1 mb-3">
          {[...new Set(pkg.roles)].slice(0, 3).map((role) => (
            <span key={role} className="px-1.5 py-0.5 rounded-md bg-white/[0.05] text-white/35 text-[9px] ring-1 ring-white/[0.06]">
              {role}
            </span>
          ))}
          {[...new Set(pkg.roles)].length > 3 && (
            <span className="text-[9px] text-white/22 px-1">+{[...new Set(pkg.roles)].length - 3}</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5">
          <div>
            <p className="text-[11px] font-medium text-white/60">{getPackagePriceLabel(pkg)}</p>
            <p className="text-[9px] text-white/22 mt-0.5">{pkg.priceNote}</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/30 group-hover:text-white/60 transition-colors">
            <span>Book</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
