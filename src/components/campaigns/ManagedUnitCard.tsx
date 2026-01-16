"use client";

import { useState } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import type { TalentCampaignCard, TalentCampaignStatus } from "@/components/campaigns/types";

interface ManagedUnitCardProps {
  card: TalentCampaignCard;
  isSelected: boolean;
  onClick: () => void;
}

// Status labels - minimal, one primary status
const getStatusLabel = (status: TalentCampaignStatus, bookingState: string): string => {
  if (status === "UNAVAILABLE") return "Needs attention";
  if (bookingState === "PENDING") return "Pending";
  if (status === "IN_PRODUCTION") return "Active";
  if (status === "SUBMITTED") return "Active";
  if (status === "APPROVED" || status === "PAID") return "Approved";
  return "Active";
};

// Get next action line
const getNextAction = (card: TalentCampaignCard): { text: string; urgent: boolean } | null => {
  if (card.bookingState === "PENDING") {
    const created = new Date(card.createdAt).getTime();
    const hoursLeft = Math.max(0, 48 - (Date.now() - created) / (1000 * 60 * 60));
    return {
      text: `Confirm booking${hoursLeft < 24 ? ` • ${Math.round(hoursLeft)}h left` : ""}`,
      urgent: hoursLeft < 24,
    };
  }
  if (card.deliverables.some((d) => d.status === "NeedsRevision")) {
    return { text: "Review deliverable", urgent: true };
  }
  if (card.status === "SUBMITTED") {
    return { text: "Approve deliverable", urgent: false };
  }
  if (card.paymentStatus === "UNFUNDED" && card.status === "APPROVED") {
    return { text: "Secure deposit", urgent: false };
  }
  return null;
};

// Get payment cue
const getPaymentCue = (card: TalentCampaignCard): string => {
  if (card.paymentStatus === "RELEASED") return "Final released";
  if (card.paymentStatus === "FUNDED" || card.paymentStatus === "PARTIALLY_FUNDED") {
    return card.status === "APPROVED" || card.status === "PAID" ? "Final pending" : "Deposit secured";
  }
  return "Deposit pending";
};

// Check if needs attention (amber dot)
const needsAttention = (card: TalentCampaignCard): boolean => {
  return (
    card.status === "UNAVAILABLE" ||
    card.bookingState === "EXPIRED" ||
    card.bookingState === "DECLINED" ||
    card.deliverables.some((d) => d.status === "NeedsRevision")
  );
};

export function ManagedUnitCard({ card, isSelected, onClick }: ManagedUnitCardProps) {
  const statusLabel = getStatusLabel(card.status, card.bookingState);
  const hasAttention = needsAttention(card);
  const nextAction = getNextAction(card);
  const paymentCue = getPaymentCue(card);
  const approvedDeliverables = card.deliverables.filter((d) => d.status === "Approved").length;
  const totalDeliverables = card.deliverables.length;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col cursor-pointer transition-all duration-200 ease-out relative overflow-hidden"
      style={{
        width: "220px",
        height: "284px",
        borderRadius: "18px",
        padding: "16px",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        background: `
          linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 22%, rgba(0,0,0,0.55) 100%),
          radial-gradient(220px 120px at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 70%)
        `,
        border: `1px solid ${isSelected ? "rgba(255,255,255,0.16)" : isHovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.10)"}`,
        boxShadow: isSelected
          ? "0 26px 70px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.3), 0 0 0 1px rgba(91,63,214,0.16), 0 0 26px rgba(91,63,214,0.14)"
          : isHovered
            ? "0 20px 56px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.25)"
            : "0 14px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.2)",
      }}
    >
      {/* Inner framed window */}
      <div
        className="absolute inset-x-4 top-4"
        style={{
          height: "138px",
          borderRadius: "14px",
          background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="flex items-center justify-center h-full"
          style={{ color: feyTokens.colors.text.primary, fontSize: "24px", fontWeight: 700 }}
        >
          {card.talentName.charAt(0)}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top micro label */}
        <div
          className="text-[10px] uppercase font-semibold tracking-wide mb-2"
          style={{ color: feyTokens.colors.text.muted }}
        >
          {card.talentRole || "Talent"}
        </div>

        {/* Name */}
        <div className="mb-3">
          <div
            className="text-[15px] font-semibold"
            style={{ color: feyTokens.colors.text.primary }}
          >
            {card.talentName}
          </div>
        </div>

        {/* Next action line */}
        {nextAction && (
          <div className="mb-2">
            <div
              className="text-[11px] font-medium"
              style={{
                color: nextAction.urgent ? "#F59E0B" : feyTokens.colors.text.secondary,
              }}
            >
              {nextAction.text}
            </div>
          </div>
        )}

        {/* Deliverables progress */}
        {totalDeliverables > 0 && (
          <div className="mb-2">
            <div
              className="text-[10px]"
              style={{ color: feyTokens.colors.text.muted }}
            >
              Deliverables: {approvedDeliverables}/{totalDeliverables}
            </div>
          </div>
        )}

        {/* Payment cue */}
        <div className="mb-2">
          <div
            className="text-[10px]"
            style={{ color: feyTokens.colors.text.muted }}
          >
            {paymentCue}
          </div>
        </div>

        <div className="flex-1" />

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-medium"
            style={{
              height: "22px",
              background: hasAttention ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.08)",
              color: hasAttention ? "#F59E0B" : feyTokens.colors.text.secondary,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {hasAttention ? "Needs attention" : statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

