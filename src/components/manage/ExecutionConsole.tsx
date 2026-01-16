"use client";

import { feyTokens } from "@/lib/fey-design-tokens";
import { AlertCircle, Clock, Bell, FileText, MessageSquare, Folder, CreditCard, Link2 } from "lucide-react";
import type { TalentCampaignCard } from "@/components/campaigns/types";

interface ExecutionConsoleProps {
  cards: TalentCampaignCard[];
  selectedCardId: string | null;
}

interface ConsoleItem {
  id: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  action: string;
  onClick: () => void;
}

interface CompartmentCard {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  count: number;
  items: ConsoleItem[];
  footerAction?: string;
  accent: string;
  iconColor: string;
}

export function ExecutionConsole({ cards }: ExecutionConsoleProps) {
  // Generate attention items
  const attentionItems: ConsoleItem[] = cards
    .filter((card) => {
      return (
        card.status === "UNAVAILABLE" ||
        card.bookingState === "EXPIRED" ||
        card.bookingState === "DECLINED" ||
        card.deliverables.some((d) => d.status === "NeedsRevision") ||
        (!card.contractId && card.bookingState === "PENDING")
      );
    })
    .slice(0, 3)
    .map((card) => {
      let label = "";
      let action = "Open";
      if (!card.contractId) {
        label = `Contract pending • ${card.talentName.split(" ")[0]}`;
        action = "Send link";
      } else if (card.deliverables.some((d) => d.status === "NeedsRevision")) {
        label = `Deposit pending • ${card.talentName.split(" ")[0]}`;
        action = "Chase";
      } else if (card.paymentStatus === "UNFUNDED") {
        label = `Final approval overdue • ${card.talentName.split(" ")[0]}`;
        action = "Resolve";
      } else {
        label = `Needs attention • ${card.talentName.split(" ")[0]}`;
        action = "Open";
      }
      return {
        id: card.id,
        icon: AlertCircle,
        label,
        action,
        onClick: () => {
          console.log("Open card:", card.id);
        },
      };
    });

  // Generate next up items
  const nextUpItems: ConsoleItem[] = cards
    .flatMap((card) =>
      card.deliverables.map((d, idx) => {
        const cardCreated = new Date(card.createdAt);
        const estimatedDueDate = new Date(cardCreated);
        estimatedDueDate.setDate(estimatedDueDate.getDate() + (idx + 1) * 7);
        return {
          card,
          deliverable: d,
          dueDate: estimatedDueDate,
        };
      })
    )
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3)
    .map(({ card, deliverable, dueDate }) => {
      const dateStr = dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        id: `${card.id}-${deliverable.id}`,
        icon: Clock,
        label: `${deliverable.type} due • ${dateStr}`,
        action: "Open",
        onClick: () => {
          console.log("Open deliverable:", deliverable.id);
        },
      };
    });

  // Generate updates
  const updatesItems: ConsoleItem[] = [
    {
      id: "update-1",
      icon: MessageSquare,
      label: "Client note (WhatsApp)",
      action: "View",
      onClick: () => console.log("View note"),
    },
    {
      id: "update-2",
      icon: Folder,
      label: "Creative folder (Drive)",
      action: "Open",
      onClick: () => console.log("Open folder"),
    },
    {
      id: "update-3",
      icon: Bell,
      label: "Slack thread: @team",
      action: "Jump",
      onClick: () => console.log("Open Slack"),
    },
  ].slice(0, 3);

  // Assets & Links
  const assetsItems: ConsoleItem[] = [
    {
      id: "asset-1",
      icon: FileText,
      label: "Brand brief",
      action: "Review",
      onClick: () => console.log("Review brief"),
    },
    {
      id: "asset-2",
      icon: Folder,
      label: "Creative folder (Drive)",
      action: "Open",
      onClick: () => console.log("Open folder"),
    },
    {
      id: "asset-3",
      icon: Link2,
      label: "UTM tracker",
      action: "Copy",
      onClick: () => console.log("Copy UTM"),
    },
  ];

  // Payments
  const paymentsItems: ConsoleItem[] = cards
    .filter((card) => card.paymentStatus === "UNFUNDED" || card.paymentStatus === "PARTIALLY_FUNDED")
    .slice(0, 2)
    .map((card) => ({
      id: `payment-${card.id}`,
      icon: CreditCard,
      label: `Deposit pending $${card.agreedRate}`,
      action: "Release",
      onClick: () => console.log("Release payment:", card.id),
    }));

  const compartments: CompartmentCard[] = [
    {
      id: "attention",
      title: "Attention",
      icon: AlertCircle,
      count: attentionItems.length,
      items: attentionItems,
      footerAction: attentionItems.length >= 3 ? "View all" : undefined,
      accent: "rgba(245,158,11,0.28)",
      iconColor: "#F59E0B",
    },
    {
      id: "next-up",
      title: "Next Up",
      icon: Clock,
      count: nextUpItems.length,
      items: nextUpItems,
      footerAction: nextUpItems.length >= 3 ? "View all" : undefined,
      accent: "rgba(120,210,255,0.18)",
      iconColor: "rgba(120,210,255,0.92)",
    },
    {
      id: "updates",
      title: "Updates",
      icon: Bell,
      count: updatesItems.length,
      items: updatesItems,
      footerAction: updatesItems.length >= 3 ? "View all" : undefined,
      accent: "rgba(91,63,214,0.18)",
      iconColor: "rgba(155,130,255,0.92)",
    },
    {
      id: "assets",
      title: "Assets & Links",
      icon: Folder,
      count: assetsItems.length,
      items: assetsItems,
      footerAction: "View all",
      accent: "rgba(16,185,129,0.18)",
      iconColor: "rgba(16,185,129,0.92)",
    },
    {
      id: "payments",
      title: "Payments",
      icon: CreditCard,
      count: paymentsItems.length,
      items: paymentsItems,
      footerAction: paymentsItems.length >= 2 ? "View all" : undefined,
      accent: "rgba(45,212,191,0.16)",
      iconColor: "rgba(45,212,191,0.92)",
    },
  ];

  const renderCompartment = (compartment: CompartmentCard) => {
    const Icon = compartment.icon;
    return (
      <div
        key={compartment.id}
        className="flex flex-col rounded-[20px]"
        style={{
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "14px 14px",
          minWidth: 0,
          overflow: "hidden",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div style={{ color: compartment.iconColor }}>
              <Icon className="h-4 w-4" />
            </div>
            <div
              className="text-[13px] font-semibold"
              style={{ color: feyTokens.colors.text.primary }}
            >
              {compartment.title}
            </div>
            {compartment.count > 0 && (
              <div
                className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: feyTokens.colors.text.muted,
                }}
              >
                {compartment.count}
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1.5 flex-1 min-h-0" style={{ overflow: "hidden" }}>
          {compartment.items.length > 0 ? (
            compartment.items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-[12px] transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div style={{ color: compartment.iconColor }}>
                      <ItemIcon className="h-3 w-3 flex-shrink-0" />
                    </div>
                    <div
                      className="text-[11px] truncate"
                      style={{ color: feyTokens.colors.text.secondary }}
                    >
                      {item.label}
                    </div>
                  </div>
                  <button
                    onClick={item.onClick}
                    className="ml-2 rounded-full px-2 py-0.5 text-[9px] font-medium transition-colors flex-shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: feyTokens.colors.text.secondary,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    }}
                  >
                    {item.action}
                  </button>
                </div>
              );
            })
          ) : (
            <div
              className="text-[10px] py-2"
              style={{ color: feyTokens.colors.text.muted }}
            >
              All clear
            </div>
          )}
        </div>

        {/* Footer */}
        {compartment.footerAction && (
          <button
            className="mt-3 text-[10px] font-medium self-start transition-colors"
            style={{ color: feyTokens.colors.text.muted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = feyTokens.colors.text.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = feyTokens.colors.text.muted;
            }}
          >
            {compartment.footerAction}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col" style={{ height: "100%", minHeight: 0 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[14px] font-semibold" style={{ color: feyTokens.colors.text.primary }}>
          Execution Console
        </div>
      </div>
      <div
        className="grid gap-[14px] flex-1 min-h-0"
        style={{
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          alignItems: "stretch",
        }}
      >
        {compartments.map(renderCompartment)}
      </div>
    </div>
  );
}
