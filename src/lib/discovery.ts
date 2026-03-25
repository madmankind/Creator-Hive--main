// src/lib/discovery.ts
// ─── Centralized discovery field definitions, constants, and mapping helpers ───

export const DISCOVERY_OBJECTIVES = [
  { id: "brand_build",      label: "Build a brand from scratch",              icon: "🏗" },
  { id: "content_growth",   label: "Grow monthly content & social presence",  icon: "📈" },
  { id: "campaign_launch",  label: "Launch a campaign or seasonal push",      icon: "🚀" },
  { id: "ugc_shortform",    label: "Create short-form / UGC content",         icon: "🎬" },
  { id: "web_app",          label: "Build or improve a website / app",        icon: "💻" },
  { id: "influencer",       label: "Creator / influencer activation",         icon: "⭐" },
  { id: "paid_media",       label: "Paid media / ads",                        icon: "📣" },
  { id: "not_sure",         label: "Not sure yet",                            icon: "🤔" },
] as const;

export type DiscoveryObjectiveId = (typeof DISCOVERY_OBJECTIVES)[number]["id"];

export const DISCOVERY_ROLES = [
  "UGC Creator", "Photographer", "Videographer", "Video Editor",
  "Social Media Manager", "Content Strategist", "Graphic Designer",
  "Copywriter", "Developer", "Producer", "Talent Manager", "Media Buyer",
  "Creative Director", "Influencer", "Content Creator", "Motion Designer",
  "Animator", "Brand Designer", "Art Director", "Editor",
] as const;

export const DISCOVERY_TIMING = [
  { id: "asap",         label: "ASAP" },
  { id: "1_2_weeks",    label: "In 1–2 weeks" },
  { id: "this_month",   label: "This month" },
  { id: "next_month",   label: "Next month" },
  { id: "exploring",    label: "Just exploring" },
] as const;

export const DISCOVERY_BUDGET = [
  { id: "under_15k",    label: "Under AED 15k / mo" },
  { id: "15k_25k",      label: "AED 15k – 25k / mo" },
  { id: "25k_45k",      label: "AED 25k – 45k / mo" },
  { id: "45k_plus",     label: "AED 45k+ / mo" },
  { id: "need_guidance", label: "Need guidance" },
] as const;

export const DISCOVERY_INDUSTRIES = [
  "F&B", "Beauty", "Fashion", "Hospitality", "Real estate",
  "Consumer & retail", "Tech", "Health & wellness", "Other",
] as const;

export const ADVISOR_CONTACT_METHODS = [
  { id: "call",     label: "Call",     icon: "📞" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬" },
  { id: "email",    label: "Email",    icon: "✉️" },
] as const;

export const ADVISOR_TIMING = [
  { id: "today",     label: "Today" },
  { id: "tomorrow",  label: "Tomorrow" },
  { id: "this_week", label: "This week" },
] as const;

// ─── Types ───

export interface DiscoveryBriefData {
  primaryObjective: string;
  requestedRoles: string[];
  startTiming: string;
  budgetRange: string;
  companyName: string;
  industry: string;
  notes?: string;
  advisorRequested?: boolean;
}

export interface AdvisorRequestData {
  contactMethod: string;
  preferredTiming: string;
  note?: string;
  source?: string; // where in the flow they clicked
}

// ─── Mapping helpers ───

/** Map discovery objective → campaign objective for CampaignSetupBoard prefill */
export function mapObjectiveToCampaign(obj: string): string | null {
  const map: Record<string, string> = {
    brand_build: "awareness",
    content_growth: "engagement",
    campaign_launch: "awareness",
    ugc_shortform: "engagement",
    web_app: "traffic",
    influencer: "awareness",
    paid_media: "conversions",
  };
  return map[obj] ?? null;
}

/** Map discovery timing → BookingModal startDate */
export function mapTimingToStartDate(timing: string): string {
  const map: Record<string, string> = {
    asap: "ASAP",
    "1_2_weeks": "Within 2 weeks",
    this_month: "Within 2 weeks",
    next_month: "Next month",
    exploring: "Flexible",
  };
  return map[timing] ?? "Flexible";
}

/** Map discovery budget → BookingModal budget display */
export function mapBudgetToDisplay(budget: string): string {
  const found = DISCOVERY_BUDGET.find((b) => b.id === budget);
  return found?.label ?? "";
}

/** Get label for any discovery field ID */
export function getObjectiveLabel(id: string): string {
  return DISCOVERY_OBJECTIVES.find((o) => o.id === id)?.label ?? id;
}
export function getTimingLabel(id: string): string {
  return DISCOVERY_TIMING.find((t) => t.id === id)?.label ?? id;
}
export function getBudgetLabel(id: string): string {
  return DISCOVERY_BUDGET.find((b) => b.id === id)?.label ?? id;
}
