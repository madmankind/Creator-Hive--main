import type { CreatorShopProjectMode } from "@prisma/client";

export type RecommendedPod = {
  podLabel: string;
  roles: string[];
  footnote: string;
};

export function recommendCreatorShopPod(productType: string, mode: CreatorShopProjectMode): RecommendedPod {
  const t = productType.toLowerCase();

  if (t.includes("merch") || t === "merch") {
    return {
      podLabel: "Merch & drops",
      roles: [
        "Brand designer",
        "Merch / product designer",
        "Storefront builder",
        "Content lead",
        "Growth operator",
      ],
      footnote: "Typical pod for apparel, accessories, and limited drops.",
    };
  }

  if (t.includes("digital")) {
    return {
      podLabel: "Digital product & funnel",
      roles: ["Strategist", "Copywriter", "Designer", "Storefront / funnel builder", "Launch editor / content lead"],
      footnote: "Built for templates, courses, downloads, and digital bundles.",
    };
  }

  if (t.includes("physical")) {
    return {
      podLabel: "Physical product & ecommerce",
      roles: [
        "Brand strategist",
        "Packaging / product designer",
        "Sourcing & ops lead",
        "Ecommerce operator",
        "Growth / content lead",
      ],
      footnote: "Covers packaging, sourcing touchpoints, and store operations.",
    };
  }

  if (t.includes("membership") || t.includes("subscription")) {
    return {
      podLabel: "Membership & retention",
      roles: ["Offer strategist", "Community / content lead", "Designer", "Storefront builder", "Lifecycle growth"],
      footnote: "Focused on recurring value, onboarding, and retention loops.",
    };
  }

  if (t.includes("productized")) {
    return {
      podLabel: "Productized service",
      roles: ["Positioning strategist", "Offer & pricing", "Designer", "Systems / funnel builder", "Outbound & content"],
      footnote: "For packaged services sold like a product.",
    };
  }

  if (mode === "GROW") {
    return {
      podLabel: "Growth & optimization",
      roles: ["Growth strategist", "Store CRO", "Brand / creative", "Content lead", "Paid growth (optional)"],
      footnote: "Tuned for scaling an existing creator-led product.",
    };
  }

  return {
    podLabel: "Core launch pod",
    roles: ["Strategist", "Creative lead", "Builder", "Content", "Growth"],
    footnote: "Roles are refined after your brief is reviewed.",
  };
}
