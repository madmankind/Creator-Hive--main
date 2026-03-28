import type { DiscoveryBrief } from "@prisma/client";

/** Human-readable block appended to AI search / ranking prompts from stored brief + fit profile. */
export function formatClientFitForMatching(
  brief: Pick<
    DiscoveryBrief,
    "primaryObjective" | "requestedRoles" | "industry" | "notes" | "clientFitProfile"
  >,
): string {
  const lines: string[] = [];
  if (brief.primaryObjective?.trim()) lines.push(`Objective: ${brief.primaryObjective.trim()}`);
  if (brief.requestedRoles?.length) lines.push(`Roles needed: ${brief.requestedRoles.join(", ")}`);
  if (brief.industry?.trim()) lines.push(`Industry: ${brief.industry.trim()}`);
  const fit = brief.clientFitProfile;
  if (fit && typeof fit === "object" && !Array.isArray(fit)) {
    const o = fit as Record<string, unknown>;
    const pick = (k: string) => (typeof o[k] === "string" ? (o[k] as string).trim() : "");
    const arr = (k: string) => (Array.isArray(o[k]) ? (o[k] as unknown[]).map(String).filter(Boolean) : []);
    if (pick("howWorkRuns")) lines.push(`Client work style: ${pick("howWorkRuns")}`);
    if (pick("workKind")) lines.push(`Deliverable focus: ${pick("workKind")}`);
    if (pick("pace")) lines.push(`Pace: ${pick("pace")}`);
    if (pick("feedbackStyle")) lines.push(`Feedback rhythm: ${pick("feedbackStyle")}`);
    const setup = arr("setup");
    if (setup.length) lines.push(`Logistics: ${setup.join(", ")}`);
    if (pick("engagement")) lines.push(`Engagement: ${pick("engagement")}`);
    if (pick("finalNotes")) lines.push(`Client notes: ${pick("finalNotes")}`);
  }
  if (brief.notes?.trim()) lines.push(`Brief notes: ${brief.notes.trim().slice(0, 1500)}`);
  return lines.join("\n");
}
