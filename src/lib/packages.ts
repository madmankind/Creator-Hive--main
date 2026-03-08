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
  {
    id: "ugc-command",
    category: "ugc",
    tier: "elite",
    name: "UGC Command",
    tagline: "Sustained UGC programmes at scale",
    emoji: "✦✦",
    roles: ["UGC Creator", "UGC Creator", "Content Creator", "Videographer", "Editor", "Social Media Manager"],
    deliverableTemplates: [
      { platform: "TikTok", format: "Short-form video", quantity: 6 },
      { platform: "Instagram", format: "Reel", quantity: 6 },
      { platform: "Instagram", format: "Static Post", quantity: 12 },
      { platform: "Instagram", format: "Story set", quantity: 3 },
    ],
    priceRangeAED: [28000, 45000],
    priceNote: "Per month (retainer)",
    idealFor: "Sustained UGC programmes, retainer-based brands",
    defaultObjective: "engagement",
    bookingType: "retainer",
    budgetSplitWeights: { "UGC Creator": 0.35, "Content Creator": 0.2, "Videographer": 0.2, "Editor": 0.15, "Social Media Manager": 0.1 },
    accentColor: "bg-violet-500/15",
    accentText: "text-violet-200",
    accentRing: "ring-violet-400/35",
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
  {
    id: "hive-reel-pro",
    category: "video",
    tier: "elite",
    name: "Hive Reel Pro",
    tagline: "Full-production hero content",
    emoji: "▶▶",
    roles: ["Videographer", "Producer", "Editor", "Photographer", "Content Creator", "Copywriter"],
    deliverableTemplates: [
      { platform: "YouTube", format: "Hero video (2–4 min)", quantity: 2 },
      { platform: "Instagram", format: "Short edit cutdown", quantity: 6 },
      { platform: "Cross-Platform", format: "Full photo set", quantity: 30 },
    ],
    priceRangeAED: [35000, 65000],
    priceNote: "Per campaign",
    idealFor: "Product launches, brand films, campaign hero content",
    defaultObjective: "awareness",
    bookingType: "campaign",
    budgetSplitWeights: { "Videographer": 0.3, "Producer": 0.25, "Editor": 0.2, "Photographer": 0.15, "Content Creator": 0.05, "Copywriter": 0.05 },
    accentColor: "bg-emerald-500/15",
    accentText: "text-emerald-200",
    accentRing: "ring-emerald-400/35",
  },

  // ── 3. BRAND ──────────────────────────────────────────────────────────────
  {
    id: "brand-seed",
    category: "brand",
    tier: "starter",
    name: "Brand Seed",
    tagline: "Identity and launch assets for new brands",
    emoji: "◆",
    roles: ["Designer", "Copywriter", "Photographer"],
    deliverableTemplates: [
      { platform: "Cross-Platform", format: "Brand identity system", quantity: 1 },
      { platform: "Instagram", format: "Social media template set", quantity: 10 },
    ],
    priceRangeAED: [15000, 25000],
    priceNote: "Fixed project",
    idealFor: "Early-stage brands, product rebrands, market entry",
    defaultObjective: "awareness",
    bookingType: "campaign",
    budgetSplitWeights: { "Designer": 0.55, "Copywriter": 0.25, "Photographer": 0.2 },
    accentColor: "bg-amber-500/10",
    accentText: "text-amber-300",
    accentRing: "ring-amber-400/25",
  },
  {
    id: "brand-signature",
    category: "brand",
    tier: "elite",
    name: "Brand Signature",
    tagline: "Full brand system for premium positioning",
    emoji: "◆◆",
    roles: ["Designer", "Strategist", "Copywriter", "Photographer", "Videographer"],
    deliverableTemplates: [
      { platform: "Cross-Platform", format: "Full brand identity system", quantity: 1 },
      { platform: "YouTube", format: "Brand film (90s)", quantity: 1 },
      { platform: "Cross-Platform", format: "Campaign toolkit (50+ assets)", quantity: 1 },
    ],
    priceRangeAED: [60000, 120000],
    priceNote: "Fixed project",
    idealFor: "Premium brand launches, luxury positioning, Series A+",
    defaultObjective: "awareness",
    bookingType: "campaign",
    budgetSplitWeights: { "Designer": 0.35, "Strategist": 0.2, "Videographer": 0.2, "Photographer": 0.15, "Copywriter": 0.1 },
    accentColor: "bg-amber-500/15",
    accentText: "text-amber-200",
    accentRing: "ring-amber-400/35",
  },

  // ── 4. PERFORMANCE ────────────────────────────────────────────────────────
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
  {
    id: "performance-command",
    category: "performance",
    tier: "elite",
    name: "Performance Command",
    tagline: "Always-on performance programme",
    emoji: "⚡⚡",
    roles: ["Strategist", "Content Creator", "Content Creator", "Videographer", "Copywriter", "Designer", "Social Media Manager"],
    deliverableTemplates: [
      { platform: "Instagram", format: "Ad creative (static + video)", quantity: 10 },
      { platform: "TikTok", format: "Ad creative", quantity: 10 },
      { platform: "Cross-Platform", format: "Retargeting creative set", quantity: 1 },
    ],
    priceRangeAED: [55000, 90000],
    priceNote: "Per month (retainer)",
    idealFor: "Always-on performance programmes, scale-stage companies",
    defaultObjective: "conversions",
    bookingType: "retainer",
    budgetSplitWeights: { "Strategist": 0.3, "Content Creator": 0.25, "Videographer": 0.15, "Copywriter": 0.1, "Designer": 0.1, "Social Media Manager": 0.1 },
    accentColor: "bg-red-500/15",
    accentText: "text-red-200",
    accentRing: "ring-red-400/35",
  },

  // ── 5. SOCIAL ─────────────────────────────────────────────────────────────
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
  {
    id: "social-dominance",
    category: "social",
    tier: "elite",
    name: "Social Dominance",
    tagline: "Multi-platform dominance at scale",
    emoji: "◉◉",
    roles: ["Social Media Manager", "Content Creator", "Content Creator", "Videographer", "Designer", "Copywriter", "Strategist"],
    deliverableTemplates: [
      { platform: "Instagram", format: "Post", quantity: 20 },
      { platform: "TikTok", format: "Video", quantity: 12 },
      { platform: "Instagram", format: "Reel", quantity: 4 },
      { platform: "YouTube", format: "Short", quantity: 4 },
    ],
    priceRangeAED: [25000, 45000],
    priceNote: "Per month",
    idealFor: "Growing brands, Series A+, regional market dominance",
    defaultObjective: "engagement",
    bookingType: "retainer",
    budgetSplitWeights: { "Social Media Manager": 0.25, "Content Creator": 0.25, "Videographer": 0.2, "Designer": 0.15, "Copywriter": 0.1, "Strategist": 0.05 },
    accentColor: "bg-blue-500/15",
    accentText: "text-blue-200",
    accentRing: "ring-blue-400/35",
  },

  // ── 6. TEAM ───────────────────────────────────────────────────────────────
  {
    id: "sme-team",
    category: "team",
    tier: "starter",
    name: "SME Marketing Team",
    tagline: "Outsourced creative department for SMEs",
    emoji: "⬡",
    roles: ["Strategist", "Content Creator", "Designer", "Social Media Manager", "Copywriter"],
    deliverableTemplates: [
      { platform: "Cross-Platform", format: "Monthly content package", quantity: 30 },
      { platform: "Cross-Platform", format: "Strategy session", quantity: 1 },
    ],
    priceRangeAED: [30000, 50000],
    priceNote: "Per month",
    idealFor: "SMEs without in-house marketing, regional expansion brands",
    defaultObjective: "awareness",
    bookingType: "retainer",
    budgetSplitWeights: { "Strategist": 0.3, "Content Creator": 0.25, "Designer": 0.2, "Social Media Manager": 0.15, "Copywriter": 0.1 },
    accentColor: "bg-slate-500/10",
    accentText: "text-slate-300",
    accentRing: "ring-slate-400/25",
  },
  {
    id: "enterprise-studio",
    category: "team",
    tier: "elite",
    name: "Enterprise Studio",
    tagline: "Full creative studio embedded in your brand",
    emoji: "⬡⬡",
    roles: ["Strategist", "Content Creator", "Content Creator", "Videographer", "Photographer", "Designer", "Copywriter", "Social Media Manager", "Producer"],
    deliverableTemplates: [
      { platform: "Cross-Platform", format: "Monthly content programme (60+ pieces)", quantity: 1 },
      { platform: "Cross-Platform", format: "Production shoot", quantity: 1 },
    ],
    priceRangeAED: [100000, 200000],
    priceNote: "Monthly retainer (custom scoped)",
    idealFor: "Enterprise brands, holding companies, scale-stage operations",
    defaultObjective: "conversions",
    bookingType: "retainer",
    budgetSplitWeights: { "Strategist": 0.2, "Content Creator": 0.2, "Videographer": 0.15, "Producer": 0.15, "Photographer": 0.1, "Designer": 0.1, "Social Media Manager": 0.05, "Copywriter": 0.05 },
    accentColor: "bg-slate-500/15",
    accentText: "text-slate-200",
    accentRing: "ring-slate-400/35",
  },

  // ── 7. SEASONAL ───────────────────────────────────────────────────────────
  {
    id: "hive-moments",
    category: "seasonal",
    tier: "starter",
    name: "Hive Moments",
    tagline: "Ramadan & National Day campaigns",
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
  {
    id: "hive-moments-elite",
    category: "seasonal",
    tier: "elite",
    name: "Hive Moments Elite",
    tagline: "Arabic-first hero campaigns for Gulf markets",
    emoji: "☽✦",
    roles: ["Content Creator", "Content Creator", "Videographer", "Designer", "Strategist", "Copywriter", "Influencer"],
    deliverableTemplates: [
      { platform: "YouTube", format: "Hero brand film (60s, AR+EN)", quantity: 1 },
      { platform: "Instagram", format: "Seasonal post", quantity: 10 },
      { platform: "TikTok", format: "Influencer collab content", quantity: 3 },
      { platform: "Cross-Platform", format: "Paid media creative set", quantity: 1 },
    ],
    priceRangeAED: [45000, 85000],
    priceNote: "Fixed seasonal scope",
    idealFor: "Regional retailers, FMCG brands, hospitality and F&B",
    defaultObjective: "awareness",
    bookingType: "campaign",
    budgetSplitWeights: { "Content Creator": 0.25, "Videographer": 0.2, "Influencer": 0.2, "Strategist": 0.15, "Designer": 0.1, "Copywriter": 0.1 },
    accentColor: "bg-amber-500/15",
    accentText: "text-amber-200",
    accentRing: "ring-amber-400/35",
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
  seasonal:    { label: "Seasonal",    description: "Ramadan & National Day campaigns",   emoji: "☽"  },
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
