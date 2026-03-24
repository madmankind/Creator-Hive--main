/** Brief draft shape for Booking OS — persisted to localStorage and API */
export interface BriefDraft {
  roles: string[];
  objective: "Awareness" | "Growth" | "Conversions" | "Launch" | null;
  outputs: string[]; // UGC, Edited video, Photo shoot, etc.
  platforms: string[];
  industry: string | null;
  market: string | null; // UAE, KSA, GCC, Global
  language: string | null; // EN, AR, Both
  keyMessage: string | null;
  references: string[];
  timeline: "ASAP" | "This month" | "Next month" | "Flexible" | null;
  budgetRange: string | null;
}

export const BRIEF_STORAGE_KEY = "ch_brief_draft_v1";

export function createEmptyBriefDraft(): BriefDraft {
  return {
    roles: [],
    objective: null,
    outputs: [],
    platforms: [],
    industry: null,
    market: null,
    language: null,
    keyMessage: null,
    references: [],
    timeline: null,
    budgetRange: null,
  };
}
