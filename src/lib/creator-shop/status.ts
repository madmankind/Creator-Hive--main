import type { CreatorShopProjectStatus } from "@prisma/client";

const LABELS: Record<CreatorShopProjectStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  QUALIFIED: "Qualified",
  TEAM_ASSEMBLING: "Team assembling",
  IN_BUILD: "In build",
  LAUNCH_READY: "Launch ready",
  LIVE: "Live",
  SCALING: "Scaling",
};

export function creatorShopStatusLabel(s: CreatorShopProjectStatus): string {
  return LABELS[s] ?? s;
}

export const CREATOR_SHOP_STATUS_ORDER: CreatorShopProjectStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUALIFIED",
  "TEAM_ASSEMBLING",
  "IN_BUILD",
  "LAUNCH_READY",
  "LIVE",
  "SCALING",
];
