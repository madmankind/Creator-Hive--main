"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, RefreshCw } from "lucide-react";
import {
  PACKAGES,
  PackageConfig,
  getPackagePriceLabel,
} from "@/lib/packages";
import type { TalentCategoryTag } from "@/lib/curatedTalent";

const CARD_WIDTH = 340;
const CARD_GAP = 16;
const SNAP_STEP = CARD_WIDTH + CARD_GAP;

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

export function PackageSelector({ onSelect, onSkip, selectedPackageId }: PackageSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -SNAP_STEP : SNAP_STEP, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between px-1">
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-white/30 mb-1">
            Campaign Packages
          </p>
          <p className="text-[13px] font-light text-white/40">
            Pre-configured teams, deliverables, and pricing — swap any role to customise
          </p>
        </div>
        {/* Nav arrows */}
        <div className="flex items-center gap-1.5 shrink-0 ml-4">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-8 h-8 rounded-full bg-white/[0.05] ring-1 ring-white/[0.10] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.10] transition disabled:opacity-20 disabled:cursor-default"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-8 h-8 rounded-full bg-white/[0.05] ring-1 ring-white/[0.10] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.10] transition disabled:opacity-20 disabled:cursor-default"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroll track — 3 cards visible at once */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="overflow-x-auto overflow-y-visible scrollbar-hide pb-4"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex" style={{ gap: `${CARD_GAP}px` }}>
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="flex-shrink-0 snap-start py-2"
              style={{ width: "calc(33.333% - 11px)", maxWidth: 360 }}
            >
              <PackageCard
                pkg={pkg}
                onSelect={onSelect}
                isSelected={selectedPackageId === pkg.id}
                cardWidth="100%"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Skip */}
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-[12px] text-white/25 hover:text-white/50 transition-colors duration-150 tracking-wide"
        >
          Browse all talent without a package →
        </button>
      </div>
    </div>
  );
}

// ── Package Card ─────────────────────────────────────────────────────────────

function PackageCard({
  pkg,
  onSelect,
  isSelected,
  cardWidth = `${CARD_WIDTH}px`,
}: {
  pkg: PackageConfig;
  onSelect: (p: PackageConfig) => void;
  isSelected: boolean;
  cardWidth?: string;
}) {
  const isSeasonal = pkg.category === "seasonal";
  const [roleOverrides, setRoleOverrides] = useState<Record<number, TalentCategoryTag>>({});
  const [swapOpenIndex, setSwapOpenIndex] = useState<number | null>(null);

  const uniqueRoles = [...new Set(pkg.roles)] as TalentCategoryTag[];
  const hasOverrides = Object.keys(roleOverrides).length > 0;

  const handleSwap = (index: number, newRole: TalentCategoryTag) => {
    setRoleOverrides((prev) => ({ ...prev, [index]: newRole }));
    setSwapOpenIndex(null);
  };

  const handleCardClick = () => {
    if (Object.keys(roleOverrides).length > 0) {
      onSelect({ ...pkg, roles: uniqueRoles.map((r, i) => roleOverrides[i] ?? r) });
    } else {
      onSelect(pkg);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.008, y: -2 }}
      whileTap={{ scale: 0.986 }}
      transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] }}
      style={{
        width: cardWidth,
        boxShadow: isSelected
          ? "0 6px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)"
          : isSeasonal
            ? "0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(234,179,8,0.12)"
            : "0 4px 20px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      className={cn(
        "group relative flex flex-col rounded-2xl transition-all duration-200",
        "min-h-[330px]",
        isSelected
          ? "bg-white/[0.10]"
          : isSeasonal
            ? "bg-amber-500/[0.05] hover:bg-amber-500/[0.08]"
            : "bg-white/[0.03] hover:bg-white/[0.055]"
      )}
    >
      {/* Top shimmer line */}
      <div className={cn(
        "absolute inset-x-0 top-0 h-[1px] rounded-t-2xl",
        isSelected ? "bg-gradient-to-r from-transparent via-white/70 to-transparent"
          : isSeasonal ? "bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"
          : "bg-gradient-to-r from-transparent via-white/12 to-transparent"
      )} />

      {/* Clickable card body */}
      <button type="button" onClick={handleCardClick} className="flex-1 flex flex-col text-left p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[22px] leading-none shrink-0">{pkg.emoji}</span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-white/90 leading-tight tracking-[-0.01em]">
                {pkg.name}
              </p>
              <p className="text-[12px] text-white/45 mt-0.5 leading-snug">
                {pkg.tagline}
              </p>
            </div>
          </div>
          {isSelected && (
            <div className="shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center ml-2 mt-0.5">
              <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Deliverables */}
        <p className="text-[12px] text-white/50 leading-relaxed mb-2">
          {pkg.deliverableTemplates.slice(0, 3).map((dt, i) => (
            <span key={i}>{i > 0 ? " · " : ""}{dt.quantity}× {dt.format}</span>
          ))}
          {pkg.deliverableTemplates.length > 3 && (
            <span> · +{pkg.deliverableTemplates.length - 3} more</span>
          )}
        </p>

        {/* Ideal for */}
        <p className="text-[12px] text-white/35 leading-relaxed mb-auto line-clamp-2">
          {pkg.idealFor}
        </p>

        {/* Price */}
        <div className="mt-3 pt-3 flex items-end justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <p className="text-[14px] font-semibold text-white/80 tabular-nums">
              {getPackagePriceLabel(pkg)}
            </p>
            <p className="text-[11px] text-white/35 mt-0.5">{pkg.priceNote}</p>
          </div>
          <span className={cn(
            "text-[12px] transition-colors duration-150",
            isSelected ? "text-white/80" : "text-white/30 group-hover:text-white/60"
          )}>
            {isSelected ? "✓ Selected" : "Select →"}
          </span>
        </div>
      </button>

      {/* Role pills */}
      <div className="px-5 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {uniqueRoles.map((role, i) => {
            const overridden = roleOverrides[i];
            const displayRole = overridden ?? role;
            const isOpen = swapOpenIndex === i;
            return (
              <div key={i} className="relative">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSwapOpenIndex(isOpen ? null : i); }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] ring-1 transition-all duration-150",
                    overridden
                      ? "bg-violet-500/[0.14] text-violet-300/85 ring-violet-400/[0.22]"
                      : "bg-white/[0.05] text-white/40 ring-white/[0.08] hover:bg-white/[0.10] hover:text-white/65",
                    isOpen && "bg-white/[0.12] text-white/75 ring-white/[0.20]"
                  )}
                >
                  {displayRole}
                  <RefreshCw className="w-2.5 h-2.5 opacity-40" />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      transition={{ duration: 0.13 }}
                      className="absolute left-0 bottom-full mb-2 z-[200] min-w-[170px] rounded-xl bg-[#0F1318] border border-white/[0.14] shadow-[0_-8px_40px_rgba(0,0,0,0.7)] overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-2 border-b border-white/[0.06]">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Swap role</p>
                      </div>
                      <div className="py-1 max-h-[180px] overflow-y-auto">
                        {ALL_ROLES.filter((r) => r !== (overridden ?? role)).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSwap(i, r); }}
                            className="w-full text-left px-3 py-2 text-[12px] text-white/55 hover:text-white/90 hover:bg-white/[0.07] transition-colors"
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
          {hasOverrides && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setRoleOverrides({}); }}
              className="text-[11px] text-violet-400/50 hover:text-violet-300/80 transition-colors self-center"
            >
              reset
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
