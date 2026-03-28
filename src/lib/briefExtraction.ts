import { z } from "zod";

/** Grok returns this shape (JSON only). */
export const ExtractedBriefSchema = z.object({
  brandOrProjectName: z.string().optional(),
  objective: z.string().optional(),
  deliverables: z.union([z.string(), z.array(z.string())]).optional(),
  targetAudience: z.string().optional(),
  platforms: z.union([z.string(), z.array(z.string())]).optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  missingOrUnclear: z.array(z.string()).optional(),
  /** Primary user-facing message: summary + follow-up questions, advisor tone */
  followUpMessage: z.string(),
});

export type ExtractedBrief = z.infer<typeof ExtractedBriefSchema>;

export function extractedToBriefPayload(ex: ExtractedBrief): {
  primaryObjective: string;
  requestedRoles: string[];
  startTiming: string;
  budgetRange: string;
  companyName: string;
  industry: string;
  notes: string;
  currentStep: number;
  completed: boolean;
} {
  const del = ex.deliverables;
  const rolesFromDeliverables =
    typeof del === "string"
      ? del
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 8)
      : Array.isArray(del)
        ? del.map((s) => s.trim()).filter(Boolean).slice(0, 8)
        : [];

  const plat = ex.platforms;
  const platformStr =
    typeof plat === "string"
      ? plat
      : Array.isArray(plat)
        ? plat.join(", ")
        : "";

  const notesLines = [
    ex.targetAudience ? `Audience: ${ex.targetAudience}` : null,
    platformStr ? `Platforms: ${platformStr}` : null,
    ex.missingOrUnclear?.length
      ? `Open items: ${ex.missingOrUnclear.join("; ")}`
      : null,
  ].filter(Boolean);

  return {
    companyName: ex.brandOrProjectName?.trim() ?? "",
    primaryObjective: ex.objective?.trim() ?? "",
    requestedRoles: rolesFromDeliverables.length ? rolesFromDeliverables : [],
    startTiming: ex.timeline?.trim() ?? "",
    budgetRange: ex.budget?.trim() ?? "",
    industry: "",
    notes: notesLines.join("\n"),
    currentStep: 3,
    completed: true,
  };
}

export const BRIEF_EXTRACTION_SYSTEM = `You are a senior strategist at Creator Hive (UAE creative talent marketplace). The user uploaded a campaign or project brief (plain text extracted from a file).

Extract structured fields and respond with a single JSON object only — no markdown, no prose outside JSON.

JSON schema:
{
  "brandOrProjectName": string | omit,
  "objective": string | omit,
  "deliverables": string OR string[] | omit,
  "targetAudience": string | omit,
  "platforms": string OR string[] | omit,
  "timeline": string | omit,
  "budget": string | omit,
  "missingOrUnclear": string[] (field names or short gaps, e.g. "budget not stated"),
  "followUpMessage": string (required — warm, concise: confirm what you understood in 2–4 short bullets or sentences, then ask 1–3 specific follow-up questions inline for anything vague or missing; same tone as a premium advisor chat)
}

Rules:
- Never invent concrete budget numbers; only include budget if clearly stated.
- If the document is empty or unreadable, set followUpMessage to ask for a clearer file or paste, and missingOrUnclear to describe the issue.
- Keep followUpMessage under ~180 words.`;
