export type OnboardingStepKind =
  | "roles_multi"
  | "role_primary"
  | "text"
  | "single"
  | "multi"
  | "rank_industries"
  | "section_transition";

export type OnboardingOption = {
  id: string;
  label: string;
  /** Maps to lucide icon in UI */
  iconKey?: "brief" | "team" | "wand" | "target" | "zap" | "calendar" | "megaphone" | "camera" | "map" | "sparkle";
};

export type OnboardingStepDef = {
  id: string;
  section: "A" | "B" | "C" | "meta";
  /** Prompt shown in the bar — plain language */
  prompt: string;
  kind: OnboardingStepKind;
  placeholder?: string;
  optional?: boolean;
  options?: OnboardingOption[];
  /** Grok hint for normalization */
  patchKeys?: string[];
};

export type TalentOnboardingDraft = {
  name: string;
  skills: string[];
  primaryRole: string;
  location: string;
  instagram: string;
  portfolioUrl: string;
  bio: string;
  yearsExperienceBand: string;
  rankedIndustries: string[];
  preferredProjectTypes: string[];
  preferredPace: string;
  feedbackStyle: string;
  workEnvironmentFit: string;
  howIWorkBest: string;
  suitedTeamScale: string;
  availabilityType: string;
  workModeOpenness: string;
  brandFitPreferences: string[];
  clientValueStrengths: string[];
  teamSetupPreference: string;
};

export function emptyTalentDraft(): TalentOnboardingDraft {
  return {
    name: "",
    skills: [],
    primaryRole: "",
    location: "",
    instagram: "",
    portfolioUrl: "",
    bio: "",
    yearsExperienceBand: "",
    rankedIndustries: [],
    preferredProjectTypes: [],
    preferredPace: "",
    feedbackStyle: "",
    workEnvironmentFit: "",
    howIWorkBest: "",
    suitedTeamScale: "",
    availabilityType: "",
    workModeOpenness: "",
    brandFitPreferences: [],
    clientValueStrengths: [],
    teamSetupPreference: "",
  };
}

export const INDUSTRY_OPTIONS = [
  "fashion",
  "beauty",
  "food & beverage",
  "hospitality",
  "luxury",
  "lifestyle",
  "tech",
  "automotive",
  "creator economy",
  "fitness",
  "healthcare",
  "real estate",
  "travel",
  "parenting",
  "finance",
  "retail",
  "entertainment",
  "education",
] as const;

export const ROLE_OPTIONS = [
  "Short-form video",
  "Long-form video",
  "UGC creator",
  "Photographer",
  "Videographer",
  "Editor",
  "Motion design",
  "Copywriter",
  "Social media",
  "Content strategy",
  "Creative direction",
  "Graphic design",
  "Brand design",
  "Producer",
  "Community",
] as const;
