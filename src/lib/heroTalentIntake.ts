/**
 * Talent hero onboarding — same step pattern as client IntakeBar in HeroBar.tsx,
 * different prompts. Answers are rolled into a draft for Grok finalize + profile PUT.
 */

/**
 * Post-welcome coach prompts — avoid duplicating pre-welcome intake (see TALENT_INTAKE_QUESTIONS).
 * Structure/brief-vs-co-create is covered by intake `howIWorkBest`; we skip that dimension here.
 */
export const TALENT_PRISM_COACH_PROMPTS = [
  "Pace: Do you thrive on fast turnarounds or longer, deep builds?",
  "Risk: Proven formats vs experimental, high-variance ideas?",
  "Collaboration: Solo maker, tight pod, or large-team energy?",
  "Purpose: Which brand missions or categories energize you?",
  "Purpose: Which brand missions or categories tend to drain you?",
] as const;

/** Example tags for the two Purpose PRISM steps (creators can also type below). */
export const TALENT_PURPOSE_TAG_CHIPS = [
  "Sustainability / purposeful brands",
  "Luxury & premium",
  "Sports & wellness",
  "Tech & innovation",
  "Culture & entertainment",
  "FMCG & household names",
  "Regional / Arabic-first stories",
  "Startups & challengers",
] as const;

/** One screen at a time after welcome — same UX as hero intake bar. */
export type TalentCoachSequentialStep = {
  id: string;
  prompt: string;
  chips: readonly string[];
  /** Portfolio: link field + file upload on one screen */
  inputKind?: "portfolio";
};

export const TALENT_COACH_SEQUENTIAL_STEPS: readonly TalentCoachSequentialStep[] = [
  {
    id: "prism_0",
    prompt: TALENT_PRISM_COACH_PROMPTS[0],
    chips: ["Fast turnarounds", "Longer, deep builds", "A mix of both"],
  },
  {
    id: "prism_1",
    prompt: TALENT_PRISM_COACH_PROMPTS[1],
    chips: ["Proven formats", "Experimental ideas", "Both"],
  },
  {
    id: "prism_2",
    prompt: TALENT_PRISM_COACH_PROMPTS[2],
    chips: ["Solo maker", "Tight pod", "Large-team energy"],
  },
  {
    id: "prism_3",
    prompt: TALENT_PRISM_COACH_PROMPTS[3],
    chips: [...TALENT_PURPOSE_TAG_CHIPS],
  },
  {
    id: "prism_4",
    prompt: TALENT_PRISM_COACH_PROMPTS[4],
    chips: [...TALENT_PURPOSE_TAG_CHIPS, "Nothing really drains me — it's usually the process"],
  },
  {
    id: "portfolio",
    prompt: "Show your best work — paste a link and/or upload a file (optional).",
    chips: ["Skip — add later"],
    inputKind: "portfolio",
  },
  {
    id: "extra",
    prompt: "Dream clients, tools, or constraints — anything else we should know?",
    chips: ["Skip — I'm good"],
  },
] as const;

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
  /** Multi-select; Continue stores JSON.stringify(selected) */
  multiSelect?: { max: number };
  /** Fuzzy catalog + custom typed roles */
  rolePicker?: true;
};

export const TALENT_INTAKE_QUESTIONS: readonly TalentIntakeQuestion[] = [
  {
    id: "primaryCraft",
    prompt: "What's your main craft — the headline role brands hire you for?",
    chips: [...CRAFT_CHIPS],
  },
  {
    id: "additionalRoles",
    prompt: "What other professional hats do you wear? (pick up to 2 — search or type)",
    chips: [] as string[],
    multiSelect: { max: 2 },
    rolePicker: true,
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
    id: "remoteWork",
    prompt: "Are you available to work remotely?",
    chips: ["Yes — fully remote OK", "Hybrid preferred", "Mostly on-site / local", "Case by case"],
  },
  {
    id: "howIWorkBest",
    prompt: "I work best when…",
    chips: [
      "The brief is clear and I own the outcome",
      "I'm embedded with the team",
      "There's room to shape the work as we go",
      "Direction is set — I nail execution",
    ],
  },
  {
    id: "wantMore",
    prompt: "The kind of work you want more of is…",
    chips: [
      "Social & UGC",
      "Campaigns & launches",
      "Brand storytelling",
      "Premium / editorial",
    ],
  },
  {
    id: "instagram",
    prompt: "What's your main social handle?",
    chips: [] as string[],
  },
] as const;

function parseAdditionalRoles(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x).trim()).filter(Boolean);
  } catch {
    return [];
  }
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
  const extraRaw = parseAdditionalRoles(draft.additionalRoles);
  const extra = extraRaw
    .filter((r) => r.toLowerCase() !== craft.toLowerCase())
    .slice(0, 2);
  const remote = draft.remoteWork?.trim() ?? "";
  const skills = [craft, ...extra, "Content Creation"]
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 8);
  const bioParts = [
    craft,
    extra.length ? `Also: ${extra.join(", ")}.` : "",
    draft.wantMore ? `Interested in: ${draft.wantMore}.` : "",
    remote ? `Remote: ${remote}.` : "",
  ].filter(Boolean);
  return {
    name: display.slice(0, 120),
    instagram: ig.length >= 2 ? ig : "creator",
    bio: bioParts.join(" ").slice(0, 280),
    location: loc,
    skills,
    niches: [],
    primaryRole: craft,
    howIWorkBest: draft.howIWorkBest || undefined,
    preferredProjectTypes: draft.wantMore ? [draft.wantMore] : [],
    rankedIndustries: [],
    workModeOpenness: remote || undefined,
  };
}
