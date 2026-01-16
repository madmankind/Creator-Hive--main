"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { feyTokens } from "@/lib/fey-design-tokens";
import { Settings2, Share2, FileText } from "lucide-react";
import type { TalentCampaignCard } from "@/components/campaigns/types";
import { mockTalentCampaignCards } from "@/mock/campaigns";
import { useCampaign } from "@/contexts/CampaignContext";
import { CampaignSwitcher } from "@/components/campaigns/CampaignSwitcher";
import { TalentCarousel } from "@/components/manage/TalentCarousel";
import { ContractDrawer } from "@/components/contracts/ContractDrawer";
import { BottomDock } from "@/components/nav/BottomDock";
import { Tooltip } from "@/components/manage/Tooltip";
import { SectionFrame } from "@/components/manage/SectionFrame";
import { ExecutionHubPanel } from "@/components/manage/ExecutionHubPanel";
import { WeeklyCalendarPanel } from "@/components/manage/WeeklyCalendarPanel";
import { ManageLayoutV2 } from "@/components/manage/ManageLayoutV2";

interface ManageScreenProps {
  selectedCampaignIds: string[];
}

const EXPIRY_MS = 48 * 60 * 60 * 1000;

// Feature flag: enable V2 layout
// Can be enabled via:
// 1. Local constant: USE_MANAGE_V2 = true
// 2. Query param: ?v2=1
const USE_MANAGE_V2 = true; // Set to false to use old layout

export function ManageScreen({ selectedCampaignIds }: ManageScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeCampaign } = useCampaign();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isContractDrawerOpen, setIsContractDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Check feature flag: query param ?v2=1 or local constant
  const useV2 = USE_MANAGE_V2 || searchParams.get("v2") === "1";

  const currentCampaignId = selectedCampaignIds[0] || activeCampaign?.id || null;

  const cards = useMemo<TalentCampaignCard[]>(() => {
    const now = Date.now();
    const scoped = mockTalentCampaignCards.filter((card) =>
      currentCampaignId ? card.campaignId === currentCampaignId : true
    );

    return scoped.map((card) => {
      const created = new Date(card.createdAt).getTime();
      const shouldExpire = card.bookingState === "PENDING" && now - created > EXPIRY_MS;
      if (shouldExpire) {
        const expiredCard: TalentCampaignCard = {
          ...card,
          status: "UNAVAILABLE",
          bookingState: "EXPIRED",
          unavailableReason: "EXPIRED",
        };
        return expiredCard;
      }
      return card;
    });
  }, [currentCampaignId]);

  // Auto-select first card if none selected
  const selectedCard = useMemo(() => {
    if (selectedCardId) {
      return cards.find((c) => c.id === selectedCardId) || null;
    }
    if (cards.length > 0) {
      return cards[0];
    }
    return null;
  }, [cards, selectedCardId]);

  // Auto-select first card on mount or when cards change
  useEffect(() => {
    if (!selectedCardId && cards.length > 0) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  const handleCardSelect = (card: TalentCampaignCard) => {
    setSelectedCardId(card.id);
  };

  const handleTalentSelect = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setSelectedCardId(card.id);
      setHighlightedCardId(card.id);
    }
  };

  useEffect(() => {
    if (!highlightedCardId) return;
    const t = setTimeout(() => setHighlightedCardId(null), 1200);
    return () => clearTimeout(t);
  }, [highlightedCardId]);

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

  // No parallax in one-screen default state (keeps it stable + prevents edge reveals).

  // Render V2 layout if enabled
  if (useV2) {
    return (
      <>
        <ManageLayoutV2
          cards={cards}
          selectedCardId={selectedCardId || selectedCard?.id || null}
          onCardSelect={handleCardSelect}
          highlightedCardId={highlightedCardId}
          onSelectTalent={handleTalentSelect}
          campaignName={activeCampaign?.name}
          debugOutlines={searchParams.get("debug") === "1"}
          onContractClick={() => setIsContractDrawerOpen(true)}
        />
        <BottomDock />
        <ContractDrawer
          isOpen={isContractDrawerOpen}
          onClose={() => setIsContractDrawerOpen(false)}
          campaignId={currentCampaignId || undefined}
          campaignName={activeCampaign?.name}
          contractId={selectedCard?.contractId}
        />
      </>
    );
  }

  // Original layout (fallback)
  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        minHeight: "100svh",
        height: "100svh",
        width: "100vw",
        color: feyTokens.colors.text.primary,
        background: "#07070B", // Opaque base to prevent bleed
        isolation: "isolate",
      }}
    >
      {/* Opaque Base Layer - Full viewport coverage */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "#07070B",
          zIndex: 0,
        }}
      />

      {/* Discover-style purple glow */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none bg-hive-radial opacity-70"
        style={{
          zIndex: 1,
          maskImage: "radial-gradient(70% 70% at 50% 20%, black 0%, black 55%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(70% 70% at 50% 20%, black 0%, black 55%, transparent 85%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(900px 520px at 18% 12%, rgba(0,220,255,0.08) 0%, rgba(0,0,0,0) 60%), radial-gradient(1200px 800px at 50% 40%, rgba(124,92,255,0.22) 0%, rgba(0,0,0,0) 62%)",
          filter: "blur(10px)",
        }}
      />

      {/* Centered Workspace Container */}
      <div className="relative z-10 w-full flex-1 min-h-0 flex justify-center">
        <div className="w-full max-w-[1240px] min-h-0 flex flex-col">
          {/* Header (fixed height) */}
          <div
            className="flex items-center justify-between"
            style={{ flex: "0 0 64px" }}
          >
              {/* Left: Campaign Info */}
              <div className="flex items-center gap-4">
                <div className="w-[240px]">
                  <CampaignSwitcher />
                </div>
                <div
                  className="text-[11px]"
                  style={{ color: feyTokens.colors.text.muted }}
                >
                  {cards.length} talent · {cards.reduce((acc, c) => acc + c.deliverables.length, 0)} deliverables
                </div>
              </div>

              {/* Right: Utility Actions */}
              <div className="flex items-center gap-2" ref={settingsRef}>
                <Tooltip label="Contract">
                  <button
                    onClick={() => setIsContractDrawerOpen(true)}
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
                        setIsContractDrawerOpen(true);
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

          {/* MainContent (fills remaining height, reserves dock) */}
          <div
            className="flex-1 min-h-0 flex flex-col"
            style={{
              padding: "16px 24px 0",
              gap: "16px",
              paddingBottom: "calc(88px + 16px)", // reserve dock
              overflow: "hidden",
            }}
          >
            {/* Grid layout: top big frame + bottom split frames */}
            <div
              className="w-full min-h-0"
              style={{
                display: "grid",
                gridTemplateRows: "300px 260px",
                gap: "16px",
                minHeight: 0,
              }}
            >
              {/* Talent frame row */}
              <SectionFrame style={{ height: "300px" }}>
                <div style={{ height: "100%", minHeight: 0 }}>
                  <TalentCarousel
                    cards={cards}
                    selectedCardId={selectedCardId || selectedCard?.id || null}
                    onCardSelect={handleCardSelect}
                    highlightedCardId={highlightedCardId}
                  />
                </div>
              </SectionFrame>

              {/* Bottom row: Execution + Calendar */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 7fr) minmax(0, 3fr)",
                  gap: "16px",
                  minHeight: 0,
                }}
              >
                <SectionFrame style={{ height: "260px" }}>
                  <div style={{ height: "100%", minHeight: 0 }}>
                    <ExecutionHubPanel cards={cards} campaignName={activeCampaign?.name} />
                  </div>
                </SectionFrame>

                <SectionFrame style={{ height: "260px" }}>
                  <div style={{ height: "100%", minHeight: 0 }}>
                    <WeeklyCalendarPanel cards={cards} onSelectTalent={handleTalentSelect} />
                  </div>
                </SectionFrame>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dock Navigation */}
      <BottomDock />

      {/* Contract Drawer */}
      <ContractDrawer
        isOpen={isContractDrawerOpen}
        onClose={() => setIsContractDrawerOpen(false)}
        campaignId={currentCampaignId || undefined}
        campaignName={activeCampaign?.name}
        contractId={selectedCard?.contractId}
      />
    </div>
  );
}
