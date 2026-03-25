"use client";

/**
 * CampaignStatusBadge — shared across Manage, Track, and Pay headers.
 * Shows the campaign lifecycle status with appropriate color and label.
 */

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PROVISIONAL:             { label: "Provisional",  color: "rgba(251,191,36,0.85)",  bg: "rgba(251,191,36,0.10)",  dot: "#fbbf24" },
  CONFIRMED_BRIEF_PENDING: { label: "Brief Pending",color: "rgba(251,191,36,0.85)",  bg: "rgba(251,191,36,0.10)",  dot: "#fbbf24" },
  BRIEF_SENT:              { label: "Brief Sent",   color: "rgba(96,165,250,0.85)",   bg: "rgba(96,165,250,0.10)",  dot: "#60a5fa" },
  IN_PROGRESS:             { label: "In Progress",  color: "rgba(52,211,153,0.85)",   bg: "rgba(52,211,153,0.10)",  dot: "#34d399" },
  PAUSED:                  { label: "Paused",       color: "rgba(251,146,60,0.85)",   bg: "rgba(251,146,60,0.10)",  dot: "#fb923c" },
  COMPLETED:               { label: "Completed",    color: "rgba(167,243,208,0.85)",  bg: "rgba(167,243,208,0.10)", dot: "#a7f3d0" },
  CANCELLED:               { label: "Cancelled",    color: "rgba(248,113,113,0.85)",  bg: "rgba(248,113,113,0.10)", dot: "#f87171" },
  DRAFT:                   { label: "Draft",        color: "rgba(255,255,255,0.35)",  bg: "rgba(255,255,255,0.06)", dot: "rgba(255,255,255,0.30)" },
  ACTIVE:                  { label: "Active",       color: "rgba(52,211,153,0.85)",   bg: "rgba(52,211,153,0.10)",  dot: "#34d399" },
};

const FALLBACK = { label: "Unknown", color: "rgba(255,255,255,0.35)", bg: "rgba(255,255,255,0.06)", dot: "rgba(255,255,255,0.30)" };

interface CampaignStatusBadgeProps {
  status?: string | null;
  size?: "sm" | "md";
}

export function CampaignStatusBadge({ status, size = "sm" }: CampaignStatusBadgeProps) {
  const cfg = (status && STATUS_CONFIG[status]) || FALLBACK;
  const fs = size === "md" ? "12px" : "11px";
  const px = size === "md" ? "9px" : "7px";
  const py = size === "md" ? "4px" : "3px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: fs,
        fontWeight: 500,
        color: cfg.color,
        background: cfg.bg,
        borderRadius: "6px",
        padding: `${py} ${px}`,
        border: `1px solid ${cfg.color.replace("0.85", "0.25")}`,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
