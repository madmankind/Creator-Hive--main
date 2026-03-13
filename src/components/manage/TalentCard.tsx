"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { feyTokens } from "@/lib/fey-design-tokens";
import type { TalentCampaignCard } from "@/components/campaigns/types";
import {
  FileText,
  MessageSquare,
  Folder,
  AlertCircle,
  RotateCcw,
  Maximize2,
  Instagram,
  Youtube,
  Video,
  Link2,
  CreditCard,
  Send,
  Paperclip,
  X,
  Zap,
  Radio,
  Layers,
  Film,
  Languages,
  Music2,
  FlaskConical,
  Compass,
} from "lucide-react";
import { Tooltip } from "./Tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface TalentCardProps {
  card: TalentCampaignCard;
  isSelected: boolean;
  onClick: () => void;
  onFlip?: () => void;
  avatarUrl: string;
  isHighlighted?: boolean;
  onOpenProfile?: (talentId: string) => void;
  onContractClick?: () => void;
  onPayClick?: () => void;
  onPrimaryAction?: (action: string, card: TalentCampaignCard) => void;
}

type ArchetypeName =
  | "The Maverick"
  | "The Amplifier"
  | "The Architect"
  | "The Auteur"
  | "The Translator"
  | "The Conductor"
  | "The Alchemist"
  | "The Pathfinder";

const ARCHETYPE_CFG: Record<
  ArchetypeName,
  { icon: React.ElementType; text: string; ring: string; bg: string; tooltip: string }
> = {
  "The Maverick":   { icon: Zap,          text: "#FBBf24", ring: "rgba(251,191,36,0.30)",   bg: "rgba(251,191,36,0.10)",  tooltip: "The Maverick — Bold, trend-setting creator" },
  "The Amplifier":  { icon: Radio,         text: "#34D399", ring: "rgba(52,211,153,0.30)",   bg: "rgba(52,211,153,0.10)",  tooltip: "The Amplifier — Wide-reach, community builder" },
  "The Architect":  { icon: Layers,        text: "#60A5FA", ring: "rgba(96,165,250,0.30)",   bg: "rgba(96,165,250,0.10)",  tooltip: "The Architect — Strategic, systems thinker" },
  "The Auteur":     { icon: Film,          text: "#A78BFA", ring: "rgba(167,139,250,0.30)",  bg: "rgba(167,139,250,0.10)", tooltip: "The Auteur — Cinematic, visual storyteller" },
  "The Translator": { icon: Languages,     text: "#22D3EE", ring: "rgba(34,211,238,0.30)",   bg: "rgba(34,211,238,0.10)",  tooltip: "The Translator — Cross-cultural connector" },
  "The Conductor":  { icon: Music2,        text: "#F472B6", ring: "rgba(244,114,182,0.30)",  bg: "rgba(244,114,182,0.10)", tooltip: "The Conductor — Collaborative director" },
  "The Alchemist":  { icon: FlaskConical,  text: "#FB923C", ring: "rgba(251,146,60,0.30)",   bg: "rgba(251,146,60,0.10)",  tooltip: "The Alchemist — Experimental innovator" },
  "The Pathfinder": { icon: Compass,       text: "#2DD4BF", ring: "rgba(45,212,191,0.30)",   bg: "rgba(45,212,191,0.10)",  tooltip: "The Pathfinder — Pioneer, niche explorer" },
};

const ROLE_TO_ARCHETYPE: Record<string, ArchetypeName> = {
  "UGC Creator":          "The Amplifier",
  "Content Creator":      "The Maverick",
  "Videographer":         "The Auteur",
  "Video Producer":       "The Auteur",
  "Photographer":         "The Auteur",
  "Copywriter":           "The Translator",
  "Editor":               "The Architect",
  "Growth Strategist":    "The Architect",
  "Influencer":           "The Amplifier",
  "Designer":             "The Alchemist",
  "Strategist":           "The Architect",
  "Producer":             "The Conductor",
  "Social Media Manager": "The Maverick",
};

function PrismArchetypeIcon({ role }: { role: string }) {
  const archetypeName = ROLE_TO_ARCHETYPE[role] ?? "The Pathfinder";
  const cfg = ARCHETYPE_CFG[archetypeName];
  const Icon = cfg.icon;
  return (
    <Tooltip label={cfg.tooltip}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: cfg.bg,
          boxShadow: `0 0 0 1px ${cfg.ring}`,
          cursor: "help",
          flexShrink: 0,
          opacity: 0.85,
        }}
      >
        <Icon style={{ width: 13, height: 13, color: cfg.text }} />
      </div>
    </Tooltip>
  );
}

interface ChatMessage {
  id: string;
  text: string;
  fileName?: string;
  from: "me" | "talent";
  time: string;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
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
      text: `Confirm booking${hoursLeft < 24 ? ` · ${Math.round(hoursLeft)}h left` : ""}`,
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

const cardClip = "polygon(6% 0, 94% 0, 100% 8%, 100% 100%, 0 100%, 0 8%)";

const ROLE_TINT: Record<string, { bg: string; shimmer: string }> = {
  "UGC Creator":          { bg: "rgba(124,92,255,0.04)",  shimmer: "rgba(124,92,255,0.20)" },
  "Content Creator":      { bg: "rgba(34,211,238,0.03)",  shimmer: "rgba(34,211,238,0.16)" },
  Videographer:           { bg: "rgba(16,185,129,0.04)",  shimmer: "rgba(16,185,129,0.18)" },
  Photographer:           { bg: "rgba(234,179,8,0.03)",   shimmer: "rgba(234,179,8,0.16)" },
  Copywriter:             { bg: "rgba(132,204,22,0.03)",  shimmer: "rgba(132,204,22,0.14)" },
  Editor:                 { bg: "rgba(6,182,212,0.03)",   shimmer: "rgba(6,182,212,0.16)" },
  Influencer:             { bg: "rgba(249,115,22,0.03)",  shimmer: "rgba(249,115,22,0.14)" },
  Designer:               { bg: "rgba(236,72,153,0.03)",  shimmer: "rgba(236,72,153,0.16)" },
  Strategist:             { bg: "rgba(99,102,241,0.04)",  shimmer: "rgba(99,102,241,0.18)" },
  Producer:               { bg: "rgba(20,184,166,0.03)",  shimmer: "rgba(20,184,166,0.16)" },
  "Social Media Manager": { bg: "rgba(168,85,247,0.03)",  shimmer: "rgba(168,85,247,0.16)" },
};
function getRoleTint(role: string): { bg: string; shimmer: string } {
  return ROLE_TINT[role] ?? { bg: "rgba(255,255,255,0.03)", shimmer: "rgba(255,255,255,0.12)" };
}

export function TalentCard({ card, isSelected, onClick, onFlip, avatarUrl, isHighlighted, onOpenProfile, onContractClick, onPayClick, onPrimaryAction }: TalentCardProps) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "seed-1",
      text: "Hey! Let me know if you have any questions about the brief.",
      from: "talent",
      time: formatTime(new Date(Date.now() - 1000 * 60 * 8)),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const statusLabel = getStatusLabel(card.status, card.bookingState);
  const hasAttention = needsAttention(card);
  const nextAction = getNextAction(card);
  const paymentCue = getPaymentCue(card);
  const nextDue = getNextDue(card);
  const approvedDeliverables = card.deliverables.filter((d) => d.status === "Approved").length;
  const totalDeliverables = card.deliverables.length;
  const roleTint = getRoleTint(card.talentRole || "");

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  const handleChatToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setChatOpen((v) => !v);
    if (!chatOpen) setIsFlipped(false);
  };

  const handleSend = () => {
    const text = chatInput.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      text,
      from: "me",
      time: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, msg]);
    setChatInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          text: "Got it! I'll get back to you shortly.",
          from: "talent",
          time: formatTime(new Date()),
        },
      ]);
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const msg: ChatMessage = {
      id: `file-${Date.now()}`,
      text: `Sent a file`,
      fileName: file.name,
      from: "me",
      time: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, msg]);
    e.target.value = "";
  };

  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen]);

  const platform = useMemo(() => {
    const n = parseInt(card.talentId.replace(/\D/g, ""), 10) || 1;
    const mod = n % 3;
    if (mod === 0) return "instagram" as const;
    if (mod === 1) return "tiktok" as const;
    return "youtube" as const;
  }, [card.talentId]);

  const PlatformIcon = platform === "instagram" ? Instagram : platform === "youtube" ? Youtube : Video;

  const attentionItems = [
    { label: "Contract",     status: card.contractId ? "signed" : "pending",         icon: FileText },
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
    { label: "Usage Rights", status: "pending",                                       icon: AlertCircle },
    { label: "Assets",       status: totalDeliverables > 0 ? "uploaded" : "missing", icon: Folder },
  ];

  const primaryAction = nextAction?.text || "View details";

  return (
    <div
      className="relative"
      style={{
        width: "100%",
        height: chatOpen ? "300px" : "var(--cardH, 250px)",
        minHeight: "250px",
        maxHeight: "300px",
        perspective: "1200px",
        transition: "height 280ms cubic-bezier(0.2,0.8,0.2,1)",
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
        {/* FRONT */}
        <div
          className="absolute inset-0 flex flex-col cursor-pointer overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            clipPath: cardClip,
            borderRadius: "10px",
            transform: "rotateY(0deg)",
            padding: "18px",
            background: `linear-gradient(160deg, ${roleTint.bg} 0%, rgba(0,0,0,0.55) 100%)`,
            boxShadow: isHighlighted
              ? "0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(91,63,214,0.15), 0 0 12px rgba(91,63,214,0.12), inset 0 1px 0 rgba(255,255,255,0.03)"
              : isSelected
                ? "0 6px 20px rgba(0,0,0,0.40), 0 0 0 1px rgba(91,63,214,0.12), 0 0 8px rgba(91,63,214,0.08), inset 0 1px 0 rgba(255,255,255,0.03)"
                : isHovered
                  ? "0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)"
                  : "0 3px 12px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="absolute inset-x-0 top-0 h-[1px] pointer-events-none z-10"
            style={{ background: `linear-gradient(90deg, transparent, ${roleTint.shimmer}, transparent)` }}
          />

          <div className="relative z-10 flex flex-col h-full min-h-0">
            {/* Top row: role label + prism + flip + expand */}
            <div className="flex items-center justify-between mb-2">
              <div
                className="text-[10px] uppercase font-semibold tracking-wide"
                style={{ color: feyTokens.colors.text.muted }}
              >
                {card.talentRole || "Talent"}
              </div>
              <div className="flex items-center gap-1.5">
                <PrismArchetypeIcon role={card.talentRole || ""} />
                <Tooltip label="Checklist">
                  <button
                    onClick={handleFlip}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(255,255,255,0.04)",
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.35)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = "rgba(255,255,255,0.80)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                  >
                    <RotateCcw style={{ width: 13, height: 13 }} />
                  </button>
                </Tooltip>
                <Tooltip label="Expand">
                  <button
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(255,255,255,0.04)",
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.35)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = "rgba(255,255,255,0.80)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                  >
                    <Maximize2 style={{ width: 13, height: 13 }} />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Identity */}
            <div className="flex items-start gap-3 mb-3">
              <div
                style={{
                  width: "64px", height: "72px", borderRadius: "14px",
                  overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)",
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

            {/* Status chip */}
            <div className="mb-3">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{
                  height: "20px",
                  background: hasAttention ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.08)",
                  color: hasAttention ? "#F59E0B" : feyTokens.colors.text.secondary,
                  display: "inline-flex", alignItems: "center",
                }}
              >
                {hasAttention ? "Needs attention" : statusLabel}
              </span>
            </div>

            {totalDeliverables > 0 && (
              <div className="mb-1.5">
                <div className="text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                  {approvedDeliverables}/{totalDeliverables} delivered
                </div>
              </div>
            )}

            <div className="mb-2">
              <div className="text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                {hasAttention ? (nextAction?.text || nextDue || paymentCue) : (nextDue || paymentCue)}
              </div>
            </div>

            <div className="flex-1" />

            {/* Bottom actions */}
            <div className="flex items-center justify-end gap-2" style={{ marginTop: "auto" }}>
              <Tooltip label="Open profile">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenProfile) {
                      onOpenProfile(card.talentId);
                    } else {
                      router.push(`/creators/${card.talentId}`);
                    }
                  }}
                  className="p-1.5 transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: feyTokens.colors.text.muted }}
                >
                  <Link2 className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
              <Tooltip label={chatOpen ? "Close chat" : "Message"}>
                <button
                  onClick={handleChatToggle}
                  className="p-1.5 transition-colors"
                  style={{
                    background: chatOpen ? "rgba(124,92,255,0.18)" : "rgba(255,255,255,0.06)",
                    border: chatOpen ? "1px solid rgba(124,92,255,0.40)" : "1px solid rgba(255,255,255,0.10)",
                    color: chatOpen ? "rgba(167,139,250,0.9)" : feyTokens.colors.text.muted,
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
              <Tooltip label="View files & deliverables">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (card.contractId) {
                      router.push(`/dashboard/contracts`);
                    } else {
                      router.push(`/dashboard/campaigns/${card.campaignId}?tab=files`);
                    }
                  }}
                  className="p-1.5 transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: feyTokens.colors.text.muted }}
                >
                  <Folder className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Chat overlay */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                key="chat"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute", inset: 0, zIndex: 20,
                  display: "flex", flexDirection: "column",
                  background: "linear-gradient(180deg, rgba(10,8,18,0.97) 0%, rgba(7,5,14,0.99) 100%)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                {/* Chat header */}
                <div
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px 10px",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img
                      src={avatarUrl}
                      alt={card.talentName}
                      style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", opacity: 0.9 }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.90)" }}>
                      {card.talentName}
                    </span>
                  </div>
                  <button
                    onClick={handleChatToggle}
                    style={{
                      width: 22, height: 22, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.45)", cursor: "pointer",
                    }}
                  >
                    <X style={{ width: 11, height: 11 }} />
                  </button>
                </div>

                {/* Messages */}
                <div
                  style={{
                    flex: 1, overflowY: "auto", padding: "10px 14px",
                    display: "flex", flexDirection: "column", gap: 6,
                  }}
                  className="scrollbar-hide"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex", flexDirection: "column",
                        alignItems: msg.from === "me" ? "flex-end" : "flex-start",
                        gap: 2,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "78%", padding: "6px 10px",
                          borderRadius: msg.from === "me" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                          background: msg.from === "me" ? "rgba(124,92,255,0.22)" : "rgba(255,255,255,0.07)",
                          border: msg.from === "me" ? "1px solid rgba(124,92,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
                          fontSize: 11,
                          color: msg.from === "me" ? "rgba(220,210,255,0.95)" : "rgba(255,255,255,0.80)",
                          lineHeight: 1.45, wordBreak: "break-word",
                        }}
                      >
                        {msg.fileName ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Paperclip style={{ width: 10, height: 10, flexShrink: 0 }} />
                            {msg.fileName}
                          </span>
                        ) : (
                          msg.text
                        )}
                      </div>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.28)" }}>{msg.time}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 10px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    flexShrink: 0,
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.40)", flexShrink: 0, cursor: "pointer",
                    }}
                  >
                    <Paperclip style={{ width: 12, height: 12 }} />
                  </button>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Message…"
                    style={{
                      flex: 1, minWidth: 0, height: 28, padding: "0 10px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.85)", fontSize: 11, outline: "none",
                    }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSend(); }}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: chatInput.trim() ? "rgba(124,92,255,0.28)" : "rgba(255,255,255,0.05)",
                      border: chatInput.trim() ? "1px solid rgba(124,92,255,0.45)" : "1px solid rgba(255,255,255,0.08)",
                      color: chatInput.trim() ? "rgba(167,139,250,0.95)" : "rgba(255,255,255,0.30)",
                      flexShrink: 0, cursor: chatInput.trim() ? "pointer" : "default",
                      transition: "all 0.18s",
                    }}
                  >
                    <Send style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BACK - checklist */}
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
            <div className="text-[12px] font-semibold mb-4" style={{ color: feyTokens.colors.text.primary }}>
              Attention Checklist
            </div>

            <div className="space-y-2 mb-4">
              {attentionItems.map((item, idx) => {
                const Icon = item.icon;
                const isComplete = item.status === "signed" || item.status === "secured" || item.status === "uploaded";
                return (
                  <div key={idx} className="flex items-center gap-2 text-[11px]" style={{ color: feyTokens.colors.text.secondary }}>
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

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onPrimaryAction) {
                  onPrimaryAction(primaryAction, card);
                } else {
                  // Default routing based on action
                  if (primaryAction.startsWith("Secure deposit") || primaryAction.startsWith("Release payment")) {
                    router.push(`/dashboard/campaigns/${card.campaignId}?mode=pay`);
                  } else if (primaryAction.startsWith("Approve deliverable") || primaryAction.startsWith("Review deliverable")) {
                    router.push(`/dashboard/contracts`);
                  }
                }
              }}
              className="w-full rounded-full py-2.5 text-[12px] font-medium mb-3 transition-colors"
              style={{ background: "rgba(255,255,255,0.12)", color: feyTokens.colors.text.primary, border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.16)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
            >
              {primaryAction}
            </button>

            <div className="flex items-center justify-center gap-3 mb-3">
              <Tooltip label="Send contract link">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onContractClick) {
                      onContractClick();
                    } else {
                      router.push(`/dashboard/contracts`);
                    }
                  }}
                  className="p-2 rounded-full transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", color: feyTokens.colors.text.muted }}>
                  <FileText className="h-4 w-4" />
                </button>
              </Tooltip>
              <Tooltip label="Request payment">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPayClick) {
                      onPayClick();
                    } else {
                      router.push(`/dashboard/campaigns/${card.campaignId}?mode=pay`);
                    }
                  }}
                  className="p-2 rounded-full transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", color: feyTokens.colors.text.muted }}>
                  <CreditCard className="h-4 w-4" />
                </button>
              </Tooltip>
              <Tooltip label="Open chat">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setTimeout(() => setChatOpen(true), 320); }}
                  className="p-2 rounded-full transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", color: feyTokens.colors.text.muted }}>
                  <MessageSquare className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>

            <button
              onClick={handleFlip}
              className="self-end flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", color: feyTokens.colors.text.secondary }}
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
