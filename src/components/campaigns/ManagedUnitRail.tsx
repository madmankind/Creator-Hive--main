"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { ManagedUnitCard } from "./ManagedUnitCard";
import type { TalentCampaignCard } from "@/components/campaigns/types";
import { feyTokens } from "@/lib/fey-design-tokens";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ManagedUnitRailProps {
  cards: TalentCampaignCard[];
  selectedCardId: string | null;
  onCardSelect: (card: TalentCampaignCard) => void;
}

export function ManagedUnitRail({ cards, selectedCardId, onCardSelect }: ManagedUnitRailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "completed">("all");
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter cards
  const filteredCards = cards.filter((card) => {
    if (filter === "all") return true;
    if (filter === "pending") return card.bookingState === "PENDING" || card.status === "SHORTLISTED";
    if (filter === "active") return ["BOOKED", "IN_PRODUCTION", "SUBMITTED"].includes(card.status);
    if (filter === "completed") return ["APPROVED", "PAID"].includes(card.status);
    return true;
  });

  const selectedIndex = useMemo(() => {
    return selectedCardId ? filteredCards.findIndex((c) => c.id === selectedCardId) : -1;
  }, [selectedCardId, filteredCards]);

  // Card refs map for scrollIntoView
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll to selected card using scrollIntoView (nearest, no forced centering)
  const scrollToSelected = useCallback(() => {
    if (selectedCardId && cardRefs.current.has(selectedCardId)) {
      const cardElement = cardRefs.current.get(selectedCardId);
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: "smooth",
          inline: "nearest",
          block: "nearest",
        });
      }
    }
  }, [selectedCardId]);

  useEffect(() => {
    scrollToSelected();
  }, [scrollToSelected]);

  // Update scroll button states
  const updateScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    return () => container.removeEventListener("scroll", updateScrollButtons);
  }, [updateScrollButtons, filteredCards.length]);

  // Wheel-to-horizontal routing (trackpad friendly)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollBy({
          left: e.deltaY,
          behavior: "auto",
        });
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // Chevron navigation
  const handleChevronClick = useCallback((direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 220;
    const gap = 28;
    const scrollAmount = cardWidth + gap;

    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCardId) return;

      const currentIndex = filteredCards.findIndex((c) => c.id === selectedCardId);
      if (currentIndex === -1) return;

      if (e.key === "ArrowLeft" && currentIndex > 0) {
        onCardSelect(filteredCards[currentIndex - 1]);
      } else if (e.key === "ArrowRight" && currentIndex < filteredCards.length - 1) {
        onCardSelect(filteredCards[currentIndex + 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCardId, filteredCards, onCardSelect]);

  return (
    <div className="space-y-4 relative">
      {/* Rail Title Row */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: feyTokens.colors.text.label }}
            >
              Manage
            </div>
            <div
              className="text-sm font-medium"
              style={{ color: feyTokens.colors.text.primary }}
            >
              Active units
            </div>
          </div>
          {/* Filter pills inline */}
          <div className="flex items-center gap-1.5">
            {(["all", "pending", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                style={{
                  background: filter === f ? "rgba(255,255,255,0.08)" : "transparent",
                  color: filter === f ? feyTokens.colors.text.primary : feyTokens.colors.text.muted,
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FIFA-like track wrapper */}
      <div
        ref={stageRef}
        className="relative rounded-[24px] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          height: "360px",
          background: "rgba(0,0,0,0.18)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Deep spotlight behind selected card */}
        {selectedIndex >= 0 && filteredCards.length > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${50 + ((selectedIndex / Math.max(1, filteredCards.length - 1)) - 0.5) * 30}%, rgba(91,63,214,0.10) 0%, rgba(0,0,0,0) 65%)`,
              transition: "background 280ms ease-out",
            }}
          />
        )}

        {/* Card Carousel - Deterministic snap, left-aligned */}
        <div
          ref={scrollContainerRef}
          className="flex gap-7 overflow-x-auto h-full items-start pl-12 pr-[calc(12px+220px*0.2)] pt-7 relative"
          style={{
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {filteredCards.map((card) => (
            <div
              key={card.id}
              ref={(el) => {
                if (el) cardRefs.current.set(card.id, el);
                else cardRefs.current.delete(card.id);
              }}
              style={{
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                flexShrink: 0,
              }}
            >
              <ManagedUnitCard
                card={card}
                isSelected={selectedCardId === card.id}
                onClick={() => onCardSelect(card)}
              />
            </div>
          ))}
          {filteredCards.length === 0 && (
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: "220px",
                height: "284px",
                color: feyTokens.colors.text.muted,
              }}
            >
              <div className="text-sm">No units found</div>
            </div>
          )}
        </div>

        {/* Chevron navigation - show on hover */}
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.75)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.65)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.75)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.65)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </>
        )}

        {/* Dot pagination indicator - bottom center */}
        {filteredCards.length > 1 && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5"
            style={{ pointerEvents: "none" }}
          >
            {filteredCards.map((card, index) => {
              const isActive = selectedCardId === card.id;
              return (
                <div
                  key={card.id}
                  className="rounded-full transition-all"
                  style={{
                    width: isActive ? "6px" : "4px",
                    height: isActive ? "6px" : "4px",
                    background: isActive
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(255,255,255,0.18)",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Edge fades - fixed, match stage background */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-20"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-20"
          style={{
            background: "linear-gradient(to left, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>
    </div>
  );
}

