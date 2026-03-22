/**
 * Creator-led brand journey — Build surface: stages + one-line blurbs (not a heavy process map).
 */
export const BUILD_JOURNEY = ["Research", "Define", "Design", "Execute", "Scale"] as const;

export const BUILD_STAGE_LINES: readonly { label: (typeof BUILD_JOURNEY)[number]; line: string }[] = [
  { label: "Research", line: "Market read, opportunity, audience fit" },
  { label: "Define", line: "Concept, positioning, assortment" },
  { label: "Design", line: "Creative, packaging, prototype" },
  { label: "Execute", line: "Production, rails, launch" },
  { label: "Scale", line: "Iterate, channels, growth" },
];

export const BUILD_CAPABILITIES = [
  { id: "apparel", label: "Apparel capsule" },
  { id: "beauty", label: "Beauty SKU" },
  { id: "lifestyle", label: "Lifestyle object" },
  { id: "merch", label: "Creator merch" },
  { id: "limited", label: "Limited drop" },
  { id: "bundle", label: "Digital + physical bundle" },
] as const;
