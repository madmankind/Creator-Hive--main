"use client";

import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";
import { CreatorCard } from "@/components/campaigns/CreatorCard";
import type { TalentCampaignCard, TalentCampaignStatus } from "@/components/campaigns/types";

interface PodBoardProps {
  cards: TalentCampaignCard[];
  onCardClick: (card: TalentCampaignCard) => void;
}

const columns: { id: TalentCampaignStatus; label: string; hint: string }[] = [
  { id: "SHORTLISTED", label: "Shortlisted", hint: "Booking requests start here" },
  { id: "BOOKED", label: "Booked / Contracted", hint: "Signed contracts only" },
  { id: "IN_PRODUCTION", label: "In Production", hint: "Deliverables in flight" },
  { id: "SUBMITTED", label: "Submitted", hint: "Awaiting approval" },
  { id: "APPROVED", label: "Approved", hint: "Ready to release payout" },
  { id: "PAID", label: "Paid", hint: "Completed and settled" },
];

export function PodBoard({ cards, onCardClick }: PodBoardProps) {
  const unavailableCards = cards.filter((c) => c.status === "UNAVAILABLE");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4">
        {columns.map((column) => {
          const columnItems = cards.filter((card) => card.status === column.id);
          return (
            <FeySurface key={column.id} variant="panel" mesh={true} meshVariant="panel" padding="md" className="min-h-[620px]">
              <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                <span style={{ color: feyTokens.colors.text.label }} title={column.hint}>
                  {column.label}
                </span>
                <span className="text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                  {columnItems.length} card{columnItems.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                {columnItems.map((card) => (
                  <CreatorCard key={card.id} card={card} onClick={() => onCardClick(card)} />
                ))}
                {columnItems.length === 0 && (
                  <FeySurface variant="card" padding="md" className="text-center py-10">
                    <div
                      className="text-xs"
                      style={{ color: feyTokens.colors.text.muted }}
                    >
                      Drop cards here
                    </div>
                  </FeySurface>
                )}
              </div>
            </FeySurface>
          );
        })}
      </div>

      {unavailableCards.length > 0 && (
        <FeySurface variant="panel" mesh={true} meshVariant="panel" padding="md">
          <div className="mb-3 flex items-center justify-between">
            <div
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: feyTokens.colors.text.label }}
            >
              Unavailable — Needs Replacement
            </div>
            <span className="text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
              {unavailableCards.length} talent
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {unavailableCards.map((card) => (
              <CreatorCard key={card.id} card={card} onClick={() => onCardClick(card)} />
            ))}
          </div>
        </FeySurface>
      )}
    </div>
  );
}
