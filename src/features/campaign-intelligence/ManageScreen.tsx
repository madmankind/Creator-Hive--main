"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { feyTokens } from "@/lib/fey-design-tokens";
import { Settings2, Share2, FileText, BookOpen } from "lucide-react";
import type { TalentCampaignCard } from "@/components/campaigns/types";
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
import { curatedTalent } from "@/lib/curatedTalent";

interface ManageScreenProps {
  selectedCampaignIds: string[];
}

// Feature flag: enable V2 layout
const USE_MANAGE_V2 = true;

export function ManageScreen({ selectedCampaignIds }: ManageScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeCampaign } = useCampaign();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isContractDrawerOpen, setIsContractDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const useV2 = USE_MANAGE_V2 || searchParams.get("v2") === "1";

  const currentCampaignId = selectedCampaignIds[0] || activeCampaign?.id || null;

  // ── Real talent cards ────────────────────────────────────────────────────
  const [cards, setCards] = useState<TalentCampaignCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  // Build cards from activeCampaign's booked talent when API returns nothing
  const buildCardsFromCampaign = useCallback((): TalentCampaignCard[] => {
    if (!activeCampaign?.talentIds || !activeCampaign?.talentNames) return [];
    const ids = activeCampaign.talentIds;
    const names = activeCampaign.talentNames;
    if (ids.length === 0) return [];
    return ids.map((tid, i) => {
      const t = curatedTalent.find(c => c.id === tid);
      return {
        id: `booked-${tid}`,
        campaignId: activeCampaign.id,
        talentId: tid,
        talentName: names[i] ?? t?.name ?? "Creator",
        talentRole: t?.primaryRole ?? "Creator",
        deliverables: [
          { id: `d-${tid}-1`, type: "Reel", files: [], status: "Pending", revisionCount: 0 },
          { id: `d-${tid}-2`, type: "Story", files: [], status: "Pending", revisionCount: 0 },
        ],
        agreedRate: 5000,
        currency: "AED",
        engagementRate: t?.engagementRate ? parseFloat((t.engagementRate * 100).toFixed(1)) : 3.8,
        status: "BOOKED" as TalentCampaignCard["status"],
        paymentStatus: "UNFUNDED",
        bookingState: "CONFIRMED" as TalentCampaignCard["bookingState"],
        createdAt: new Date().toISOString(),
      };
    });
  }, [activeCampaign]);

  const fetchCards = useCallback(async (campaignId: string) => {
    setCardsLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/talents`);
      if (!res.ok) throw new Error(`Failed to load talent (${res.status})`);
      const data = await res.json();
      const realCards: TalentCampaignCard[] = data.cards ?? [];
      // Fall back to campaign-context talent, then demo cards
      setCards(realCards.length > 0 ? realCards : buildCardsFromCampaign());
    } catch {
      // Use campaign-context talent if API is unavailable
      setCards(buildCardsFromCampaign());
    } finally {
      setCardsLoading(false);
    }
  }, [buildCardsFromCampaign]);

  useEffect(() => {
    if (!currentCampaignId) {
      setCards([]);
      return;
    }
    fetchCards(currentCampaignId);
  }, [currentCampaignId, fetchCards]);

  // Derive selected card from state (no useMemo needed)
  const selectedCard: TalentCampaignCard | null = selectedCardId
    ? (cards.find((c) => c.id === selectedCardId) ?? null)
    : cards[0] ?? null;

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

  const handlePayClick = () => {
    if (currentCampaignId) {
      router.push(`/dashboard/campaigns/${currentCampaignId}?mode=pay`);
    }
  };

  const handlePrimaryAction = async (action: string, card: TalentCampaignCard) => {
    if (action.startsWith("Confirm booking")) {
      // POST to API to confirm the booking invitation
      try {
        await fetch(`/api/contracts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: card.campaignId, creatorId: card.talentId }),
        });
      } catch { /* no-op – optimistic UI */ }
      setHighlightedCardId(card.id);
    } else if (action.startsWith("Approve deliverable") || action.startsWith("Review deliverable")) {
      router.push(`/dashboard/contracts`);
    } else if (action.startsWith("Secure deposit") || action.startsWith("Release payment")) {
      handlePayClick();
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
          onPayClick={handlePayClick}
          onPrimaryAction={handlePrimaryAction}
        />
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
      className="relative flex flex-col"
      style={{
        minHeight: "100dvh",
        width: "100%",
        overflowX: "hidden",
        overflowY: "auto",
        color: feyTokens.colors.text.primary,
        background: "#07070B",
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
      <div className="relative z-10 w-full flex-1 min-h-0 flex justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1240px] min-h-0 flex flex-col">
          {/* Header */}
          <div
            className="flex items-center justify-between flex-wrap gap-2"
            style={{ minHeight: "64px", paddingTop: "12px", paddingBottom: "12px" }}
          >
              {/* Left: Campaign Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-full max-w-[240px]">
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
                <Tooltip label="Bookings">
                  <button
                    onClick={() => { window.location.href = "/dashboard/bookings"; }}
                    className="flex items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                    style={{
                      borderColor: "rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.06)",
                      color: feyTokens.colors.text.secondary,
                      height: "36px",
                      width: "36px",
                    }}
                  >
                    <BookOpen className="h-4 w-4" />
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

          {/* MainContent */}
          <div
            className="flex-1 flex flex-col gap-4 overflow-y-auto"
            style={{ paddingBottom: "calc(88px + 24px + env(safe-area-inset-bottom, 0px))" }}
          >
            {/* Talent frame */}
            <SectionFrame style={{ minHeight: "280px" }}>
              <TalentCarousel
                cards={cards}
                selectedCardId={selectedCardId || selectedCard?.id || null}
                onCardSelect={handleCardSelect}
                highlightedCardId={highlightedCardId}
              />
            </SectionFrame>

            {/* Bottom row: stacks on mobile, side-by-side on lg+ */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
              <SectionFrame style={{ minHeight: "260px" }}>
                <ExecutionHubPanel cards={cards} campaignName={activeCampaign?.name} />
              </SectionFrame>
              <SectionFrame style={{ minHeight: "260px" }}>
                <WeeklyCalendarPanel cards={cards} onSelectTalent={handleTalentSelect} />
              </SectionFrame>
            </div>
          </div>
        </div>
      </div>

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
