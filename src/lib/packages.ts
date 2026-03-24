// src/lib/packages.ts
// Creator Hive Package System — Single source of truth

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
  format: string;
  quantity: number;
  notesTemplate?: string;
}

export interface PackageConfig {
  id: string;
  category: PackageCategory;
  tier: PackageTier;
  name: string;
  tagline: string;
  emoji: string;
  roles: TalentCategoryTag[];
  deliverableTemplates: DeliverableTemplate[];
  priceAED: number;                    // fixed public-facing price (no ranges)
  priceNote: string;
  minimumMonths?: number;              // minimum engagement in months
  idealFor: string;
  defaultObjective: CampaignObjective;
  bookingType: "campaign" | "retainer";
  touchpointsPerWeek: number;
  budgetSplitWeights: Record<string, number>;
  accentColor: string;
  accentText: string;
  accentRing: string;
  // kept for backwards compat — derived from priceAED
  priceRangeAED: [number, number];
}

// ── PACKAGE DEFINITIONS ───────────────────────────────────────────────────────

export const PACKAGES: PackageConfig[] = [

  // ── 1. BRAND SPARK — AED 15,000 / month ──────────────────────────────────
  {
    id: "brand-spark",
    category: "brand",
    tier: "starter",
    name: "Brand Spark",
    tagline: "Build your brand foundation from the ground up",
    emoji: "◆",
    roles: ["Content Creator", "Copywriter", "Designer", "Editor"],
    deliverableTemplates: [
      { platform: "Instagram", format: "Static / Carousel", quantity: 4, notesTemplate: "Brand-aligned content pillars" },
      { platform: "Instagram", format: "Short-form Video", quantity: 2, notesTemplate: "15–30s brand or product story" },
      { platform: "Cross-Platform", format: "Copy & Captions", quantity: 1, notesTemplate: "Full month of caption copy AR + EN" },
    ],
    priceAED: 15000,
    priceRangeAED: [15000, 15000],
    priceNote: "AED 15,000 / month · min. 2 months",
    minimumMonths: 2,
    idealFor: "New brands, rebrand projects, launch setup, brand foundation building",
    defaultObjective: "awareness",
    bookingType: "retainer",
    touchpointsPerWeek: 1,
    budgetSplitWeights: {
      "Content Creator": 0.30,
      "Copywriter": 0.20,
      "Designer": 0.30,
      "Editor": 0.20,
    },
    accentColor: "bg-violet-500/10",
    accentText: "text-violet-300",
    accentRing: "ring-violet-400/25",
  },

  // ── 2. GROWTH PULSE — AED 25,000 / month ─────────────────────────────────
  {
    id: "growth-pulse",
    category: "social",
    tier: "starter",
    name: "Growth Pulse",
    tagline: "Your always-on marketing team, fully managed",
    emoji: "◉",
    roles: ["Social Media Manager", "Strategist", "Account Manager", "Designer", "Copywriter", "Editor"],
    deliverableTemplates: [
      { platform: "Instagram", format: "Static / Carousel", quantity: 8, notesTemplate: "Strategist-led content calendar" },
      { platform: "Cross-Platform", format: "Short-form Video", quantity: 4, notesTemplate: "Reels + TikTok native format" },
      { platform: "Cross-Platform", format: "Monthly Performance Report", quantity: 1, notesTemplate: "Reach, engagement, growth metrics" },
    ],
    priceAED: 25000,
    priceRangeAED: [25000, 25000],
    priceNote: "AED 25,000 / month",
    idealFor: "Brands needing a full outsourced social and content team, ongoing brand presence",
    defaultObjective: "engagement",
    bookingType: "retainer",
    touchpointsPerWeek: 2,
    budgetSplitWeights: {
      "Social Media Manager": 0.22,
      "Content Strategist": 0.18,
      "Account Manager": 0.15,
      "Designer": 0.20,
      "Copywriter": 0.13,
      "Editor": 0.12,
    },
    accentColor: "bg-blue-500/10",
    accentText: "text-blue-300",
    accentRing: "ring-blue-400/25",
  },

  // ── 3. CAMPAIGN SPRINT — AED 45,000 / month ──────────────────────────────
  {
    id: "campaign-sprint",
    category: "performance",
    tier: "elite",
    name: "Campaign Sprint",
    tagline: "Premium campaign execution for major brand moments",
    emoji: "⚡",
    roles: ["Strategist", "Account Manager", "Talent Manager", "Producer", "Videographer", "Photographer", "Editor", "Designer", "Copywriter"],
    deliverableTemplates: [
      { platform: "Cross-Platform", format: "Hero Reel", quantity: 1, notesTemplate: "Full production day — brand film or campaign hero" },
      { platform: "Cross-Platform", format: "Short-form Cutdown", quantity: 5, notesTemplate: "4–6 cutdowns from hero reel for social distribution" },
      { platform: "Instagram", format: "Static / Carousel", quantity: 5, notesTemplate: "4–5 campaign statics" },
      { platform: "Cross-Platform", format: "Production Day", quantity: 1, notesTemplate: "1 full production day included" },
    ],
    priceAED: 45000,
    priceRangeAED: [45000, 45000],
    priceNote: "AED 45,000 / month",
    idealFor: "Product launches, seasonal campaigns, brand moments, major campaign executions",
    defaultObjective: "conversions",
    bookingType: "campaign",
    touchpointsPerWeek: 2,
    budgetSplitWeights: {
      "Strategist": 0.15,
      "Account Manager": 0.10,
      "Talent Manager": 0.08,
      "Producer": 0.12,
      "Videographer": 0.18,
      "Photographer": 0.12,
      "Editor": 0.10,
      "Designer": 0.08,
      "Copywriter": 0.07,
    },
    accentColor: "bg-amber-500/10",
    accentText: "text-amber-300",
    accentRing: "ring-amber-400/25",
  },

  // ── 4. UGC SPARK (preserved) ──────────────────────────────────────────────
  {
    id: "ugc-spark",
    category: "ugc",
    tier: "starter",
    name: "UGC Spark",
    tagline: "Authentic product content for DTC brands",
    emoji: "✦",
    roles: ["UGC Creator", "UGC Creator", "Editor"],
    deliverableTemplates: [
      { platform: "TikTok",    format: "Short-form Video", quantity: 4, notesTemplate: "15–30s authentic product demo" },
      { platform: "Instagram", format: "Reel",             quantity: 4, notesTemplate: "Repurposed from TikTok with native caption" },
      { platform: "Instagram", format: "Static Post",      quantity: 8, notesTemplate: "Lifestyle product shots" },
    ],
    priceAED: 15000,
    priceRangeAED: [12000, 18000],
    priceNote: "Per campaign (4 weeks)",
    idealFor: "DTC product launches, e-commerce, F&B, beauty",
    defaultObjective: "awareness",
    bookingType: "campaign",
    touchpointsPerWeek: 1,
    budgetSplitWeights: { "UGC Creator": 0.45, "Editor": 0.1 },
    accentColor: "bg-emerald-500/10",
    accentText: "text-emerald-300",
    accentRing: "ring-emerald-400/25",
  },

  // ── 5. HIVE MOMENTS (preserved) ──────────────────────────────────────────
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
    priceAED: 14000,
    priceRangeAED: [10000, 18000],
    priceNote: "Fixed seasonal scope",
    idealFor: "SMEs, local brands, first-time seasonal campaigns",
    defaultObjective: "engagement",
    bookingType: "campaign",
    touchpointsPerWeek: 1,
    budgetSplitWeights: { "UGC Creator": 0.4, "Designer": 0.3, "Copywriter": 0.2, "Content Creator": 0.1 },
    accentColor: "bg-rose-500/10",
    accentText: "text-rose-300",
    accentRing: "ring-rose-400/25",
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
  return `AED ${amount.toLocaleString()}`;
}

/** Returns the fixed public-facing price label for a package */
export function getPackagePriceLabel(pkg: PackageConfig): string {
  return formatAED(pkg.priceAED);
}

/** Returns price label with cadence note */
export function getPackagePriceDisplay(pkg: PackageConfig): string {
  return `${formatAED(pkg.priceAED)} / mo`;
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
  for (const t of talentRoles) {
    const weight = pkg.budgetSplitWeights[t.role] || 1 / talentRoles.length;
    const count = roleCounts[t.role] || 1;
    result[t.id] = Math.round((totalBudget * weight) / count);
  }
  return result;
}
