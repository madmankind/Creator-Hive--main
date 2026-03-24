import type { CuratedTalent } from "@/lib/curatedTalent";

export type FitLabel = "Perfect" | "Good" | "Low";

export interface FitResult {
  score: number;
  label: FitLabel;
  reasons?: string[];
}

const SCORE_CAP = 10;

/**
 * Simple fit scoring from briefDraft vs talent.
 * Returns { score, label } — label is informational only.
 */
export function computeFitScore(
  talent: CuratedTalent,
  briefDraft: {
    roles?: string[];
    outputs?: string[];
    platforms?: string[];
    industry?: string | null;
    market?: string | null;
    language?: string | null;
  }
): FitResult {
  let score = 0;
  const roles = briefDraft.roles ?? [];
  const outputs = briefDraft.outputs ?? [];
  const platforms = briefDraft.platforms ?? [];
  const industry = briefDraft.industry ?? null;
  const market = briefDraft.market ?? null;
  const language = briefDraft.language ?? null;

  // Role match: +3 if talent has one of selected roles
  const talentRoles = [
    talent.primaryRole ?? talent.roleTags?.[0],
    ...(talent.roleTags ?? []),
  ].filter(Boolean);
  if (roles.length > 0 && talentRoles.some((r) => roles.includes(r as string))) {
    score += 3;
  }

  // Output match: +2 if talent tags overlap outputs
  const outputMap: Record<string, string[]> = {
    "UGC": ["UGC Creator", "Content Creator"],
    "Edited video": ["Videographer", "Editor"],
    "Photo shoot": ["Photographer"],
    "Social management": ["Social Media Manager"],
    "Design": ["Designer"],
    "Performance": ["Influencer"],
    "Web build": ["Designer"],
  };
  const talentRoleStrings = talentRoles.join(" ").toLowerCase();
  for (const out of outputs) {
    const mapped = outputMap[out] ?? [out];
    if (mapped.some((m) => talentRoleStrings.includes(m.toLowerCase()))) {
      score += 2;
      break;
    }
  }

  // Platform match: +1 per overlap (cap 2)
  const talentPlatforms = (talent.platformTags ?? []).map((p) => p.toLowerCase());
  const platformOverlaps = platforms.filter((p) =>
    talentPlatforms.includes(p.toLowerCase())
  ).length;
  score += Math.min(2, platformOverlaps);

  // Industry match: +2
  const talentIndustries = (talent as { industries?: string[] }).industries ?? [];
  if (industry && talentIndustries.some((i) => i.toLowerCase() === industry.toLowerCase())) {
    score += 2;
  }

  // Market match: +1
  const talentMarkets = (talent as { markets?: string[] }).markets ?? [];
  if (market && talentMarkets.some((m) => m.toLowerCase().includes(market.toLowerCase()))) {
    score += 1;
  }

  // Language match: +1
  const talentLangs = (talent.languages ?? []).map((l) => l.toLowerCase());
  const langNormalized = language?.toLowerCase();
  if (langNormalized && (langNormalized === "both" || talentLangs.some((l) => l.includes(langNormalized)))) {
    score += 1;
  }

  score = Math.min(SCORE_CAP, score);

  let label: FitLabel;
  if (score >= 8) label = "Perfect";
  else if (score >= 5) label = "Good";
  else label = "Low";

  return { score, label };
}
