/**
 * Talent hero onboarding — inline bar + Grok finalize.
 * Individual path: fit + workflow signals for matching (PRISM refines, not primary).
 * Agency/rep path: rep root → manual Talent 1/2 or roster upload.
 */

export const TALENT_INDUSTRY_OPTIONS = [
  "Fashion",
  "Beauty",
  "Food & beverage",
  "Hospitality",
  "Luxury",
  "Lifestyle",
  "Tech",
  "Automotive",
  "Creator economy",
  "Fitness",
  "Healthcare",
  "Real estate",
  "Travel",
  "Parenting",
  "Finance",
  "Retail",
  "Entertainment",
  "Education",
] as const;

/** Post-welcome coach: intake holds fit fields; coach is finalize-only. */
export const TALENT_PRISM_COACH_PROMPTS = [] as const;

export const TALENT_PURPOSE_TAG_CHIPS = [] as const;

export type TalentCoachSequentialStep = {
  id: string;
  prompt: string;
  chips: readonly string[];
  inputKind?: "portfolio";
};

/** Empty — finalize runs after welcome; signals live in intake draft. */
export const TALENT_COACH_SEQUENTIAL_STEPS: readonly TalentCoachSequentialStep[] = [];

export const TALENT_CREATOR_TYPES = [
  "Independent creator",
  "Studio / collective",
  "Agent or rep",
] as const;

const CRAFT_CHIPS = [
  "Content creator",
  "Videographer",
  "Photographer",
  "Editor",
  "Social / community",
  "Brand / creative strategy",
] as const;

export const TALENT_INTAKE_NAME_QUESTIONS = [
  { id: "firstName", prompt: "What's your first name?", chips: [] as string[] },
  { id: "lastName", prompt: "What's your last name?", chips: [] as string[] },
  {
    id: "displayName",
    prompt: "Choose your display name on Creator Hive (how you'll appear publicly).",
    chips: [] as string[],
  },
] as const;

export type TalentIntakeQuestion = {
  id: string;
  prompt: string;
  chips: readonly string[];
  multiSelect?: { max: number };
  rolePicker?: true;
  /** Rank-ordered industry picks — fuzzy catalog + custom in HeroTalentIntakeBar */
  industryRank?: { max: number };
  /** Rank-ordered role picks — fuzzy catalog + custom */
  roleRank?: { max: number };
  /** Unordered multi-select (stored as JSON string[]) */
  chipsMulti?: { max: number };
  optional?: boolean;
};

/** After creator-type + rep branching — individual / agency-self creators. */
export const TALENT_INDIVIDUAL_TAIL: readonly TalentIntakeQuestion[] = [
  {
    id: "topRoles",
    prompt:
      "Pick your Top 3 roles in order of experience and preference (1st = strongest — search the catalog or add your own).",
    chips: [...CRAFT_CHIPS],
    roleRank: { max: 3 },
  },
  {
    id: "yearsExperienceBand",
    prompt: "How many years have you been doing this?",
    chips: ["0–2", "3–5", "6–9", "10+"],
  },
  {
    id: "rankedIndustries",
    prompt:
      "Pick your Top 5 industries in order of experience (1st = most — search or add your own).",
    chips: [...TALENT_INDUSTRY_OPTIONS],
    industryRank: { max: 5 },
  },
  {
    id: "howIWorkBest",
    prompt: "I work best when…",
    chips: [
      "the brief is clear and I can take ownership",
      "I'm working closely with a team",
      "there's room to shape the work as it evolves",
      "the direction is already set and I can focus on execution",
    ],
  },
  {
    id: "wantMore",
    prompt: "The kind of work I want more of is…",
    chips: ["social content", "campaigns", "brand storytelling", "premium editorial work"],
  },
  {
    id: "preferredPace",
    prompt: "The pace that suits me best is…",
    chips: [
      "working in sprints",
      "delivering everything at once",
      "ongoing weekly or monthly flow",
      "campaign-based work with milestone check-ins",
    ],
  },
  {
    id: "feedbackStyle",
    prompt: "When feedback comes in, I usually…",
    chips: [
      "make the changes quickly and keep moving",
      "pause and realign before changing direction",
      "suggest a better way to solve it",
      "prefer clear review rounds from the start",
    ],
  },
  {
    id: "workModeOpenness",
    prompt: "I'm open to…",
    chips: ["remote work", "on-site work", "hybrid", "travel if needed"],
    chipsMulti: { max: 4 },
  },
  {
    id: "availabilityType",
    prompt: "My availability is…",
    chips: ["freelance", "project-based", "part-time", "full-time"],
  },
];

export const TALENT_REP_WHO_QUESTION: TalentIntakeQuestion = {
  id: "repSigningMode",
  prompt: "Are you signing up for yourself or representing talent?",
  chips: ["Myself — I'm the creator", "I'm representing talent"],
};

export const TALENT_REP_ROOT: readonly TalentIntakeQuestion[] = [
  { id: "repEntityName", prompt: "What's your business or entity name?", chips: [] },
  { id: "repContactName", prompt: "What's your name (as the rep)?", chips: [] },
  { id: "repEmail", prompt: "What's your work email?", chips: [] },
  {
    id: "repSocial",
    prompt: "Your social handle (optional)",
    chips: ["Skip"],
    optional: true,
  },
  {
    id: "repTalentKinds",
    prompt: "What kind of talent do you represent? (pick examples and/or describe in your own words below)",
    chips: ["UGC & creators", "Production crew", "Mixed roster"],
  },
];

export const TALENT_REP_PATH_QUESTION: TalentIntakeQuestion = {
  id: "repOnboardPath",
  prompt: "How would you like to add talent?",
  chips: ["Add each individually", "Upload roster — finish later"],
};

export const TALENT_T1_FIELDS: readonly TalentIntakeQuestion[] = [
  { id: "t1_fullName", prompt: "Talent 1 — full name", chips: [] },
  {
    id: "t1_topRoles",
    prompt:
      "Talent 1 — primary roles (pick up to 3 in order of experience — 1st = strongest; search the catalog or add your own).",
    chips: [...CRAFT_CHIPS],
    roleRank: { max: 3 },
  },
  {
    id: "t1_rankedIndustries",
    prompt:
      "Talent 1 — pick top 5 industries in order of experience (search or add your own).",
    chips: [...TALENT_INDUSTRY_OPTIONS],
    industryRank: { max: 5 },
  },
];

export const TALENT_ADD_T2_QUESTION: TalentIntakeQuestion = {
  id: "addSecondTalent",
  prompt: "Add another talent or save what you have?",
  chips: ["Add Talent 2", "Done — save", "Skip — save for later"],
};

export const TALENT_T2_FIELDS: readonly TalentIntakeQuestion[] = [
  { id: "t2_fullName", prompt: "Talent 2 — full name", chips: [] },
  {
    id: "t2_topRoles",
    prompt:
      "Talent 2 — primary roles (pick up to 3 in order of experience — 1st = strongest; search the catalog or add your own).",
    chips: [...CRAFT_CHIPS],
    roleRank: { max: 3 },
  },
  {
    id: "t2_rankedIndustries",
    prompt:
      "Talent 2 — pick top 5 industries in order of experience (search or add your own).",
    chips: [...TALENT_INDUSTRY_OPTIONS],
    industryRank: { max: 5 },
  },
];

/** @deprecated — use TALENT_INDIVIDUAL_TAIL + rep flows in HeroBar */
export const TALENT_INTAKE_QUESTIONS: readonly TalentIntakeQuestion[] = TALENT_INDIVIDUAL_TAIL;

export function parseRankedRoles(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x).trim()).filter(Boolean).slice(0, 3);
  } catch {
    return [];
  }
}

export function parseRankedIndustries(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x).trim()).filter(Boolean).slice(0, 5);
  } catch {
    return [];
  }
}

export function parseChipsMulti(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x).trim()).filter(Boolean);
  } catch {
    return raw
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

/** Flatten draft for Grok finalize digest */
export function buildTalentDraftDigest(draft: Record<string, string>): string {
  return Object.entries(draft)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k}: ${String(v).trim()}`)
    .join("\n")
    .slice(0, 12000);
}

/** Map hero draft → creator profile PUT payload helpers */
export function draftToProfileBody(draft: Record<string, string>, userName: string) {
  const rolesRanked = parseRankedRoles(draft.topRoles);
  const craft = rolesRanked[0]?.trim() || "Creator";
  const first = draft.firstName?.trim() ?? "";
  const last = draft.lastName?.trim() ?? "";
  const full = [first, last].filter(Boolean).join(" ").trim();
  const display =
    draft.displayName?.trim() ||
    full ||
    (userName.trim().length >= 2 ? userName.trim() : craft);
  const ranked = parseRankedIndustries(draft.rankedIndustries);
  const openness = parseChipsMulti(draft.workModeOpenness);

  const skills = [...rolesRanked, "Content Creation"]
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 8);

  const bioParts = [
    craft,
    draft.wantMore ? `Want: ${draft.wantMore}.` : "",
    ranked.length ? `Industries: ${ranked.slice(0, 3).join(", ")}.` : "",
  ].filter(Boolean);

  return {
    name: display.slice(0, 120),
    instagram: "creator",
    bio: bioParts.join(" ").slice(0, 280),
    location: "UAE",
    skills,
    niches: ranked,
    portfolioUrl: undefined as string | undefined,
    primaryRole: craft,
    rankedIndustries: ranked,
    yearsExperienceBand: draft.yearsExperienceBand?.trim() || undefined,
    preferredProjectTypes: draft.wantMore?.trim() ? [draft.wantMore.trim()] : [],
    preferredPace: draft.preferredPace?.trim() || undefined,
    feedbackStyle: draft.feedbackStyle?.trim() || undefined,
    howIWorkBest: draft.howIWorkBest?.trim() || undefined,
    workModeOpenness: openness.length ? openness.join(" · ") : undefined,
    availabilityType: draft.availabilityType?.trim() || undefined,
    brandFitPreferences: [] as string[],
    clientValueStrengths: [] as string[],
    teamSetupPreference: undefined as string | undefined,
    workEnvironmentFit: undefined as string | undefined,
    suitedTeamScale: undefined as string | undefined,
  };
}
