/** Contextual steps after “What type of business are you?” — then campaign steps run. */

export type ClientBranchStep = {
  id: string;
  prompt: string;
  chips: string[];
  /** “Skip” chip stores empty string */
  optional?: boolean;
  /** Fuzzy multi-select role picker (full catalog + custom); stored as JSON string[] in answers */
  rolePickerMulti?: { max: number };
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
    profileFlat,
  };
}
