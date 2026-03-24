/**
 * Shared pulse / news feed: compact fields power Track; Mind uses editorial layers.
 * Keep headlines + timestamps aligned so Track and Mind stay in sync.
 */
export type PulseSignal = {
  id: string;
  headline: string;
  timestamp: string;
  /** Mind Pulse: short editorial lead (hero or list deck) */
  mindLead: string;
  /** Mind Pulse: optional extra line for the hero item only */
  mindNote?: string;
};

export const PULSE_SIGNALS: PulseSignal[] = [
  {
    id: "pulse-1",
    headline: "TikTok: new attribution window options rolling out for Ads Manager",
    timestamp: "2 min ago",
    mindLead:
      "Attribution windows are shifting how live and paid shop performance reconcile — tighten creative ↔ PDP alignment before scaling.",
    mindNote: "Treat this as a signal to audit claims, not just re-tag campaigns.",
  },
  {
    id: "pulse-2",
    headline: "Meta Reels: average watch time now weighted more heavily than likes",
    timestamp: "8 min ago",
    mindLead: "Shelf + story arcs beat one-off spikes; plan fewer hooks, stronger episode rhythm.",
  },
  {
    id: "pulse-3",
    headline: "Snap: CPMs trending up in GCC post-holiday; plan reach buffers",
    timestamp: "15 min ago",
    mindLead: "Buffer reach on launches; keep offers narrow while auctions reset.",
  },
  {
    id: "pulse-4",
    headline: "YouTube Shorts: clickable sticker CTR benchmarks updated",
    timestamp: "22 min ago",
    mindLead: "Click stickers reward clarity over novelty — one CTA per short.",
  },
];

/** Track: compact operational rows (same source as Mind Pulse). */
export function trackPulseNewsItems(): { headline: string; timestamp: string }[] {
  return PULSE_SIGNALS.map(({ headline, timestamp }) => ({ headline, timestamp }));
}
