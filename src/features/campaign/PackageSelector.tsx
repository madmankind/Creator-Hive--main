"use client";

// PackageSelector — Premium welcome page package browser with role swap

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  PACKAGES,
  PACKAGE_CATEGORY_META,
  PackageConfig,
  PackageCategory,
  getPackagePriceLabel,
} from "@/lib/packages";
import type { TalentCategoryTag } from "@/lib/curatedTalent";
import { ChevronDown, Check, RefreshCw } from "lucide-react";

// All possible role swaps available in the system
const ALL_ROLES: TalentCategoryTag[] = [
  "UGC Creator", "Content Creator", "Videographer", "Photographer",
  "Editor", "Designer", "Strategist", "Copywriter", "Producer",
  "Influencer", "Social Media Manager",
];

interface PackageSelectorProps {
  onSelect: (pkg: PackageConfig) => void;
  onSkip: () => void;
  selectedPackageId?: string | null;
}

const CATEGORIES = Object.entries(PACKAGE_CATEGORY_META) as [
  PackageCategory,
  { label: string; description: string; emoji: string }
][];

export function PackageSelector({ onSelect, onSkip, selectedPackageId }: PackageSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<PackageCategory | null>(null);
  const [activeTier, setActiveTier] = useState<"starter" | "elite" | "all">("all");

  const visiblePackages = useMemo(() => {
    return PACKAGES.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeTier === "starter" && p.tier !== "starter") return false;
      if (activeTier === "elite" && p.tier !== "elite") return false;
      return true;
    });
  }, [activeCategory, activeTier]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5 text-center">
        <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-white/22 mb-1.5">
          Campaign Packages
        </p>
        <p className="text-[13px] font-light text-white/40 tracking-[-0.01em]">
          Pre-configured teams, deliverables, and pricing — swap any role to customise
        </p>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[11px] ring-1 transition-all duration-200",
              !activeCategory
                ? "bg-white/[0.11] text-white ring-white/[0.22] font-medium"
                : "bg-white/[0.04] text-white/35 ring-white/[0.07] hover:bg-white/[0.07] hover:text-white/60"
            )}
          >
            All
          </button>
          {CATEGORIES.map(([cat, meta]) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory((p) => p === cat ? null : cat)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] ring-1 transition-all duration-200",
                activeCategory === cat
                  ? "bg-white/[0.11] text-white ring-white/[0.22] font-medium"
                  : "bg-white/[0.04] text-white/35 ring-white/[0.07] hover:bg-white/[0.07] hover:text-white/60"
              )}
            >
              <span className="text-[12px] leading-none">{meta.emoji}</span>
              <span>{meta.label}</span>
            </button>
          ))}
        </div>

        {/* Tier toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] ring-1 ring-white/[0.07]">
          {(["all", "starter", "elite"] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setActiveTier(tier)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-150 capitalize",
                activeTier === tier
                  ? "bg-white/[0.10] text-white ring-1 ring-white/[0.15]"
                  : "text-white/35 hover:text-white/60"
              )}
            >
              {tier === "all" ? "All tiers" : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Package grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory ?? "all"}-${activeTier}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5"
        >
          {visiblePackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={onSelect}
              isSelected={selectedPackageId === pkg.id}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {visiblePackages.length === 0 && (
        <div className="py-8 text-center text-[12px] text-white/25">
          No packages match those filters
        </div>
      )}

      {/* Skip */}
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-[11px] text-white/20 hover:text-white/45 transition-colors duration-150 tracking-wide"
        >
          Browse all talent without a package →
        </button>
      </div>
    </div>
  );
}

function PackageCard({
  pkg,
  onSelect,
  isSelected,
}: {
  pkg: PackageConfig;
  onSelect: (p: PackageConfig) => void;
  isSelected: boolean;
}) {
  const isElite = pkg.tier === "elite";
  const isSeasonal = pkg.category === "seasonal";

  // Role swap state — tracks overrides per slot index
  const [roleOverrides, setRoleOverrides] = useState<Record<number, TalentCategoryTag>>({});
  const [swapOpenIndex, setSwapOpenIndex] = useState<number | null>(null);

  const uniqueRoles = [...new Set(pkg.roles)] as TalentCategoryTag[];
  const effectiveRoles = uniqueRoles.map((r, i) => roleOverrides[i] ?? r);

  const handleSwap = (index: number, newRole: TalentCategoryTag) => {
    setRoleOverrides((prev) => ({ ...prev, [index]: newRole }));
    setSwapOpenIndex(null);
  };

  const handleResetRoles = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRoleOverrides({});
  };

  const handleCardClick = () => {
    // Build a customised package if roles were swapped
    if (Object.keys(roleOverrides).length > 0) {
      const customPkg: PackageConfig = {
        ...pkg,
        roles: uniqueRoles.map((r, i) => roleOverrides[i] ?? r),
      };
      onSelect(customPkg);
    } else {
      onSelect(pkg);
    }
  };

  const hasOverrides = Object.keys(roleOverrides).length > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.012, y: -1 }}
      whileTap={{ scale: 0.986 }}
      transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={cn(
        "group relative text-left w-full rounded-2xl border transition-all duration-200 overflow-visible",
        isSelected
          ? "bg-white/[0.10] border-white/[0.28] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.4)]"
          : isSeasonal
            ? "bg-amber-500/[0.04] border-amber-400/[0.12] hover:border-amber-400/[0.22] hover:bg-amber-500/[0.08]"
            : isElite
              ? "bg-white/[0.035] border-white/[0.10] hover:border-white/[0.20] hover:bg-white/[0.07]"
              : "bg-white/[0.025] border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.055]"
      )}
    >
      {/* Top shimmer line */}
      {isSelected && (
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-t-2xl" />
      )}
      {!isSelected && isElite && (
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />
      )}
      {!isSelected && isSeasonal && (
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/35 to-transparent rounded-t-2xl" />
      )}

      {/* Clickable body */}
      <button
        type="button"
        onClick={handleCardClick}
        className="w-full text-left"
      >
        <div className="p-3.5">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[14px] leading-none shrink-0">{pkg.emoji}</span>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-white/88 tracking-[-0.01em] leading-tight truncate">
                  {pkg.name}
                </p>
                <p className="text-[10px] text-white/30 mt-0.5 leading-snug line-clamp-1">
                  {pkg.tagline}
                </p>
              </div>
            </div>
            {/* Tier badge */}
            <div
              className={cn(
                "shrink-0 ml-1.5 mt-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-medium tracking-wide uppercase",
                isSeasonal
                  ? "bg-amber-500/[0.15] text-amber-300/65"
                  : isElite
                    ? "bg-white/[0.08] text-white/50"
                    : "bg-white/[0.05] text-white/28"
              )}
            >
              {isSeasonal ? "Seasonal" : isElite ? "Elite" : "Starter"}
            </div>
          </div>

          {/* Deliverable summary */}
          <p className="text-[9px] text-white/22 mb-2 leading-relaxed">
            {pkg.deliverableTemplates.slice(0, 2).map((dt, i) => (
              <span key={i}>{i > 0 ? " · " : ""}{dt.quantity}× {dt.format}</span>
            ))}
            {pkg.deliverableTemplates.length > 2 && (
              <span> · +{pkg.deliverableTemplates.length - 2} more</span>
            )}
          </p>

          {/* Price + CTA */}
          <div className="flex items-end justify-between pt-2 border-t border-white/[0.05]">
            <div>
              <p className="text-[11px] font-medium text-white/62 tabular-nums">
                {getPackagePriceLabel(pkg)}
              </p>
              <p className="text-[9px] text-white/22 mt-0.5">{pkg.priceNote}</p>
            </div>
            <div
              className={cn(
                "text-[10px] transition-colors duration-150",
                isSelected
                  ? "text-white/85"
                  : "text-white/28 group-hover:text-white/60"
              )}
            >
              {isSelected ? "✓ Selected" : "Select →"}
            </div>
          </div>
        </div>
      </button>

      {/* Role pills — interactive, outside click area */}
      <div className="px-3.5 pb-3.5 -mt-1">
        <div className="flex flex-wrap gap-1 relative">
          {effectiveRoles.slice(0, 4).map((role, i) => {
            const isOverridden = !!roleOverrides[i];
            const isOpen = swapOpenIndex === i;
            return (
              <div key={i} className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSwapOpenIndex(isOpen ? null : i);
                  }}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] ring-1 transition-all duration-150",
                    isOverridden
                      ? "bg-violet-500/[0.12] text-violet-300/80 ring-violet-400/[0.20]"
                      : "bg-white/[0.04] text-white/32 ring-white/[0.06] hover:bg-white/[0.08] hover:text-white/55 hover:ring-white/[0.12]",
                    isOpen && "bg-white/[0.10] text-white/70 ring-white/[0.18]"
                  )}
                >
                  {role}
                  <RefreshCw className={cn("w-2 h-2 opacity-0 group-hover:opacity-60 transition-opacity", isOverridden && "opacity-60")} />
                </button>

                {/* Swap dropdown */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -4 }}
                      transition={{ duration: 0.14 }}
                      className="absolute left-0 top-full mt-1.5 z-50 min-w-[160px] rounded-xl bg-[#13171f] border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-2.5 py-2 border-b border-white/[0.06]">
                        <p className="text-[9px] text-white/30 uppercase tracking-wider">Swap role</p>
                      </div>
                      <div className="py-1.5 max-h-[200px] overflow-y-auto">
                        {ALL_ROLES.filter((r) => r !== (roleOverrides[i] ?? uniqueRoles[i])).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSwap(i, r);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[11px] text-white/55 hover:text-white/85 hover:bg-white/[0.06] transition-colors"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {effectiveRoles.length > 4 && (
            <span className="text-[9px] text-white/18 self-center">
              +{effectiveRoles.length - 4}
            </span>
          )}
          {hasOverrides && (
            <button
              type="button"
              onClick={handleResetRoles}
              className="text-[9px] text-violet-400/50 hover:text-violet-300/80 transition-colors ml-0.5"
            >
              reset
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
