/** Compact studio strip — maps DB statuses to display stages. */
import type { CreatorShopProjectStatus } from "@prisma/client";

export const STUDIO_PIPELINE: readonly { short: string; statuses: readonly CreatorShopProjectStatus[] }[] = [
  { short: "Draft", statuses: ["DRAFT"] },
  { short: "Submitted", statuses: ["SUBMITTED"] },
  { short: "Review", statuses: ["UNDER_REVIEW", "QUALIFIED"] },
  { short: "Team", statuses: ["TEAM_ASSEMBLING"] },
  { short: "Build", statuses: ["IN_BUILD"] },
  { short: "Launch", statuses: ["LAUNCH_READY"] },
  { short: "Live", statuses: ["LIVE"] },
  { short: "Scale", statuses: ["SCALING"] },
] as const;

export function studioStageIndex(status: CreatorShopProjectStatus): number {
  const i = STUDIO_PIPELINE.findIndex((s) => s.statuses.includes(status));
  return i >= 0 ? i : 0;
}
