// src/lib/pricing.ts
// Creator Hive — Single source of truth for all pricing logic
// All figures in AED. Internal costs are never exposed to clients.

// ── RETAINER ROLE TIERS ───────────────────────────────────────────────────────

export type RetainerTier = "select" | "signature";

export interface RetainerRolePricing {
  role: string;
  external: Record<RetainerTier, number>; // client-facing price
  internal: Record<RetainerTier, number>; // talent-facing cost (24% markup baked in)
  touchpointsPerWeek: number;             // client engagement rule
  markupPct: number;                      // markup percentage for reference
}

// Retainer roles with corrected internal/external pricing
// External = internal × 1.24 (24% markup)
// Select:    AED 6,450 internal → AED 8,000 external
// Signature: AED 12,100 internal → AED 15,000 external
export const RETAINER_ROLE_PRICING: RetainerRolePricing[] = [
  {
    role: "Social Media Manager",
    external: { select: 8000, signature: 15000 },
    internal: { select: 6450, signature: 12100 },
    touchpointsPerWeek: 2,
    markupPct: 24,
  },
  {
    role: "Content Strategist",
    external: { select: 8000, signature: 15000 },
    internal: { select: 6450, signature: 12100 },
    touchpointsPerWeek: 2,
    markupPct: 24,
  },
  {
    role: "Account Manager",
    external: { select: 8000, signature: 15000 },
    internal: { select: 6450, signature: 12100 },
    touchpointsPerWeek: 2,
    markupPct: 24,
  },
  {
    role: "Project Manager",
    external: { select: 8000, signature: 15000 },
    internal: { select: 6450, signature: 12100 },
    touchpointsPerWeek: 2,
    markupPct: 24,
  },
  {
    role: "Talent Manager",
    external: { select: 8000, signature: 15000 },
    internal: { select: 6450, signature: 12100 },
    touchpointsPerWeek: 2,
    markupPct: 24,
  },
];

// Lookup by role name
export const RETAINER_PRICING_MAP = new Map<string, RetainerRolePricing>(
  RETAINER_ROLE_PRICING.map((r) => [r.role, r])
);

// Role names that use retainer pricing
export const RETAINER_ROLE_NAMES = new Set(RETAINER_ROLE_PRICING.map((r) => r.role));

// ── HELPERS ───────────────────────────────────────────────────────────────────

/** Returns the external (client-facing) price for a retainer role and tier */
export function getRetainerExternalPrice(role: string, tier: RetainerTier): number | null {
  return RETAINER_PRICING_MAP.get(role)?.external[tier] ?? null;
}

/** Returns the internal (talent-facing) cost for a retainer role and tier */
export function getRetainerInternalCost(role: string, tier: RetainerTier): number | null {
  return RETAINER_PRICING_MAP.get(role)?.internal[tier] ?? null;
}

/** Returns true if a role uses retainer pricing */
export function isRetainerRole(role: string): boolean {
  return RETAINER_ROLE_NAMES.has(role);
}

/** Returns touchpoints per week for a retainer role */
export function getRetainerTouchpoints(role: string): number {
  return RETAINER_PRICING_MAP.get(role)?.touchpointsPerWeek ?? 2;
}

/** Formats AED amount for display */
export function formatAED(amount: number): string {
  if (amount >= 1000000) return `AED ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `AED ${(amount / 1000).toFixed(0)}K`;
  return `AED ${amount.toLocaleString()}`;
}

/** Returns a human-readable price label for a retainer role */
export function getRetainerPriceLabel(role: string): string {
  const pricing = RETAINER_PRICING_MAP.get(role);
  if (!pricing) return "—";
  return `${formatAED(pricing.external.select)} – ${formatAED(pricing.external.signature)} / mo`;
}

// ── GROSS MARGIN ──────────────────────────────────────────────────────────────

/** Calculates gross margin for a retainer booking */
export function calcRetainerMargin(role: string, tier: RetainerTier): {
  external: number;
  internal: number;
  margin: number;
  marginPct: number;
} | null {
  const pricing = RETAINER_PRICING_MAP.get(role);
  if (!pricing) return null;
  const external = pricing.external[tier];
  const internal = pricing.internal[tier];
  const margin = external - internal;
  const marginPct = Math.round((margin / external) * 100);
  return { external, internal, margin, marginPct };
}
