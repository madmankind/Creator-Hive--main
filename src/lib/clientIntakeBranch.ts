/** Contextual steps after “What type of business are you?” — then campaign steps run. */

export type ClientBranchStep = {
  id: string;
  prompt: string;
  chips: string[];
  /** “Skip” chip stores empty string */
  optional?: boolean;
  /** Fuzzy multi-select role picker (full catalog + custom); stored as JSON string[] in answers */
  rolePickerMulti?: { max: number };
  /** Fuzzy multi-select from step.chips as catalog (+ custom); JSON string[] in answers */
  fuzzyPickMulti?: { max: number; ordered?: boolean };
};

export const CLIENT_CAMPAIGN_STEPS: ClientBranchStep[] = [
  {
    id: "objective",
    prompt: "What are you trying to achieve?",
    chips: ["Campaign launch", "Social growth", "UGC content", "Brand awareness", "Influencer activation"],
  },
  {
    id: "timeline",
    prompt: "When do you need to start?",
    chips: ["ASAP", "Within 2 weeks", "This month", "Next month"],
  },
  /** Monthly budget — USD bands (public packages use USD labels). */
  {
    id: "budget",
    prompt: "What's your monthly budget range?",
    chips: ["Under ~$5K/mo", "~$5–8K/mo", "~$8–12K/mo", "~$12K+/mo"],
  },
  {
    id: "roles",
    prompt: "What type of talent do you need?",
    chips: [
      "Videographer",
      "Content Creator",
      "Social Media Manager",
      "Photographer",
      "Editor",
      "Strategist",
      "UGC Creator",
    ],
    rolePickerMulti: { max: 12 },
  },
  {
    id: "clientHowWorkRuns",
    prompt: "How do you want this work to run?",
    chips: [
      "we'll provide a clear brief and want talent to take ownership",
      "we want to collaborate closely throughout",
      "we want to shape the work as it evolves",
      "we already know exactly what we want and need strong execution",
    ],
  },
  {
    id: "clientWorkKind",
    prompt: "What kind of work is this mainly?",
    chips: ["social content", "campaigns", "brand storytelling", "premium editorial work"],
  },
  {
    id: "clientPace",
    prompt: "What pace do you need this project to run at?",
    chips: [
      "working in sprints",
      "one full delivery at the end",
      "ongoing weekly or monthly flow",
      "campaign-based work with milestone check-ins",
    ],
  },
  {
    id: "clientFeedback",
    prompt: "How does your team usually give feedback?",
    chips: [
      "fast feedback and quick changes",
      "structured review rounds",
      "collaborative discussion before changes",
      "milestone-based approvals",
    ],
  },
  {
    id: "clientSetup",
    prompt: "What setup do you need?",
    chips: ["remote", "on-site", "hybrid", "travel if needed"],
    fuzzyPickMulti: { max: 4, ordered: false },
  },
  {
    id: "clientEngagement",
    prompt: "What kind of engagement is this?",
    chips: ["one-off project", "project-based engagement", "part-time support", "ongoing / retainer"],
  },
  {
    id: "clientFinalNotes",
    prompt: "Any preferences, deal breakers, or ways you like to work?",
    chips: ["Skip"],
    optional: true,
  },
];

const BRAND_INDUSTRY_CHIPS = [
  "Fashion",
  "Beauty",
  "Food & beverage",
  "Tech",
  "Retail",
  "Hospitality",
  "Healthcare",
  "Other / mixed",
];

const MEDIA_CATEGORY_CHIPS = [
  "Digital publisher",
  "Broadcast / TV",
  "Print",
  "Podcast / audio",
  "Creator network",
  "Other",
];

export function getClientBranchSteps(bizType: string): ClientBranchStep[] {
  switch (bizType) {
    case "Brand / In-house":
      return [
        { id: "brand_businessName", prompt: "What's the name of your business?", chips: [] },
        { id: "brand_industry", prompt: "What industry are you in?", chips: [...BRAND_INDUSTRY_CHIPS] },
        {
          id: "brand_social",
          prompt: "Your social handle (optional)",
          chips: ["Skip"],
          optional: true,
        },
      ];
    case "Agency":
      return [
        { id: "agency_name", prompt: "What's the name of your agency?", chips: [] },
        {
          id: "agency_clientIndustry",
          prompt: "What industry is your client in?",
          chips: [...BRAND_INDUSTRY_CHIPS],
        },
        {
          id: "agency_clientName",
          prompt: "Client name (optional)",
          chips: ["Skip"],
          optional: true,
        },
        {
          id: "agency_clientSocial",
          prompt: "Client's social handle (optional)",
          chips: ["Skip"],
          optional: true,
        },
      ];
    case "Startup / Founder":
      return [
        { id: "startup_businessName", prompt: "What's the name of your business?", chips: [] },
        { id: "startup_industry", prompt: "What industry are you building in?", chips: [...BRAND_INDUSTRY_CHIPS] },
        {
          id: "startup_social",
          prompt: "Your social handle (optional)",
          chips: ["Skip"],
          optional: true,
        },
      ];
    case "Media / Publisher":
      return [
        { id: "media_companyName", prompt: "What's the name of your company?", chips: [] },
        {
          id: "media_category",
          prompt: "What category best describes your business?",
          chips: [...MEDIA_CATEGORY_CHIPS],
        },
        {
          id: "media_handle",
          prompt: "Your main social or publication handle (optional)",
          chips: ["Skip"],
          optional: true,
        },
      ];
    default:
      return [];
  }
}

function parseJsonStringArray(raw: string | undefined): string[] {
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

/** Shape used to build the AI search query after intake or brief upload. */
export type ClientBriefSearchInput = {
  primaryObjective: string;
  requestedRoles: string[];
  startTiming: string;
  budgetRange: string;
  companyName: string | null;
  industry: string | null;
  notes: string | null;
  clientFitProfile?: Record<string, unknown> | null;
};

/** Natural-language query for /api/ai-search from saved brief fields. */
export function buildClientAiSearchQuery(brief: ClientBriefSearchInput): string {
  const parts: string[] = [];
  if (brief.primaryObjective?.trim()) parts.push(`Objective: ${brief.primaryObjective.trim()}`);
  if (brief.requestedRoles?.length) parts.push(`Roles needed: ${brief.requestedRoles.join(", ")}`);
  if (brief.startTiming?.trim()) parts.push(`Timing: ${brief.startTiming.trim()}`);
  if (brief.budgetRange?.trim()) parts.push(`Budget: ${brief.budgetRange.trim()}`);
  if (brief.companyName?.trim()) parts.push(`Company: ${brief.companyName.trim()}`);
  if (brief.industry?.trim()) parts.push(`Industry: ${brief.industry.trim()}`);
  const fit = brief.clientFitProfile;
  if (fit && typeof fit === "object") {
    const slim = Object.fromEntries(
      Object.entries(fit).filter(([, v]) => v != null && String(v).trim()),
    );
    const s = JSON.stringify(slim);
    if (s.length > 2) parts.push(`Workflow fit: ${s.slice(0, 800)}`);
  }
  if (brief.notes?.trim()) parts.push(`Notes: ${brief.notes.trim().slice(0, 1200)}`);
  return parts.join("\n") || "Premium creative campaign in UAE — recommend a balanced team.";
}

/** Structured workflow-fit answers for matching (mirrors talent intake dimensions). */
export function buildClientFitProfile(answers: Record<string, string>): Record<string, unknown> {
  const setup = parseJsonStringArray(answers.clientSetup);
  return {
    howWorkRuns: answers.clientHowWorkRuns?.trim() || null,
    workKind: answers.clientWorkKind?.trim() || null,
    pace: answers.clientPace?.trim() || null,
    feedbackStyle: answers.clientFeedback?.trim() || null,
    setup: setup.length ? setup : null,
    engagement: answers.clientEngagement?.trim() || null,
    finalNotes: answers.clientFinalNotes?.trim() || null,
  };
}

/** Map branch + campaign answers + biz type → discovery brief + advisor profile keys */
export function mapClientIntakeToDiscovery(
  answers: Record<string, string>,
  bizType: string,
): {
  primaryObjective: string;
  requestedRoles: string[];
  startTiming: string;
  budgetRange: string;
  companyName: string | null;
  industry: string | null;
  notes: string | null;
  clientFitProfile: Record<string, unknown>;
  profileFlat: Record<string, string>;
} {
  const noteParts: string[] = [`Business type: ${bizType}`];

  let companyName: string | null = null;
  let industry: string | null = null;

  if (bizType === "Brand / In-house") {
    companyName = answers.brand_businessName?.trim() || null;
    industry = answers.brand_industry?.trim() || null;
    if (answers.brand_social?.trim()) noteParts.push(`Brand social: ${answers.brand_social.trim()}`);
  } else if (bizType === "Agency") {
    companyName = answers.agency_name?.trim() || null;
    industry = answers.agency_clientIndustry?.trim() || null;
    if (answers.agency_clientName?.trim()) noteParts.push(`Client: ${answers.agency_clientName.trim()}`);
    if (answers.agency_clientSocial?.trim()) noteParts.push(`Client social: ${answers.agency_clientSocial.trim()}`);
  } else if (bizType === "Startup / Founder") {
    companyName = answers.startup_businessName?.trim() || null;
    industry = answers.startup_industry?.trim() || null;
    if (answers.startup_social?.trim()) noteParts.push(`Social: ${answers.startup_social.trim()}`);
  } else if (bizType === "Media / Publisher") {
    companyName = answers.media_companyName?.trim() || null;
    industry = answers.media_category?.trim() || null;
    if (answers.media_handle?.trim()) noteParts.push(`Main handle: ${answers.media_handle.trim()}`);
  }

  let requestedRoles: string[] = [];
  const rolesRaw = answers.roles?.trim() ?? "";
  if (rolesRaw) {
    try {
      const parsed = JSON.parse(rolesRaw) as unknown;
      if (Array.isArray(parsed)) requestedRoles = parsed.map((x) => String(x).trim()).filter(Boolean);
      else requestedRoles = [rolesRaw];
    } catch {
      requestedRoles = rolesRaw.split(/[,|]/).map((s) => s.trim()).filter(Boolean);
      if (requestedRoles.length === 0) requestedRoles = [rolesRaw];
    }
  }

  const clientFitProfile = buildClientFitProfile(answers);
  const fitSummaryParts = [
    clientFitProfile.howWorkRuns && `Work style: ${clientFitProfile.howWorkRuns}`,
    clientFitProfile.workKind && `Deliverable focus: ${clientFitProfile.workKind}`,
    clientFitProfile.pace && `Pace: ${clientFitProfile.pace}`,
    clientFitProfile.feedbackStyle && `Feedback: ${clientFitProfile.feedbackStyle}`,
    Array.isArray(clientFitProfile.setup) && clientFitProfile.setup.length
      ? `Setup: ${(clientFitProfile.setup as string[]).join(", ")}`
      : null,
    clientFitProfile.engagement && `Engagement: ${clientFitProfile.engagement}`,
    clientFitProfile.finalNotes && `Notes: ${clientFitProfile.finalNotes}`,
  ].filter(Boolean) as string[];
  if (fitSummaryParts.length) noteParts.push(...fitSummaryParts);

  const profileFlat: Record<string, string> = {
    businessType: bizType,
    objective: answers.objective ?? "",
    timeline: answers.timeline ?? "",
    budget: answers.budget ?? "",
    roles: requestedRoles.join(", "),
    company: companyName ?? "",
    industry: industry ?? "",
    ...answers,
  };

  return {
    primaryObjective: answers.objective ?? "",
    requestedRoles,
    startTiming: answers.timeline ?? "",
    budgetRange: answers.budget ?? "",
    companyName,
    industry,
    notes: noteParts.length > 1 ? noteParts.join("\n") : noteParts[0] ?? null,
    clientFitProfile,
    profileFlat,
  };
}
