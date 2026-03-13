// src/lib/packages.ts
// Creator Hive Package System — Single source of truth
// 7 campaign packages × 2 tiers each = 14 total configurations

import type { TalentCategoryTag } from "./curatedTalent";

export type PackageCategory =
  | "ugc"
  | "video"
  | "brand"
  | "performance"
  | "social"
  | "team"
  | "seasonal";

export type PackageTier = "starter" | "elite";

export type CampaignObjective = "awareness" | "engagement" | "traffic" | "conversions";

export interface DeliverableTemplate {
  platform: "Instagram" | "TikTok" | "YouTube" | "LinkedIn" | "Snapchat" | "Cross-Platform";
  format: string; // e.g. "Reel", "Static Post", "Story"
  quantity: number;
  notesTemplate?: string;
}

export interface PackageConfig {
  id: string;
  category: PackageCategory;
  tier: PackageTier;
  name: string;                        // e.g. "UGC Spark"
  tagline: string;                     // one-line description
  emoji: string;                       // visual icon
  roles: TalentCategoryTag[];          // required roles — auto-populates pod filter
  deliverableTemplates: DeliverableTemplate[];
  priceRangeAED: [number, number];
  priceNote: string;                   // "Per campaign (4 weeks)"
  idealFor: string;
  defaultObjective: CampaignObjective;
  bookingType: "campaign" | "retainer";
  budgetSplitWeights: Record<string, number>; // role label → weight (sum to 1)
  accentColor: string;                 // tailwind bg color for card
  accentText: string;                  // tailwind text color
  accentRing: string;                  // tailwind ring color
}

// ── PACKAGE DEFINITIONS ───────────────────────────────────────────────────────
// 5 high-converting packages, one clear use case each. No tier confusion.

export const PACKAGES: PackageConfig[] = [

  // ── 1. UGC ────────────────────────────────────────────────────────────────
  {
    id: "ugc-spark",
    category: "ugc",
    tier: "starter",
    name: "UGC Spark",
    tagline: "Authentic product content for DTC brands",
    emoji: "✦",
    roles: ["UGC Creator", "UGC Creator", "Editor"],
    deliverableTemplates: [
      { platform: "TikTok",    format: "Short-form Video", quantity: 4, notesTemplate: "15–30s authentic product demo, no hard sell" },
      { platform: "Instagram", format: "Reel",             quantity: 4, notesTemplate: "Repurposed from TikTok with native caption" },
      { platform: "Instagram", format: "Static Post",      quantity: 8, notesTemplate: "Still frames + lifestyle product shots" },
    ],
    priceRangeAED: [12000, 18000],
    priceNote: "Per campaign (4 weeks)",
    idealFor: "DTC product launches, e-commerce brands, F&B, beauty",
    defaultObjective: "awareness",
    bookingType: "campaign",
    budgetSplitWeights: { "UGC Creator": 0.45, "Editor": 0.1 },
    accentColor: "bg-violet-500/10",
    accentText: "text-violet-300",
    accentRing: "ring-violet-400/25",
  },

  // ── 2. VIDEO ──────────────────────────────────────────────────────────────
  {
    id: "hive-reel",
    category: "video",
    tier: "starter",
    name: "Hive Reel",
    tagline: "Brand storytelling through video",
    emoji: "▶",
    roles: ["Videographer", "Editor", "Content Creator"],
    deliverableTemplates: [
      { platform: "Instagram", format: "Brand Reel (30–90s)", quantity: 4 },
      { platform: "Instagram", format: "Story cutdown", quantity: 8 },
    ],
    priceRangeAED: [10000, 16000],
    priceNote: "Per campaign",
    idealFor: "Brand awareness, product video, event coverage",
    defaultObjective: "awareness",
    bookingType: "campaign",
    budgetSplitWeights: { "Videographer": 0.5, "Editor": 0.3, "Content Creator": 0.2 },
    accentColor: "bg-emerald-500/10",
    accentText: "text-emerald-300",
    accentRing: "ring-emerald-400/25",
  },

  // ── 3. PERFORMANCE ────────────────────────────────────────────────────────
  {
    id: "growth-sprint",
    category: "performance",
    tier: "starter",
    name: "Growth Sprint",
    tagline: "Conversion-led paid social creative",
    emoji: "⚡",
    roles: ["Strategist", "Content Creator", "Copywriter", "Editor"],
    deliverableTemplates: [
      { platform: "Instagram", format: "Ad creative variant", quantity: 5 },
      { platform: "TikTok", format: "Ad creative variant", quantity: 5 },
      { platform: "Cross-Platform", format: "A/B test asset set", quantity: 2 },
    ],
    priceRangeAED: [18000, 30000],
    priceNote: "Per 6-week sprint",
    idealFor: "Paid social campaigns, product launches, app installs",
    defaultObjective: "traffic",
    bookingType: "campaign",
    budgetSplitWeights: { "Strategist": 0.4, "Content Creator": 0.25, "Copywriter": 0.2, "Editor": 0.15 },
    accentColor: "bg-red-500/10",
    accentText: "text-red-300",
    accentRing: "ring-red-400/25",
  },

  // ── 4. SOCIAL PRESENCE ────────────────────────────────────────────────────
  {
    id: "social-pulse",
    category: "social",
    tier: "starter",
    name: "Social Pulse",
    tagline: "Consistent organic social presence",
    emoji: "◉",
    roles: ["Social Media Manager", "Content Creator", "Designer"],
    deliverableTemplates: [
      { platform: "Instagram", format: "Post", quantity: 12 },
      { platform: "TikTok", format: "Video post", quantity: 8 },
    ],
    priceRangeAED: [8000, 14000],
    priceNote: "Per month",
    idealFor: "SMEs, startups, brands entering social for the first time",
    defaultObjective: "engagement",
    bookingType: "retainer",
    budgetSplitWeights: { "Social Media Manager": 0.45, "Content Creator": 0.35, "Designer": 0.2 },
    accentColor: "bg-blue-500/10",
    accentText: "text-blue-300",
    accentRing: "ring-blue-400/25",
  },

  // ── 5. SEASONAL ───────────────────────────────────────────────────────────
  {
    id: "hive-moments",
    category: "seasonal",
    tier: "starter",
    name: "Hive Moments",
    tagline: "Seasonal and cultural campaigns",
    emoji: "☽",
    roles: ["UGC Creator", "Designer", "Copywriter", "Content Creator"],
    deliverableTemplates: [
      { platform: "Instagram", format: "Seasonal themed post", quantity: 6 },
      { platform: "Instagram", format: "Story series", quantity: 10 },
      { platform: "Cross-Platform", format: "Seasonal copy (AR + EN)", quantity: 1 },
    ],
    priceRangeAED: [10000, 18000],
    priceNote: "Fixed seasonal scope",
    idealFor: "SMEs, local brands, first-time seasonal campaigns",
    defaultObjective: "engagement",
    bookingType: "campaign",
    budgetSplitWeights: { "UGC Creator": 0.4, "Designer": 0.3, "Copywriter": 0.2, "Content Creator": 0.1 },
    accentColor: "bg-amber-500/10",
    accentText: "text-amber-300",
    accentRing: "ring-amber-400/25",
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

export const PACKAGE_CATEGORY_META: Record<PackageCategory, { label: string; description: string; emoji: string }> = {
  ugc:         { label: "UGC",         description: "Authentic creator content",          emoji: "✦"  },
  video:       { label: "Video",       description: "Brand storytelling through film",    emoji: "▶"  },
  brand:       { label: "Brand",       description: "Identity and visual systems",        emoji: "◆"  },
  performance: { label: "Performance", description: "Paid social and conversion creative",emoji: "⚡" },
  social:      { label: "Social",      description: "Organic presence and community",     emoji: "◉"  },
  team:        { label: "Team",        description: "Outsourced creative departments",    emoji: "⬡"  },
  seasonal:    { label: "Seasonal",    description: "Seasonal and cultural campaigns",   emoji: "☽"  },
};

export function getPackageById(id: string): PackageConfig | undefined {
  return PACKAGES.find((p) => p.id === id);
}

export function getPackagesByCategory(category: PackageCategory): PackageConfig[] {
  return PACKAGES.filter((p) => p.category === category);
}

export function formatAED(amount: number): string {
  if (amount >= 1000000) return `AED ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `AED ${(amount / 1000).toFixed(0)}K`;
  return `AED ${amount}`;
}

export function getPackagePriceLabel(pkg: PackageConfig): string {
  const [lo, hi] = pkg.priceRangeAED;
  return `${formatAED(lo)} – ${formatAED(hi)}`;
}

/** Compute per-talent budget suggestion from total budget using package weights */
export function suggestBudgetSplit(
  totalBudget: number,
  talentRoles: Array<{ id: string; role: string }>,
  pkg: PackageConfig
): Record<string, number> {
  const result: Record<string, number> = {};
  const roleCounts: Record<string, number> = {};
  for (const t of talentRoles) {
    roleCounts[t.role] = (roleCounts[t.role] || 0) + 1;
  }
  // Assign budget proportionally
  for (const t of talentRoles) {
    const weight = pkg.budgetSplitWeights[t.role] || 1 / talentRoles.length;
    const count = roleCounts[t.role] || 1;
    result[t.id] = Math.round((totalBudget * weight) / count);
  }
  return result;
}
