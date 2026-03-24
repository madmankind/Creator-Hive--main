// Match Score calculation logic (deterministic)

export interface MatchScoreInputs {
  roleFit: number; // 0-100: how well talent role matches campaign needs
  platformFit: number; // 0-100: IG/TT relevance
  deliverySpeed: number; // 0-100: turnaround tier
  reliability: number; // 0-100: on-time history, revisions, complaints
  budgetFit: number; // 0-100: within budget range
}

export interface MatchScoreResult {
  score: number; // 0-100
  breakdown: {
    roleFit: number;
    platformFit: number;
    deliverySpeed: number;
    reliability: number;
    budgetFit: number;
  };
  reasons: string[];
}

const WEIGHTS = {
  roleFit: 0.30,
  platformFit: 0.20,
  deliverySpeed: 0.15,
  reliability: 0.20,
  budgetFit: 0.15,
};

export function calculateMatchScore(inputs: MatchScoreInputs): MatchScoreResult {
  const weightedScore =
    inputs.roleFit * WEIGHTS.roleFit +
    inputs.platformFit * WEIGHTS.platformFit +
    inputs.deliverySpeed * WEIGHTS.deliverySpeed +
    inputs.reliability * WEIGHTS.reliability +
    inputs.budgetFit * WEIGHTS.budgetFit;

  const score = Math.round(weightedScore);

  // Generate reasons
  const reasons: string[] = [];
  if (inputs.roleFit >= 80) reasons.push("Strong role alignment");
  if (inputs.platformFit >= 80) reasons.push("Platform expertise matches");
  if (inputs.deliverySpeed >= 80) reasons.push("Fast turnaround");
  if (inputs.reliability >= 90) reasons.push("High reliability");
  if (inputs.budgetFit >= 80) reasons.push("Within budget range");

  return {
    score,
    breakdown: {
      roleFit: inputs.roleFit,
      platformFit: inputs.platformFit,
      deliverySpeed: inputs.deliverySpeed,
      reliability: inputs.reliability,
      budgetFit: inputs.budgetFit,
    },
    reasons,
  };
}

// Helper to calculate match score for a talent
export function calculateTalentMatchScore(
  talent: { roles: string[]; platforms: string[] },
  campaignNeeds: {
    requiredRoles?: string[];
    requiredPlatforms?: string[];
    budgetRange?: { min: number; max: number };
    urgency?: "low" | "medium" | "high";
  },
  talentRate: number
): MatchScoreResult {
  // Role fit
  const roleFit = campaignNeeds.requiredRoles
    ? talent.roles.some((role) =>
        campaignNeeds.requiredRoles!.some((req) =>
          role.toLowerCase().includes(req.toLowerCase())
        )
      )
      ? 90
      : 50
    : 75;

  // Platform fit
  const platformFit = campaignNeeds.requiredPlatforms
    ? talent.platforms.some((platform) =>
        campaignNeeds.requiredPlatforms!.some((req) =>
          platform.toLowerCase().includes(req.toLowerCase())
        )
      )
      ? 90
      : 50
    : 75;

  // Delivery speed (mock based on urgency)
  const deliverySpeed =
    campaignNeeds.urgency === "high" ? 85 : campaignNeeds.urgency === "medium" ? 75 : 65;

  // Reliability (mock - would come from historical data)
  const reliability = 85; // Default high reliability

  // Budget fit
  const budgetFit = campaignNeeds.budgetRange
    ? talentRate >= campaignNeeds.budgetRange.min &&
      talentRate <= campaignNeeds.budgetRange.max
      ? 90
      : talentRate < campaignNeeds.budgetRange.min
      ? 70
      : 50
    : 75;

  return calculateMatchScore({
    roleFit,
    platformFit,
    deliverySpeed,
    reliability,
    budgetFit,
  });
}












