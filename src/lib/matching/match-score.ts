// src/lib/matching/match-score.ts
// CANONICAL MATCH SCORE COMPUTATION
import type { BriefLite, MatchScore } from "@/lib/schemas/booking";
import type { CuratedTalent } from "@/lib/curatedTalent";

/**
 * Compute match score (0-10) with deterministic weighted algorithm
 * 
 * Weights:
 * - Role fit: 35%
 * - Platform fit: 20%
 * - Market/language fit: 15%
 * - Objective/output fit: 20%
 * - Tier appropriateness: 10%
 */
export function computeMatchScore(
  brief: BriefLite,
  talent: CuratedTalent
): Omit<MatchScore, "requestId" | "computedAt"> {
  const weights = {
    role: 0.35,
    platform: 0.20,
    market: 0.15,
    objective: 0.20,
    tier: 0.10,
  };

  // 1. Role fit (0-10)
  const roleFit = scoreRoleFit(brief.outputs, talent.roleTags);

  // 2. Platform fit (0-10)
  const platformFit = scorePlatformFit(brief.platforms, talent.platformTags);

  // 3. Market/language fit (0-10)
  const marketFit = scoreMarketFit(brief.markets, brief.languages, talent);

  // 4. Objective/output fit (0-10)
  const objectiveFit = scoreObjectiveFit(brief.objective, brief.outputs, talent);

  // 5. Tier appropriateness (0-10)
  const tierFit = scoreTierFit(brief.pricingTier, talent);

  // Weighted sum
  const rawScore =
    roleFit * weights.role +
    platformFit * weights.platform +
    marketFit * weights.market +
    objectiveFit * weights.objective +
    tierFit * weights.tier;

  // Round to integer 0-10
  const score = Math.round(Math.min(10, Math.max(0, rawScore)));

  // Generate rationale from top 2 factors
  const factors = [
    { name: "role fit", score: roleFit },
    { name: "platform match", score: platformFit },
    { name: "market/language fit", score: marketFit },
    { name: "objective alignment", score: objectiveFit },
    { name: "tier match", score: tierFit },
  ].sort((a, b) => b.score - a.score);

  const top2 = factors.slice(0, 2);
  let rationale: string;

  if (top2[0].score >= 9) {
    rationale = `Perfect ${top2[0].name}, strong ${top2[1].name}`;
  } else if (top2[0].score >= 7) {
    rationale = `Good ${top2[0].name}, ${top2[1].name}`;
  } else if (top2[0].score >= 5) {
    rationale = `Moderate ${top2[0].name}, ${top2[1].name}`;
  } else {
    rationale = `Fair ${top2[0].name}, needs ${top2[1].name}`;
  }

  // Ensure rationale is <= 60 chars
  if (rationale.length > 60) {
    rationale = rationale.substring(0, 57) + "...";
  }

  return {
    talentId: talent.id,
    score,
    rationale,
  };
}

// ========================
// SCORING HELPERS
// ========================

function scoreRoleFit(briefOutputs: string[], talentRoles: string[]): number {
  if (talentRoles.length === 0) return 5;

  const normalizedBrief = briefOutputs.map((o) => o.toLowerCase());
  const normalizedTalent = talentRoles.map((r) => r.toLowerCase());

  // Direct matches
  const directMatches = normalizedBrief.filter((b) =>
    normalizedTalent.some((t) => t.includes(b) || b.includes(t))
  ).length;

  const matchRatio = directMatches / normalizedBrief.length;

  if (matchRatio >= 0.8) return 10;
  if (matchRatio >= 0.6) return 8;
  if (matchRatio >= 0.4) return 6;
  if (matchRatio >= 0.2) return 4;
  return 2;
}

function scorePlatformFit(briefPlatforms: string[], talentPlatforms: string[]): number {
  if (talentPlatforms.length === 0) return 5;

  const normalizedBrief = briefPlatforms.map((p) => p.toLowerCase());
  const normalizedTalent = talentPlatforms.map((p) => p.toLowerCase());

  const matches = normalizedBrief.filter((b) => normalizedTalent.includes(b)).length;
  const matchRatio = matches / normalizedBrief.length;

  if (matchRatio === 1) return 10;
  if (matchRatio >= 0.7) return 8;
  if (matchRatio >= 0.5) return 6;
  if (matchRatio >= 0.3) return 4;
  return 2;
}

function scoreMarketFit(
  briefMarkets: string[],
  briefLanguages: string[],
  talent: CuratedTalent
): number {
  let score = 5; // baseline

  // Market fit
  const talentLocation = talent.location?.toLowerCase() || "";
  const inTargetMarket = briefMarkets.some((m) => {
    const market = m.toLowerCase();
    if (market === "uae" && talentLocation.includes("dubai")) return true;
    if (market === "uae" && talentLocation.includes("abu dhabi")) return true;
    if (market === "ksa" && talentLocation.includes("riyadh")) return true;
    if (market === "ksa" && talentLocation.includes("jeddah")) return true;
    if (market === "qat" && talentLocation.includes("doha")) return true;
    if (market === "gcc") return talentLocation.includes("uae") || talentLocation.includes("saudi") || talentLocation.includes("qatar");
    if (market === "global") return true;
    return false;
  });

  if (inTargetMarket) score += 3;

  // Language fit
  const talentLanguages = (talent.languages || []).map((l) => l.toLowerCase());
  const hasArabic = talentLanguages.some((l) => l.includes("arabic") || l.includes("ar"));
  const hasEnglish = talentLanguages.some((l) => l.includes("english") || l.includes("en"));

  const needsArabic = briefLanguages.includes("AR") || briefLanguages.includes("BOTH");
  const needsEnglish = briefLanguages.includes("EN") || briefLanguages.includes("BOTH");

  if (needsArabic && hasArabic) score += 1;
  if (needsEnglish && hasEnglish) score += 1;

  return Math.min(10, score);
}

function scoreObjectiveFit(
  objective: string,
  outputs: string[],
  talent: CuratedTalent
): number {
  let score = 5;

  // Match objective to talent's strengths
  const bio = talent.shortBio?.toLowerCase() || "";
  const roles = talent.roleTags.map((r) => r.toLowerCase()).join(" ");

  if (objective === "AWARENESS") {
    if (bio.includes("brand") || bio.includes("awareness") || roles.includes("influencer")) {
      score += 3;
    }
  } else if (objective === "GROWTH") {
    if (bio.includes("growth") || bio.includes("audience") || roles.includes("social")) {
      score += 3;
    }
  } else if (objective === "CONVERSIONS") {
    if (bio.includes("conversion") || bio.includes("performance") || roles.includes("ugc")) {
      score += 3;
    }
  } else if (objective === "LAUNCH") {
    if (bio.includes("launch") || bio.includes("campaign") || roles.includes("producer")) {
      score += 3;
    }
  }

  // Output type alignment
  const outputScore = outputs.some((o) => {
    const output = o.toLowerCase();
    if (output === "ugc" && roles.includes("ugc")) return true;
    if (output.includes("video") && roles.includes("video")) return true;
    if (output.includes("photo") && roles.includes("photo")) return true;
    if (output.includes("design") && roles.includes("design")) return true;
    return false;
  });

  if (outputScore) score += 2;

  return Math.min(10, score);
}

function scoreTierFit(pricingTier: string, talent: CuratedTalent): number {
  // For now, assume all curated talent are appropriate for both tiers
  // In production, you'd check talent.tier or talent.followerCount/engagementRate

  const followerCount = talent.followers || 0;
  const isHighPerformer = followerCount > 50000;

  if (pricingTier === "HIVE_SIGNATURE") {
    return isHighPerformer ? 10 : 7;
  } else {
    // HIVE_SELECT
    return followerCount > 10000 ? 10 : 8;
  }
}
