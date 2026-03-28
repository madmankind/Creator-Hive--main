/**
 * Talent hero onboarding — inline bar + Grok finalize.
 * Individual path: core + PRISM-style fit + match-quality block.
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

/** Post-welcome coach: intake now holds PRISM + match; coach is confirm-only. */
export const TALENT_PRISM_COACH_PROMPTS = [] as const;

export const TALENT_PURPOSE_TAG_CHIPS = [] as const;

export type TalentCoachSequentialStep = {
  id: string;
  prompt: string;
  chips: readonly string[];
  inputKind?: "portfolio";
};

/** Empty — finalize runs right after welcome; full signal lives in intake draft. */
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
  /** Rank-ordered industry picks (max 5) — special UI in TalentIntakeBar */
  industryRank?: { max: number };
  optional?: boolean;
};

/** After creator-type + rep branching — individual / agency-self creators. */
export const TALENT_INDIVIDUAL_TAIL: readonly TalentIntakeQuestion[] = [
  {
    id: "primaryCraft",
    prompt: "What do you do most?",
    chips: [...CRAFT_CHIPS],
  },
  {
    id: "location",
    prompt: "Where are you based?",
    chips: [
      "Dubai",
      "Abu Dhabi",
      "London",
      "New York",
      "Mumbai",
      "Doha",
      "Riyadh",
      "Hong Kong",
      "Remote / elsewhere",
    ],
  },
  {
    id: "instagram",
    prompt: "What's your main social handle?",
    chips: [] as string[],
  },
  {
    id: "portfolioShowreel",
    prompt: "Add your portfolio or showreel (link).",
    chips: ["Skip — add later"],
    optional: true,
  },
  {
    id: "differentiator",
    prompt: "In one line, what makes you different?",
    chips: [] as string[],
  },
  {
    id: "yearsExperienceBand",
    prompt: "How many years have you been doing this?",
    chips: ["0–2 years", "3–5 years", "6–9 years", "10+ years"],
  },
  {
    id: "rankedIndustries",
    prompt: "Pick your top 5 industries in order of experience (tap in order — 1st = most).",
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
      "fast turnaround",
      "ongoing monthly work",
      "campaign-based work",
      "fewer projects with more craft",
    ],
  },
  {
    id: "feedbackStyle",
    prompt: "When feedback comes in, I usually…",
    chips: [
      "make the changes quickly and keep moving",
      "step back and realign before changing too much",
      "suggest a better way to solve it",
      "prefer clear feedback rounds from the start",
    ],
  },
  {
    id: "workEnvironmentFit",
    prompt: "I'm best suited to…",
    chips: [
      "working independently",
      "working with a small team",
      "being part of a bigger production",
      "working closely with a brand team",
    ],
  },
  {
    id: "workModeOpenness",
    prompt: "I'm open to…",
    chips: ["remote work", "on-site work", "hybrid", "travel if needed"],
  },
  {
    id: "availabilityType",
    prompt: "My availability is…",
    chips: ["freelance", "project-based", "part-time", "full-time"],
  },
  {
    id: "match_header",
    prompt: "Improve your match quality\n\nA few more answers help us match you to better-fit briefs.",
    chips: ["Continue"],
  },
  {
    id: "brandFitPick",
    prompt: "What kind of brands suit you best?",
    chips: [
      "emerging brands",
      "established brands",
      "luxury brands",
      "founder-led brands",
      "media / publisher brands",
      "agencies",
    ],
  },
  {
    id: "clientValuePick",
    prompt: "What do clients value you most for?",
    chips: ["speed", "taste", "reliability", "ideas", "polish", "organisation"],
  },
  {
    id: "teamSetupPick",
    prompt: "What kind of team setup brings out your best work?",
    chips: [
      "direct with the founder",
      "with a small internal team",
      "agency-side collaboration",
      "larger production crew",
      "mostly independent",
    ],
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
    prompt: "What kind of talent do you represent?",
    chips: ["UGC & creators", "Production crew", "Mixed roster", "Other — I'll type"],
  },
];

export const TALENT_REP_PATH_QUESTION: TalentIntakeQuestion = {
  id: "repOnboardPath",
  prompt: "How would you like to add talent?",
  chips: ["Add Talent 1 now", "Upload roster — finish later"],
};

export const TALENT_T1_FIELDS: readonly TalentIntakeQuestion[] = [
  { id: "t1_fullName", prompt: "Talent 1 — full name", chips: [] },
  { id: "t1_primaryRole", prompt: "Talent 1 — primary role", chips: [...CRAFT_CHIPS] },
  { id: "t1_location", prompt: "Talent 1 — based in", chips: TALENT_INDIVIDUAL_TAIL[1].chips as unknown as string[] },
  { id: "t1_social", prompt: "Talent 1 — social handle", chips: [] },
  {
    id: "t1_portfolio",
    prompt: "Talent 1 — portfolio link (optional)",
    chips: ["Skip"],
    optional: true,
  },
  {
    id: "t1_industries",
    prompt: "Talent 1 — top industries (optional, comma-separated)",
    chips: ["Skip"],
    optional: true,
  },
  {
    id: "t1_notes",
    prompt: "Talent 1 — notes (optional)",
    chips: ["Skip"],
    optional: true,
  },
];

export const TALENT_ADD_T2_QUESTION: TalentIntakeQuestion = {
  id: "addSecondTalent",
  prompt: "Add a second talent now?",
  chips: ["Add Talent 2", "Done — save"],
};

export const TALENT_T2_FIELDS: readonly TalentIntakeQuestion[] = [
  { id: "t2_fullName", prompt: "Talent 2 — full name", chips: [] },
  { id: "t2_primaryRole", prompt: "Talent 2 — primary role", chips: [...CRAFT_CHIPS] },
  { id: "t2_location", prompt: "Talent 2 — based in", chips: TALENT_INDIVIDUAL_TAIL[1].chips as unknown as string[] },
  { id: "t2_social", prompt: "Talent 2 — social handle", chips: [] },
  {
    id: "t2_portfolio",
    prompt: "Talent 2 — portfolio link (optional)",
    chips: ["Skip"],
    optional: true,
  },
];

/** @deprecated — use TALENT_INDIVIDUAL_TAIL + rep flows in HeroBar */
export const TALENT_INTAKE_QUESTIONS: readonly TalentIntakeQuestion[] = TALENT_INDIVIDUAL_TAIL;

function parseRankedIndustries(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x).trim()).filter(Boolean).slice(0, 5);
  } catch {
    return [];
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
  const craft = draft.primaryCraft?.trim() || "Creator";
  const ig = draft.instagram?.replace(/^@+/, "").trim() ?? "";
  const loc = draft.location?.trim() || "UAE";
  const first = draft.firstName?.trim() ?? "";
  const last = draft.lastName?.trim() ?? "";
  const full = [first, last].filter(Boolean).join(" ").trim();
  const display =
    draft.displayName?.trim() ||
    full ||
    (userName.trim().length >= 2 ? userName.trim() : craft);
  const portfolio = draft.portfolioShowreel?.trim() ?? "";
  const diff = draft.differentiator?.trim() ?? "";
  const ranked = parseRankedIndustries(draft.rankedIndustries);
  const brandFit = draft.brandFitPick?.trim();
  const clientVal = draft.clientValuePick?.trim();
  const teamSetup = draft.teamSetupPick?.trim();

  const skills = [craft, "Content Creation"]
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 8);

  const bioParts = [craft, diff, portfolio ? `Portfolio: ${portfolio}.` : "", draft.wantMore ? `Want: ${draft.wantMore}.` : ""].filter(
    Boolean,
  );

  return {
    name: display.slice(0, 120),
    instagram: ig.length >= 2 ? ig : "creator",
    bio: bioParts.join(" ").slice(0, 280),
    location: loc,
    skills,
    niches: ranked,
    portfolioUrl: portfolio && !portfolio.toLowerCase().startsWith("skip") ? portfolio : undefined,
    primaryRole: craft,
    rankedIndustries: ranked,
    yearsExperienceBand: draft.yearsExperienceBand?.trim() || undefined,
    preferredProjectTypes: draft.wantMore?.trim() ? [draft.wantMore.trim()] : [],
    preferredPace: draft.preferredPace?.trim() || undefined,
    feedbackStyle: draft.feedbackStyle?.trim() || undefined,
    howIWorkBest: draft.howIWorkBest?.trim() || undefined,
    workEnvironmentFit: draft.workEnvironmentFit?.trim() || undefined,
    workModeOpenness: draft.workModeOpenness?.trim() || undefined,
    availabilityType: draft.availabilityType?.trim() || undefined,
    brandFitPreferences: brandFit ? [brandFit] : [],
    clientValueStrengths: clientVal ? [clientVal] : [],
    teamSetupPreference: teamSetup || undefined,
    suitedTeamScale: draft.workEnvironmentFit?.trim() || undefined,
  };
}
