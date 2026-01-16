"use client";

/**
 * CHANGELOG:
 * - Changed height from hardcoded 250px to CSS variable with min/max constraints
 * - Added min-h-0 to content flex container to prevent overflow
 * - Card now respects parent height constraints while maintaining 250px target
 */

import { useMemo, useState } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import type { TalentCampaignCard } from "@/components/campaigns/types";
import {
  ArrowRight,
  FileText,
  MessageSquare,
  Folder,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Instagram,
  Youtube,
  Video,
  Link2,
  CreditCard,
} from "lucide-react";
import { Tooltip } from "./Tooltip";

interface TalentCardProps {
  card: TalentCampaignCard;
  isSelected: boolean;
  onClick: () => void;
  onFlip?: () => void;
  avatarUrl: string;
  isHighlighted?: boolean;
}

const getStatusLabel = (status: string, bookingState: string): string => {
  if (status === "UNAVAILABLE") return "Needs attention";
  if (bookingState === "PENDING") return "Pending";
  if (status === "IN_PRODUCTION") return "Active";
  if (status === "SUBMITTED") return "Active";
  if (status === "APPROVED" || status === "PAID") return "Approved";
  return "Active";
};

const needsAttention = (card: TalentCampaignCard): boolean => {
  return (
    card.status === "UNAVAILABLE" ||
    card.bookingState === "EXPIRED" ||
    card.bookingState === "DECLINED" ||
    card.deliverables.some((d) => d.status === "NeedsRevision")
  );
};

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

const getPaymentCue = (card: TalentCampaignCard): string => {
  if (card.paymentStatus === "RELEASED") return "Final released";
  if (card.paymentStatus === "FUNDED" || card.paymentStatus === "PARTIALLY_FUNDED") {
    return card.status === "APPROVED" || card.status === "PAID" ? "Final pending" : "Deposit secured";
  }
  return "Deposit pending";
};

const getNextDue = (card: TalentCampaignCard): string | null => {
  if (!card.deliverables.length) return null;
  const estimatedDue = new Date(card.createdAt);
  estimatedDue.setDate(estimatedDue.getDate() + 7);
  const dateStr = estimatedDue.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Next: ${card.deliverables[0].type} · ${dateStr}`;
};

// Subtle FIFA-like silhouette with FLAT bottom (no notch) so it never covers content.
const cardClip = "polygon(6% 0, 94% 0, 100% 8%, 100% 100%, 0 100%, 0 8%)";

export function TalentCard({ card, isSelected, onClick, onFlip, avatarUrl, isHighlighted }: TalentCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const statusLabel = getStatusLabel(card.status, card.bookingState);
  const hasAttention = needsAttention(card);
  const nextAction = getNextAction(card);
  const paymentCue = getPaymentCue(card);
  const nextDue = getNextDue(card);
  const approvedDeliverables = card.deliverables.filter((d) => d.status === "Approved").length;
  const totalDeliverables = card.deliverables.length;

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  const platform = useMemo(() => {
    const n = parseInt(card.talentId.replace(/\D/g, ""), 10) || 1;
    const mod = n % 3;
    if (mod === 0) return "instagram" as const;
    if (mod === 1) return "tiktok" as const;
    return "youtube" as const;
  }, [card.talentId]);

  const PlatformIcon = platform === "instagram" ? Instagram : platform === "youtube" ? Youtube : Video;

  // Attention checklist items (execution-only)
  const attentionItems = [
    {
      label: "Contract",
      status: card.contractId ? "signed" : "pending",
      icon: FileText,
    },
    {
      label: "Payment",
      status:
        card.paymentStatus === "RELEASED"
          ? "final released"
          : card.paymentStatus === "FUNDED" || card.paymentStatus === "PARTIALLY_FUNDED"
            ? "deposit secured"
            : "deposit pending",
      icon: CreditCard,
    },
    {
      label: "Usage Rights",
      status: "pending", // TODO: Add usage rights field
      icon: AlertCircle,
    },
    {
      label: "Assets",
      status: totalDeliverables > 0 ? "uploaded" : "missing",
      icon: Folder,
    },
  ];

  const primaryAction = nextAction?.text || "View details";

  return (
    <div
      className="relative"
      style={{
        width: "100%",
        height: "var(--cardH, 250px)", // Use CSS variable if set by parent, fallback to 250px
        minHeight: "250px",
        maxHeight: "250px",
        perspective: "1200px",
      }}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        {/* Front Side - Angular card with subtle shadows */}
        <div
          className="absolute inset-0 flex flex-col cursor-pointer overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            clipPath: cardClip,
            borderRadius: "10px",
            transform: `rotateY(0deg)`,
            transition: "transform 180ms ease-out",
            padding: "18px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.65) 100%)",
            border: `1px solid ${
              isSelected || isHighlighted ? "rgba(255,255,255,0.12)" : isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)"
            }`,
            boxShadow: isHighlighted
              ? "0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(91,63,214,0.15), 0 0 12px rgba(91,63,214,0.12), inset 0 1px 0 rgba(255,255,255,0.03)"
              : isSelected
                ? "0 6px 20px rgba(0,0,0,0.40), 0 0 0 1px rgba(91,63,214,0.12), 0 0 8px rgba(91,63,214,0.08), inset 0 1px 0 rgba(255,255,255,0.03)"
                : isHovered
                  ? "0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)"
                  : "0 3px 12px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.02)",
          }}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Inner stroke */}
          <div
            className="absolute inset-[10px] pointer-events-none"
            style={{
            clipPath: cardClip,
            borderRadius: "0px",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            opacity: 0.9,
          }}
        />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full min-h-0">
            {/* Top row: role + flip trigger */}
            <div className="flex items-start justify-between mb-2">
              <div
                className="text-[10px] uppercase font-semibold tracking-wide"
                style={{ color: feyTokens.colors.text.muted }}
              >
                {card.talentRole || "Talent"}
              </div>
              <Tooltip label={isFlipped ? "Front" : "Checklist"}>
                <button
                  onClick={handleFlip}
                  className="p-1.5 rounded-full transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: feyTokens.colors.text.secondary,
                  }}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </div>

            {/* Identity row: avatar + name/handle */}
            <div className="flex items-start gap-3 mb-3">
              <div
                style={{
                  width: "64px",
                  height: "72px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(0,0,0,0.25)",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
                  flexShrink: 0,
                }}
              >
                <img src={avatarUrl} alt={card.talentName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div className="min-w-0">
                <div className="text-[17px] font-semibold truncate" style={{ color: feyTokens.colors.text.primary }}>
                  {card.talentName}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div style={{ color: "rgba(255,255,255,0.55)" }}>
                    <PlatformIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-[12px] truncate" style={{ color: feyTokens.colors.text.muted }}>
                    @{card.talentName.toLowerCase().replace(/\s+/g, "")}
                  </div>
                </div>
              </div>
            </div>

            {/* Single Status Chip (ONLY ONE) */}
            <div className="mb-3">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{
                  height: "20px",
                  background: hasAttention ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.08)",
                  color: hasAttention ? "#F59E0B" : feyTokens.colors.text.secondary,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {hasAttention ? "Needs attention" : statusLabel}
              </span>
            </div>

            {/* Two micro-lines only */}
            {totalDeliverables > 0 && (
              <div className="mb-1.5">
                <div
                  className="text-[10px]"
                  style={{ color: feyTokens.colors.text.muted }}
                >
                  {approvedDeliverables}/{totalDeliverables} delivered
                </div>
              </div>
            )}

            {/* Payment cue OR next due */}
            <div className="mb-2">
              <div
                className="text-[10px]"
                style={{ color: feyTokens.colors.text.muted }}
              >
                {hasAttention ? (nextAction?.text || nextDue || paymentCue) : (nextDue || paymentCue)}
              </div>
            </div>

            <div className="flex-1" />

            {/* Bottom actions (icon-only, aligned bottom-right) */}
            <div className="flex items-center justify-end gap-2" style={{ marginTop: "auto" }}>
              <Tooltip label="Open profile">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="p-1.5 rounded-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: feyTokens.colors.text.muted,
                  }}
                >
                  <Link2 className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
              <Tooltip label="Message">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO
                  }}
                  className="p-1.5 rounded-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: feyTokens.colors.text.muted,
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
              <Tooltip label="Files">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO
                  }}
                  className="p-1.5 rounded-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: feyTokens.colors.text.muted,
                  }}
                >
                  <Folder className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Back Side - Attention Checklist */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            clipPath: cardClip,
            borderRadius: "0px",
            padding: "18px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.70) 100%)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          <div className="flex flex-col h-full">
            <div
              className="text-[12px] font-semibold mb-4"
              style={{ color: feyTokens.colors.text.primary }}
            >
              Attention Checklist
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 mb-4">
              {attentionItems.map((item, idx) => {
                const Icon = item.icon;
                const isComplete = item.status === "signed" || item.status === "secured" || item.status === "uploaded";
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-[11px]"
                    style={{ color: feyTokens.colors.text.secondary }}
                  >
                    <div style={{ color: isComplete ? "#10B981" : item.status.includes("overdue") ? "#F59E0B" : "rgba(255,255,255,0.60)" }}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="flex-1">{item.label}:</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: isComplete ? "rgba(16,185,129,0.16)" : "rgba(255,255,255,0.06)",
                        color: isComplete ? "#10B981" : feyTokens.colors.text.secondary,
                      }}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex-1" />

            {/* Primary Action Button */}
            <button
              onClick={onClick}
              className="w-full rounded-full py-2.5 text-[12px] font-medium mb-3 transition-colors"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: feyTokens.colors.text.primary,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.16)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              }}
            >
              {primaryAction}
            </button>

            {/* Back actions row (icon-only) */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <Tooltip label="Send contract link">
                <button
                  className="p-2 rounded-full transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: feyTokens.colors.text.muted,
                  }}
                >
                  <FileText className="h-4 w-4" />
                </button>
              </Tooltip>
              <Tooltip label="Request payment">
                <button
                  className="p-2 rounded-full transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: feyTokens.colors.text.muted,
                  }}
                >
                  <CreditCard className="h-4 w-4" />
                </button>
              </Tooltip>
              <Tooltip label="Open chat">
                <button
                  className="p-2 rounded-full transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: feyTokens.colors.text.muted,
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>

            {/* Flip Back Button */}
            <button
              onClick={handleFlip}
              className="self-end flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-colors"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: feyTokens.colors.text.secondary,
              }}
            >
              <RotateCcw className="h-3 w-3" />
              <span>Flip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
