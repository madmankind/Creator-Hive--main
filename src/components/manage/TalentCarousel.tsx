"use client";

/**
 * CHANGELOG:
 * - Removed "Talent" title text to reclaim vertical space
 * - Moved search + count to absolute overlay (top-right, no layout height)
 * - Changed scroll container to items-center for vertical centering
 * - Reduced padding (4px top/bottom) for better card fit
 * - Card wrappers use strict height: 250px with center alignment
 * - Fixed scrollToSelected to use filteredCards (prevents index bugs)
 * - All index calculations now use filteredCards.length
 */

import { useEffect, useMemo, useRef, useState, useCallback, type CSSProperties } from "react";
import { TalentCard } from "./TalentCard";
import type { TalentCampaignCard } from "@/components/campaigns/types";
import { curatedTalent } from "@/lib/curatedTalent";
import { feyTokens } from "@/lib/fey-design-tokens";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface TalentCarouselProps {
  cards: TalentCampaignCard[];
  selectedCardId: string | null;
  onCardSelect: (card: TalentCampaignCard) => void;
  highlightedCardId?: string | null;
  onContractClick?: () => void;
  onPayClick?: () => void;
  onPrimaryAction?: (action: string, card: TalentCampaignCard) => void;
}

export function TalentCarousel({ cards, selectedCardId, onCardSelect, highlightedCardId, onContractClick, onPayClick, onPrimaryAction }: TalentCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Filter cards by search query (name, handle, status)
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    const query = searchQuery.toLowerCase();
    return cards.filter((card) => {
      const name = card.talentName.toLowerCase();
      const handle = card.talentName.toLowerCase().replace(/\s+/g, "");
      const status = card.status.toLowerCase();
      const bookingState = card.bookingState?.toLowerCase() || "";
      return name.includes(query) || handle.includes(query) || status.includes(query) || bookingState.includes(query);
    });
  }, [cards, searchQuery]);

  // Deterministic sizing: 3.2 visible cards at rest, regardless of viewport.
  // --cardW: clamp(260px, ((100% - gap*3)/3.2), 280px)
  const GAP_PX = 20;
  const [measuredCardW, setMeasuredCardW] = useState(270);
  const step = useMemo(() => measuredCardW + GAP_PX, [measuredCardW]);

  // Update scroll button states and current index
  const updateScrollState = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    
    // Calculate current snapped index (clamp to filtered cards length)
    const snappedIndex = Math.round(scrollLeft / step);
    setCurrentIndex(Math.max(0, Math.min(snappedIndex, filteredCards.length - 1)));
  }, [filteredCards.length, step]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    updateScrollState();
    container.addEventListener("scroll", updateScrollState);
    return () => container.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState, filteredCards.length]);

  // Measure real rendered card width (for precise chevrons/dots behavior)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const measure = () => {
      const first = container.querySelector<HTMLElement>("[data-talent-card]");
      if (!first) return;
      const w = Math.round(first.getBoundingClientRect().width);
      if (w > 0) setMeasuredCardW(w);
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    return () => ro.disconnect();
  }, [filteredCards.length]);

  // Scroll to selected card (only if selected card is in filtered set)
  const scrollToSelected = useCallback(() => {
    if (selectedCardId && cardRefs.current.has(selectedCardId)) {
      const index = filteredCards.findIndex((c) => c.id === selectedCardId);
      if (index < 0) return; // Selected card not in filtered set
      scrollContainerRef.current?.scrollTo({ left: index * step, behavior: "smooth" });
    }
  }, [selectedCardId, filteredCards, step]);

  useEffect(() => {
    scrollToSelected();
  }, [scrollToSelected]);

  // Wheel-to-horizontal routing (safe): only convert when gesture is clearly horizontal.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let pending = 0;

    const handleWheel = (e: WheelEvent) => {
      const dx = e.deltaX;
      const dy = e.deltaY;
      const isHorizontal = Math.abs(dx) > Math.abs(dy);
      const shifted = e.shiftKey && Math.abs(dy) > 0;
      if (!isHorizontal && !shifted) return; // allow normal vertical page scroll

      e.preventDefault();
      pending += shifted ? dy : dx;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        container.scrollBy({ left: pending, behavior: "auto" });
        pending = 0;
        rafId = null;
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Chevron navigation
  const handleChevronClick = useCallback((direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const targetScroll = direction === "left" ? currentScroll - step : currentScroll + step;
    
    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  }, [step]);

  return (
    <div
      className="relative"
      style={{
        height: "100%",
        overflow: "visible",
      }}
    >
      {/* Compact overlay controls (top-right, absolute, no layout height) */}
      <div
        className="absolute top-0 right-0 z-40 flex items-center gap-3"
        style={{
          padding: "8px 12px",
        }}
      >
        {/* Search control */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-[10px] px-3 py-1.5 text-[11px] outline-none transition-all"
            style={{
              width: searchQuery ? "160px" : "32px",
              background: searchQuery ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.35)",
              border: searchQuery ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
              color: feyTokens.colors.text.secondary,
              backdropFilter: "blur(8px)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.width = "160px";
              e.currentTarget.style.background = "rgba(0,0,0,0.65)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            }}
            onBlur={(e) => {
              if (!searchQuery) {
                e.currentTarget.style.width = "32px";
                e.currentTarget.style.background = "rgba(0,0,0,0.35)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }
            }}
          />
          <Search
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: "14px",
              height: "14px",
              color: feyTokens.colors.text.muted,
            }}
          />
        </div>
        {filteredCards.length > 0 && (
          <div
            className="text-[11px] px-2 py-1 rounded-[8px]"
            style={{
              color: feyTokens.colors.text.muted,
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(8px)",
            }}
          >
            {filteredCards.length} talents
          </div>
        )}
      </div>

      {/* Carousel Container - fills full height, no header gap */}
      <div
        className="relative overflow-visible h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Scroll Container - Show 3.2 cards, vertically centered */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto h-full items-center relative"
          style={
            {
              ["--gap" as any]: `${GAP_PX}px`,
              ["--cardW" as any]: `260px`,
              ["--cardH" as any]: `250px`,
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              overscrollBehaviorX: "contain",
              overscrollBehaviorY: "none",
              paddingLeft: "18px",
              paddingRight: "calc(18px + (var(--cardW) * 0.2))", // peek of next card
              paddingTop: "4px", // minimal top padding
              paddingBottom: "4px", // minimal bottom padding
              gap: "var(--gap)",
            } as CSSProperties
          }
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {filteredCards.map((card) => (
            <div
              key={card.id}
              data-talent-card
              ref={(el) => {
                if (el) cardRefs.current.set(card.id, el);
                else cardRefs.current.delete(card.id);
              }}
              style={{
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                flexShrink: 0,
                width: "var(--cardW)",
                height: "var(--cardH)", // Strict 250px height
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TalentCard
                card={card}
                isSelected={selectedCardId === card.id}
                onClick={() => onCardSelect(card)}
                avatarUrl={curatedTalent.find((t) => t.id === card.talentId)?.profileImageUrl ?? curatedTalent.find((t) => t.id === card.talentId)?.avatarUrl ?? `https://i.pravatar.cc/300?img=${(((parseInt(card.talentId.replace(/\D/g, ""), 10) || 1) - 1) % 70) + 1}`}
                isHighlighted={highlightedCardId === card.id}
                onContractClick={onContractClick}
                onPayClick={onPayClick}
                onPrimaryAction={onPrimaryAction}
              />
            </div>
          ))}
          {filteredCards.length === 0 && (
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: "260px",
                height: "320px",
                color: feyTokens.colors.text.muted,
              }}
            >
              <div className="text-sm">No talent found</div>
            </div>
          )}
        </div>

        {/* Chevron Navigation - Fade in on hover */}
        {isHovered && filteredCards.length > 0 && (
          <>
            {canScrollLeft && (
              <button
                onClick={() => handleChevronClick("left")}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center rounded-full transition-opacity"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "rgba(0,0,0,0.65)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: feyTokens.colors.text.secondary,
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 150ms ease-out",
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => handleChevronClick("right")}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center rounded-full transition-opacity"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "rgba(0,0,0,0.65)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: feyTokens.colors.text.secondary,
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 150ms ease-out",
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </>
        )}

        {/* Dots removed for density; chevrons + snap + count are primary affordances */}

        {/* Edge Fades (reduced opacity for cavity look) */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-20"
          style={{
            background: "linear-gradient(to right, rgba(12,12,18,0.75) 0%, rgba(12,12,18,0) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-20"
          style={{
            background: "linear-gradient(to left, rgba(12,12,18,0.75) 0%, rgba(12,12,18,0) 100%)",
          }}
        />
      </div>
    </div>
  );
}
