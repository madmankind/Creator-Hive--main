"use client";

import { type ReactNode } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FileText, CheckCircle2, AlertTriangle, Timer } from "lucide-react";
import type { TalentCampaignCard, PaymentState, TalentCampaignStatus } from "@/components/campaigns/types";

interface CreatorCardProps {
  card: TalentCampaignCard;
  onClick: () => void;
}

// Status colors: neutral grey for most, green for completed, silver for current
const statusColors: Record<TalentCampaignStatus, { bg: string; text: string; label: string; glow?: string }> = {
  SHORTLISTED: { bg: "rgba(255,255,255,0.06)", text: feyTokens.colors.text.secondary, label: "Shortlisted" },
  BOOKED: { bg: "rgba(255,255,255,0.06)", text: feyTokens.colors.text.secondary, label: "Booked" },
  IN_PRODUCTION: { bg: "rgba(226,232,240,0.15)", text: "#E2E8F0", label: "In Production", glow: "0 0 6px rgba(226,232,240,0.4)" },
  SUBMITTED: { bg: "rgba(255,255,255,0.06)", text: feyTokens.colors.text.secondary, label: "Submitted" },
  APPROVED: { bg: "rgba(34,197,94,0.15)", text: "#22C55E", label: "Approved", glow: "0 0 6px rgba(34,197,94,0.4)" },
  PAID: { bg: "rgba(34,197,94,0.15)", text: "#22C55E", label: "Paid", glow: "0 0 6px rgba(34,197,94,0.4)" },
  UNAVAILABLE: { bg: "rgba(255,255,255,0.06)", text: feyTokens.colors.text.muted, label: "Unavailable" },
};

// Payment state: neutral grey
const paymentStateColors: Record<PaymentState, { bg: string; text: string }> = {
  UNFUNDED: { bg: "rgba(255,255,255,0.06)", text: feyTokens.colors.text.muted },
  PARTIALLY_FUNDED: { bg: "rgba(255,255,255,0.06)", text: feyTokens.colors.text.secondary },
  FUNDED: { bg: "rgba(255,255,255,0.06)", text: feyTokens.colors.text.secondary },
  RELEASED: { bg: "rgba(34,197,94,0.15)", text: "#22C55E" },
  REFUNDED: { bg: "rgba(255,255,255,0.06)", text: feyTokens.colors.text.muted },
};

const bookingIcons: Record<TalentCampaignCard["bookingState"], ReactNode> = {
  PENDING: <Timer className="h-3 w-3" />,
  ACCEPTED: <CheckCircle2 className="h-3 w-3" />,
  CONFIRMED: <CheckCircle2 className="h-3 w-3" />,
  DECLINED: <AlertTriangle className="h-3 w-3" />,
  EXPIRED: <AlertTriangle className="h-3 w-3" />,
};

export function CreatorCard({ card, onClick }: CreatorCardProps) {
  const deliverablesSubmitted = card.deliverables.filter((d) => d.status !== "Pending").length;
  const statusStyle = statusColors[card.status];
  const paymentStyle = paymentStateColors[card.paymentStatus];
  const bookingIcon = bookingIcons[card.bookingState];

  return (
    <div
      onClick={onClick}
      className="rounded-lg border p-4 cursor-pointer transition-all hover:border-white/10 hover:shadow-lg"
      style={{
        background: feyTokens.glass.card.background,
        borderColor: feyTokens.borders.default,
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Avatar + Name */}
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: feyTokens.colors.text.primary,
          }}
        >
          {card.talentName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-xs font-semibold truncate"
            style={{ color: feyTokens.colors.text.primary }}
          >
            {card.talentName}
          </div>
          <div
            className="text-[10px] truncate"
            style={{ color: feyTokens.colors.text.muted }}
          >
            {card.talentRole}
          </div>
        </div>
      </div>

      {/* Contract + Manager */}
      <div className="mb-3 flex items-center gap-2">
        {card.contractId && (
          <div
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: feyTokens.colors.text.secondary,
            }}
          >
            <FileText className="h-3 w-3" />
            Contract {card.contractId}
          </div>
        )}
        {card.talentManagerId && (
          <div
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: feyTokens.colors.text.secondary,
            }}
          >
            Manager routed
          </div>
        )}
      </div>

      {/* Deliverables */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {card.deliverables.map((deliverable) => (
          <span
            key={deliverable.id}
            className="rounded-full px-2 py-1 text-[10px] font-medium"
            style={{
              background: `${feyTokens.borders.default}55`,
              color: feyTokens.colors.text.secondary,
            }}
          >
            {deliverable.type} • {deliverable.status}
          </span>
        ))}
      </div>

      {/* Rate + ER */}
      <div className="mb-2 flex items-center justify-between">
        <div
          className="text-xs font-semibold"
          style={{ color: feyTokens.colors.text.primary }}
        >
          {card.currency} {card.agreedRate.toLocaleString()}
        </div>
        {card.engagementRate && (
          <div
            className="text-[10px] font-medium"
            style={{ color: feyTokens.colors.text.muted }}
          >
            ER {card.engagementRate.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            background: statusStyle.bg,
            color: statusStyle.text,
            boxShadow: statusStyle.glow || "none",
          }}
        >
          {statusStyle.label}
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: paymentStyle.bg,
            color: paymentStyle.text,
          }}
        >
          {bookingIcon}
          {card.bookingState}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: paymentStyle.bg,
            color: paymentStyle.text,
          }}
        >
          {card.paymentStatus}
        </span>
        {card.unavailableReason && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: feyTokens.colors.text.muted,
            }}
          >
            {card.unavailableReason === "DECLINED" ? "Declined" : "Expired"}
          </span>
        )}
      </div>
    </div>
  );
}

