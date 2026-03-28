// src/lib/packages.ts
// Creator Hive Package System — Single source of truth

import type { TalentCategoryTag } from "./curatedTalent";

export type PackageCategory =
  | "ugc"
  | "ugc-stills"
  | "social"
  | "build"
  | "growth"
  | "brand"
  | "performance"
  | "video"
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
  description: string;             // card body copy — what it's for, who it suits
  cardDeliverableLine: string;     // compact deliverable summary for card display
  emoji: string;
  roles: TalentCategoryTag[];
  deliverableTemplates: DeliverableTemplate[];
  priceAED: number;
  priceNote: string;
  minimumMonths?: number;
  idealFor: string;
  defaultObjective: CampaignObjective;
  bookingType: "campaign" | "retainer";
  bookingModel?: "content" | "build"; // distinguishes content packages from build sprints
  touchpointsPerWeek: number;
  budgetSplitWeights: Record<string, number>;
  accentColor: string;
  accentText: string;
  accentRing: string;
  priceRangeAED: [number, number]; // backwards compat
}

// ── PACKAGE DEFINITIONS ───────────────────────────────────────────────────────
// 5 curated packages — entry to flagship, content to build

export const PACKAGES: PackageConfig[] = [

  // ── 1. UGC SPARK — entry ─────────────────────────────────────────────────
  {
    id: "ugc-spark",
    category: "ugc",
    tier: "starter",
    name: "UGC Spark",
    tagline: "Creator-led short-form content. No production team required.",
    description: "For DTC, F&B, beauty, and consumer brands that need steady short-form output without a full production setup. Creator-shot, edited, and delivery-ready every month.",
    cardDeliverableLine: "12x Short-form UGC Videos",
    emoji: "✦",
    roles: ["UGC Creator", "Editor"],
    deliverableTemplates: [
      { platform: "TikTok", format: "Short-form UGC Video", quantity: 12, notesTemplate: "Up to 45–60s, creator-shot on phone, edited and delivery-ready" },
    ],
    priceAED: 12000,
    priceRangeAED: [12000, 12000],
    priceNote: "~$3.3K / month · USD (approx.)",
    idealFor: "DTC brands, F&B, beauty, consumer brands, founder-led brands",
    defaultObjective: "awareness",
    bookingType: "retainer",
    bookingModel: "content",
    touchpointsPerWeek: 1,
    budgetSplitWeights: { "UGC Creator": 0.70, "Editor": 0.30 },
    accentColor: "bg-violet-500/10",
    accentText: "text-violet-300",
    accentRing: "ring-violet-400/25",
  },

  // ── 2. UGC + STILLS ───────────────────────────────────────────────────────
  {
    id: "ugc-stills",
    category: "ugc-stills",
    tier: "starter",
    name: "UGC + Stills",
    tagline: "Short-form creator content plus polished static assets.",
    description: "For brands building both feed presence and recurring creator content. Adds photography without becoming a full managed social retainer — production-led, not management-led.",
    cardDeliverableLine: "10x Short-form UGC Videos · 12x Edited Static Images",
    emoji: "◈",
    roles: ["UGC Creator", "Photographer", "Editor"],
    deliverableTemplates: [
      { platform: "Cross-Platform", format: "Short-form UGC Video", quantity: 10, notesTemplate: "Up to 45–60s, creator-shot, edited and delivery-ready" },
      { platform: "Instagram", format: "Edited Static Image", quantity: 12, notesTemplate: "Photography-directed, post-produced, brand-aligned" },
    ],
    priceAED: 16000,
    priceRangeAED: [16000, 16000],
    priceNote: "~$4.4K / month · USD (approx.)",
    idealFor: "Brands building feed presence alongside ongoing creator content",
    defaultObjective: "awareness",
    bookingType: "retainer",
    bookingModel: "content",
    touchpointsPerWeek: 1,
    budgetSplitWeights: { "UGC Creator": 0.45, "Photographer": 0.35, "Editor": 0.20 },
    accentColor: "bg-emerald-500/10",
    accentText: "text-emerald-300",
    accentRing: "ring-emerald-400/25",
  },

  // ── 3. SOCIAL PULSE ───────────────────────────────────────────────────────
  {
    id: "social-pulse",
    category: "social",
    tier: "starter",
    name: "Social Pulse",
    tagline: "Monthly content production plus hands-on social execution.",
    description: "For SMEs, hospitality, retail, clinics, and lifestyle brands that need consistent monthly presence with actual account management. Content production plus posting, calendar, and reporting.",
    cardDeliverableLine: "12x Short-form Videos · 2x Camera-shot Reels · 8x Static Images · Social Media Management",
    emoji: "◉",
    roles: ["UGC Creator", "Photographer", "Videographer", "Social Media Manager", "Editor"],
    deliverableTemplates: [
      { platform: "Cross-Platform", format: "Short-form Video", quantity: 12 },
      { platform: "Instagram", format: "Camera-shot Reel", quantity: 2, notesTemplate: "Videographer-produced, brand-directed" },
      { platform: "Instagram", format: "Edited Static Image", quantity: 8 },
      { platform: "Cross-Platform", format: "Monthly Content Calendar", quantity: 1 },
      { platform: "Cross-Platform", format: "Monthly Performance Report", quantity: 1 },
    ],
    priceAED: 25000,
    priceRangeAED: [25000, 25000],
    priceNote: "~$6.8K / month · retainer · USD (approx.)",
    idealFor: "SMEs, hospitality, retail, clinics, lifestyle brands",
    defaultObjective: "engagement",
    bookingType: "retainer",
    bookingModel: "content",
    touchpointsPerWeek: 2,
    budgetSplitWeights: {
      "UGC Creator": 0.22,
      "Photographer": 0.15,
      "Videographer": 0.20,
      "Social Media Manager": 0.28,
      "Editor": 0.15,
    },
    accentColor: "bg-blue-500/10",
    accentText: "text-blue-300",
    accentRing: "ring-blue-400/25",
  },

  // ── 4. BUILD STACK ────────────────────────────────────────────────────────
  {
    id: "build-stack",
    category: "build",
    tier: "starter",
    name: "Build Stack",
    tagline: "Modular design & dev sprints — scope follows your roadmap.",
    description: "For brands shipping or evolving a digital product surface. Each sprint bundles UI/UX, build, QA, and release support — priced from a clear floor and scaled to your modules, not a generic content retainer.",
    cardDeliverableLine: "1x Active Build Sprint · Up to 5 Pages or 2 Feature Modules · QA & Deployment Support",
    emoji: "⬡",
    roles: ["Designer", "Other"],
    deliverableTemplates: [
      { platform: "Cross-Platform", format: "Active Build Sprint", quantity: 1 },
      { platform: "Cross-Platform", format: "Pages Designed / Developed", quantity: 5, notesTemplate: "Up to 5 core pages, or up to 2 feature modules" },
      { platform: "Cross-Platform", format: "QA, Deployment & Sprint Review", quantity: 1 },
    ],
    priceAED: 10000,
    priceRangeAED: [10000, 100000],
    priceNote: "From ~$2.7K / sprint · scales with scope · USD (approx.)",
    idealFor: "Brands building websites, apps, or digital product features",
    defaultObjective: "conversions",
    bookingType: "retainer",
    bookingModel: "build",
    touchpointsPerWeek: 1,
    budgetSplitWeights: { "Designer": 0.45, "Other": 0.55 },
    accentColor: "bg-slate-500/10",
    accentText: "text-slate-300",
    accentRing: "ring-slate-400/25",
  },

  // ── 5. GROWTH POD — flagship ──────────────────────────────────────────────
  {
    id: "growth-pod",
    category: "growth",
    tier: "elite",
    name: "Growth Pod",
    tagline: "Flagship monthly team — strategy, production, and social in one pod.",
    description: "For brands that need stronger output and strategic oversight. Strategy, production, social management, and operational consistency — a complete outsourced content team.",
    cardDeliverableLine: "16x Short-form Videos · 4x Camera-shot Reels · 12x Static Images · Strategy & Full Social Media Management",
    emoji: "⬡",
    roles: ["UGC Creator", "Photographer", "Videographer", "Social Media Manager", "Strategist", "Editor"],
    deliverableTemplates: [
      { platform: "Cross-Platform", format: "Short-form Video", quantity: 16 },
      { platform: "Cross-Platform", format: "Camera-shot Reel", quantity: 4, notesTemplate: "Videographer-produced, brand-directed" },
      { platform: "Instagram", format: "Edited Static Image", quantity: 12 },
      { platform: "Cross-Platform", format: "Monthly Content Calendar", quantity: 1 },
      { platform: "Cross-Platform", format: "Monthly Reporting Pack", quantity: 1 },
    ],
    priceAED: 45000,
    priceRangeAED: [45000, 45000],
    priceNote: "~$12.3K / month · retainer · USD (approx.)",
    idealFor: "Brands needing full content output, strategy, and social management",
    defaultObjective: "engagement",
    bookingType: "retainer",
    bookingModel: "content",
    touchpointsPerWeek: 2,
    budgetSplitWeights: {
      "UGC Creator": 0.18,
      "Photographer": 0.12,
      "Videographer": 0.20,
      "Social Media Manager": 0.22,
      "Strategist": 0.15,
      "Editor": 0.13,
    },
    accentColor: "bg-amber-500/10",
    accentText: "text-amber-300",
    accentRing: "ring-amber-400/25",
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

export const PACKAGE_CATEGORY_META: Record<PackageCategory, { label: string; description: string; emoji: string }> = {
  ugc:         { label: "UGC Spark",    description: "Creator-led short-form content",        emoji: "✦"  },
  "ugc-stills":{ label: "UGC + Stills", description: "Creator content plus polished statics", emoji: "◈"  },
  social:      { label: "Social Pulse", description: "Content production and social management", emoji: "◉" },
  build:       { label: "Build Stack",  description: "Design and development sprint",          emoji: "⬡"  },
  growth:      { label: "Growth Pod",   description: "Full outsourced content and strategy team", emoji: "⬡" },
  brand:       { label: "Brand",        description: "Identity and visual systems",            emoji: "◆"  },
  performance: { label: "Performance",  description: "Paid social and conversion creative",    emoji: "⚡" },
  video:       { label: "Video",        description: "Brand storytelling through film",        emoji: "▶"  },
  team:        { label: "Team",         description: "Outsourced creative departments",        emoji: "⬡"  },
  seasonal:    { label: "Seasonal",     description: "Seasonal and cultural campaigns",        emoji: "☽"  },
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

/** Approximate AED→USD for public display (billing may still reference AED internally). */
const AED_PER_USD = 3.6725;

export function aedToUsdApprox(aed: number): number {
  return Math.round(aed / AED_PER_USD);
}

/** Compact USD label e.g. ~$6.8K */
export function formatUsdApproxK(usd: number): string {
  const k = usd / 1000;
  const t = k >= 10 ? k.toFixed(0) : k % 1 === 0 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, "");
  return `~$${t}K`;
}

/** Returns the fixed public-facing price label for a package (USD standard) */
export function getPackagePriceLabel(pkg: PackageConfig): string {
  if (pkg.bookingModel === "build" && pkg.id === "build-stack") {
    const lo = formatUsdApproxK(aedToUsdApprox(pkg.priceRangeAED[0]));
    return `From ${lo} / sprint`;
  }
  return `${formatUsdApproxK(aedToUsdApprox(pkg.priceAED))} / mo`;
}

/** Returns price label with cadence note */
export function getPackagePriceDisplay(pkg: PackageConfig): string {
  return `${formatUsdApproxK(aedToUsdApprox(pkg.priceAED))} / mo`;
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
