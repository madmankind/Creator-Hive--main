"use client";

import { useState, useRef, useEffect } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { Settings2, Share2, FileText } from "lucide-react";
import { CampaignSwitcher } from "@/components/campaigns/CampaignSwitcher";
import { Tooltip } from "./Tooltip";
import { TalentCarousel } from "./TalentCarousel";
import { ExecutionHubPanel } from "./ExecutionHubPanel";
import { WeeklyCalendarPanel } from "./WeeklyCalendarPanel";
import { Plus } from "lucide-react";

// Shared glass panel style — borderless for immersive look
const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.025)",
  border: "none",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  borderRadius: "16px",
  overflow: "hidden",
};
import type { TalentCampaignCard } from "@/components/campaigns/types";

interface ManageLayoutV2Props {
  cards: TalentCampaignCard[];
  selectedCardId: string | null;
  onCardSelect: (card: TalentCampaignCard) => void;
  highlightedCardId?: string | null;
  onSelectTalent: (cardId: string) => void;
  campaignName?: string;
  debugOutlines?: boolean;
  onContractClick?: () => void;
  onPayClick?: () => void;
  onPrimaryAction?: (action: string, card: TalentCampaignCard) => void;
}

/**
 * ManageLayoutV2 - Deterministic layout for Manage page
 * 
 * Layout spec:
 * - Main container: max-width 1280px, width 100%, px-24
 * - Header height: 64px
 * - Talent frame: fixed height 290px (outer), ~250px inner
 * - Two-panel grid: 12 columns, gap 24px, LEFT spans 7, RIGHT spans 5
 * - Both panels same height, computed from remaining viewport space
 * - Only LEFT panel scrolls internally
 * - Page no scroll (overflow hidden)
 * - Reserve space for bottom nav: 88px + 24px = 112px
 */
export function ManageLayoutV2({
  cards,
  selectedCardId,
  onCardSelect,
  highlightedCardId,
  onSelectTalent,
  campaignName,
  debugOutlines = false,
  onContractClick,
  onPayClick,
  onPrimaryAction,
}: ManageLayoutV2Props) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSettingsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!settingsRef.current) return;
      if (settingsRef.current.contains(e.target as Node)) return;
      setIsSettingsOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [isSettingsOpen]);

  // Deterministic height calculations
  const HEADER_HEIGHT = 56;
  const TALENT_FRAME_HEIGHT = 300; // Height for the scrollable talent row
  const VERTICAL_GAP = 24; // Gap between talent frame and panels
  const BOTTOM_NAV_HEIGHT = 88;
  // Safe-area aware bottom padding (includes iOS safe-area-inset-bottom)
  const BOTTOM_NAV_PADDING = `calc(${BOTTOM_NAV_HEIGHT}px + 24px + env(safe-area-inset-bottom, 0px))`;

  const outlineStyle = debugOutlines
    ? {
        outline: "2px solid rgba(255,0,255,0.5)",
        outlineOffset: "-2px",
      }
    : {};

  return (
    <div
      className="relative flex flex-col"
      style={{
        height: "100dvh",
        width: "100vw",
        color: feyTokens.colors.text.primary,
        background: "#07070B",
        isolation: "isolate",
      }}
    >
      {/* Opaque Base Layer */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "#07070B",
          zIndex: 0,
        }}
      />

      {/* Background Gradients — matches landing page */}
      {/* White top spotlight — matches landing page density */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.04) 55%, transparent 80%)",
          filter: "blur(130px)",
          opacity: 0.07,
        }}
      />
      {/* Amethyst center glow — matches landing page density */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "radial-gradient(ellipse at 50% 35%, #7c3aed 0%, #4c1d95 55%, transparent 100%)",
          filter: "blur(200px)",
          opacity: 0.08,
        }}
      />

      {/* Centered Workspace Container */}
      <div className="relative z-10 w-full flex-1 min-h-0 flex justify-center overflow-visible">
        <div
          className="w-full flex flex-col min-h-0"
          style={{
            maxWidth: "1240px",
            paddingLeft: "32px",
            paddingRight: "32px",
            paddingTop: "0px",
            paddingBottom: BOTTOM_NAV_PADDING,
          }}
        >
          {/* Header (fixed height) - Strict flex row with reserved widths, overflow visible for dropdowns */}
          <div
            className="flex items-center"
            style={{
              flex: `0 0 ${HEADER_HEIGHT}px`,
              height: `${HEADER_HEIGHT}px`,
              gap: "20px",
              position: "relative",
              zIndex: 50,
              overflow: "visible",
            }}
          >
            {/* Brand wordmark */}
            <span
              className="flex-shrink-0 text-[13px] font-medium opacity-30 select-none"
            >
              Creator Hive
            </span>
            {/* Divider */}
            <div className="flex-shrink-0 w-px h-4" style={{ background: "rgba(255,255,255,0.10)" }} />
            {/* Campaign switcher — single-row trigger, perfectly center-aligned */}
            <div className="flex items-center flex-shrink-0" style={{ minWidth: 0 }}>
              <CampaignSwitcher />
            </div>

            {/* Campaign stats (flexible, truncate) */}
            <div
              className="text-[13px] truncate"
              style={{ 
                color: feyTokens.colors.text.muted,
                flex: "0 1 auto",
                minWidth: 0,
              }}
            >
              {cards.length} talent · {cards.reduce((acc, c) => acc + c.deliverables.length, 0)} deliverables
            </div>

            {/* Spacer */}
            <div style={{ flex: "1 1 auto", minWidth: 0 }} />

            {/* Right: Utility Actions */}
            <div className="flex items-center gap-2" ref={settingsRef}>
              <Tooltip label="Contract">
                <button
                  onClick={onContractClick}
                  className="flex items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                  style={{
                    borderColor: "rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.06)",
                    color: feyTokens.colors.text.secondary,
                    height: "36px",
                    width: "36px",
                  }}
                >
                  <FileText className="h-4 w-4" />
                </button>
              </Tooltip>
              <Tooltip label="Settings">
                <button
                  onClick={() => setIsSettingsOpen((v) => !v)}
                  className="flex items-center justify-center rounded-full border transition-colors hover:bg-white/10 relative"
                  style={{
                    borderColor: "rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.06)",
                    color: feyTokens.colors.text.secondary,
                    height: "36px",
                    width: "36px",
                  }}
                >
                  <Settings2 className="h-4 w-4" />
                </button>
              </Tooltip>
              <Tooltip label="Share">
                <button
                  onClick={() => {
                    // TODO: share/export
                  }}
                  className="flex items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                  style={{
                    borderColor: "rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.06)",
                    color: feyTokens.colors.text.secondary,
                    height: "36px",
                    width: "36px",
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </Tooltip>

              {isSettingsOpen && (
                <div
                  className="absolute right-0 mt-2 rounded-[14px] overflow-hidden"
                  style={{
                    top: "52px",
                    width: "220px",
                    background: "rgba(12,12,18,0.92)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 18px 56px rgba(0,0,0,0.65)",
                    backdropFilter: "blur(18px)",
                  }}
                >
                  <button
                    className="w-full text-left px-3 py-2 text-[12px] transition-colors"
                    style={{ color: feyTokens.colors.text.secondary }}
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onContractClick?.();
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    Contract hub
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-[12px] transition-colors"
                    style={{ color: feyTokens.colors.text.secondary }}
                    onClick={() => {
                      setIsSettingsOpen(false);
                      // TODO: settings route
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    Settings
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div
            className="flex-1 min-h-0 flex flex-col"
            style={{
              gap: `${VERTICAL_GAP}px`,
              overflow: "hidden",
              paddingTop: "28px",
            }}
          >
            {/* Talent Frame — single flat scrollable pane, no inner glass wrapper */}
            <div
              style={{
                flex: `0 0 ${TALENT_FRAME_HEIGHT}px`,
                height: `${TALENT_FRAME_HEIGHT}px`,
                ...outlineStyle,
              }}
            >
              {cards.length === 0 ? (
                <div
                  className="h-full flex flex-col items-center justify-center gap-3"
                  style={{ color: feyTokens.colors.text.muted }}
                >
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <svg key={i} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.12 - i * 0.02, color: "rgba(255,255,255,0.9)" }}>
                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>
                    No creators added to this campaign yet
                  </p>
                  <a
                    href="/dashboard/campaigns?mode=discover"
                    className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-medium transition-colors"
                    style={{
                      background: "rgba(124,92,255,0.12)",
                      border: "1px solid rgba(124,92,255,0.3)",
                      color: "rgba(167,139,250,0.9)",
                    }}
                  >
                    <Plus size={13} />
                    Browse creators
                  </a>
                </div>
              ) : (
                <TalentCarousel
                  cards={cards}
                  selectedCardId={selectedCardId}
                  onCardSelect={onCardSelect}
                  highlightedCardId={highlightedCardId}
                  onContractClick={onContractClick}
                  onPayClick={onPayClick}
                  onPrimaryAction={onPrimaryAction}
                />
              )}
            </div>

            {/* Two-Panel Row (fills remaining height via flex) */}
            <div
              className="flex-1 min-h-0"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                gap: "24px",
                minHeight: 0,
                alignItems: "stretch",
              }}
            >
              {/* Left Panel: Execution Hub (spans 7 columns) */}
              <div
                style={{
                  gridColumn: "span 7",
                  height: "100%",
                  minHeight: 0,
                  ...outlineStyle,
                }}
              >
                <div style={{ ...GLASS, height: "100%", padding: "18px 20px" }}>
                  <ExecutionHubPanel cards={cards} campaignName={campaignName} />
                </div>
              </div>

              {/* Right Panel: Weekly Calendar (spans 5 columns) */}
              <div
                style={{
                  gridColumn: "span 5",
                  height: "100%",
                  minHeight: 0,
                  ...outlineStyle,
                }}
              >
                <div style={{ ...GLASS, height: "100%", padding: "18px 20px" }}>
                  <WeeklyCalendarPanel cards={cards} onSelectTalent={onSelectTalent} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Reserve Debug Outline */}
      {debugOutlines && (
        <div
          className="fixed left-0 right-0 bottom-0 pointer-events-none"
          style={{
            height: BOTTOM_NAV_PADDING,
            outline: "2px solid rgba(0,255,255,0.5)",
            outlineOffset: "-2px",
            zIndex: 100,
          }}
        />
      )}
    </div>
  );
}

