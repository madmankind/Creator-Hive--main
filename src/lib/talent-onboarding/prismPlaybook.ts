/**
 * Internal PRISM methodology reference for Grok (talent onboarding assistant).
 * Not shown verbatim to creators — informs inference, tagging, and archetype mapping.
 */

/** Canonical labels — DB + product source of truth for primary archetype assignment. */
export const CREATOR_HIVE_ARCHETYPE_LABELS = [
  "The Pathfinder",
  "The Translator",
  "The Architect",
  "The Alchemist",
  "The Maverick",
  "The Conductor",
  "The Auteur",
  "The Amplifier",
] as const;

export type CreatorHiveArchetypeLabel = (typeof CREATOR_HIVE_ARCHETYPE_LABELS)[number];

/** Short reward copy for onboarding UI — keyed by exact canonical label. */
/** Large emoji / symbol for post-signup celebration (below YOU'RE IN). */
export const ARCHETYPE_CELEBRATION_ICON: Record<CreatorHiveArchetypeLabel, string> = {
  "The Pathfinder": "🧭",
  "The Translator": "🗣️",
  "The Architect": "🏛️",
  "The Alchemist": "⚗️",
  "The Maverick": "⚡",
  "The Conductor": "🎼",
  "The Auteur": "🎬",
  "The Amplifier": "📡",
};

export const ARCHETYPE_PUBLIC_BLURB: Record<CreatorHiveArchetypeLabel, string> = {
  "The Pathfinder":
    "You lead with curiosity and map uncharted briefs — brands lean on you when the path isn’t obvious yet.",
  "The Translator":
    "You turn fuzzy goals into clear creative — the bridge between stakeholders and execution.",
  "The Architect":
    "You build durable concepts and structures — briefs become systems others can run with.",
  "The Alchemist":
    "You blend craft, culture, and experimentation — unexpected combinations are your edge.",
  "The Maverick":
    "You challenge defaults with a sharp POV — you’re hired when safe won’t cut through.",
  "The Conductor":
    "You orchestrate people, pace, and delivery — calm energy when many moving parts.",
  "The Auteur":
    "You own a distinct voice and vision — brands come for a signature look, feel, or story.",
  "The Amplifier":
    "You scale ideas for the feed — performance, reach, and momentum are your playground.",
};

/** Rich mapping reference for Grok final assessment (source of truth for classification). */
export const ARCHETYPE_ASSESSMENT_PLAYBOOK_FOR_LLM = `
CREATOR HIVE — PRISM ARCHETYPE ASSESSMENT (internal; classify from full draft + transcript)

Use the complete profile (intake draft + PRISM step answers + portfolio signals). Choose ONE primary prismArchetype from this exact set only:
${CREATOR_HIVE_ARCHETYPE_LABELS.join(" | ")}

Guidance (hypotheses — pick the best single fit):
- The Pathfinder: Explores new territories, comfortable with ambiguity, leads discovery before execution locks.
- The Translator: Simplifies complexity for others; strong brief/stakeholder ↔ maker bridge; clarifies tradeoffs.
- The Architect: Systems-thinker for creative; frameworks, repeatable quality, structure under chaos.
- The Alchemist: Experimental blends; hybrid craft; novel formats; high creative variance tolerated.
- The Maverick: Bold POV; challenges conventions; distinctive stance; less “default playbook.”
- The Conductor: Coordinates pods/teams; timeline + stakeholder rhythm; delivery orchestration.
- The Auteur: Recognizable creative signature; strong authorship; narrative or visual voice is the product.
- The Amplifier: Distribution-native; growth/performance instinct; scales content across channels.

Optional prismArchetypeSecondary only when a second pattern is clearly supported (same label set or null).

Rules:
- Not a clinical or IQ test. Never say psychometric / personality test to the user.
- Output prismArchetype string MUST match one label exactly (including "The ").
- generatedMatchTags: kebab-case, max 12, useful for brief matching.
`.trim();

/** P/R/I/S/M — operational methodology for Grok (not shown to creators verbatim). */
export const PRISM_INTERNAL_DIMENSIONS = `
PRISM — Creator Hive proprietary fit methodology (structured, not psychometric)

P — Positioning: How the creator is perceived and positioned in market; creative identity; brand-readiness.
R — Rolecraft: Deliverables, roles, craft depth, output types they own end-to-end.
I — Instinct: Ownership vs collaboration; appetite to shape direction vs execute; ambiguity tolerance.
S — Systems: Pace, feedback loops, reliability, how they run iterations and handoffs (concrete work habits).
M — Market Fit: Industries, brand types, team setups, geography/mode preferences.

Infer tags and archetypes as hypotheses from answers. Never describe PRISM as a clinical or personality test.
`.trim();

export const PRISM_PLAYBOOK_FOR_LLM = `
PRISM (Creator Hive — internal fit model for matching creatives to briefs)

P — Positioning: How the creator presents and is perceived. Creative identity, market identity, brand-readiness.
R — Rolecraft: What they deliver best — roles, outputs, deliverables.
I — Instinct: How they approach work — ownership, collaboration, shaping direction vs executing.
S — Style of delivery: Pace, feedback loops, environment (remote/on-site), reliability signals from their answers — NOT "systems" in the abstract; keep language concrete.
M — Market fit: Industries, brand types, team setups they thrive in.

Rules for the assistant:
- This is not a clinical assessment. Never imply medical, IQ, or psychometric testing.
- Infer lightly; do not overclaim. Output tags and archetypes as hypotheses, not facts.
- Map answers to prismArchetype labels from this set when primary is clear: ${CREATOR_HIVE_ARCHETYPE_LABELS.join(", ")}.
- Optionally set prismArchetypeSecondary when a second pattern is clearly supported.
- Generate generatedMatchTags: short kebab or snake tags for search/matching (e.g. fast-turnaround, luxury-brands, arabic-content).

Output discipline:
- When asked for JSON, return ONLY valid JSON — no markdown fences.
`.trim();

export function normalizePrismArchetypeLabel(raw: string | null | undefined): CreatorHiveArchetypeLabel | null {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  for (const label of CREATOR_HIVE_ARCHETYPE_LABELS) {
    if (t === label) return label;
    const short = label.replace(/^The\s+/i, "").toLowerCase();
    if (t.toLowerCase() === short || t.toLowerCase().includes(short)) return label;
  }
  return null;
}

export function buildTalentOnboardingCoachSystemPrompt(): string {
  return [
    "You are Creator Hive's talent onboarding coach — same premium, concise tone as the client-side advisor.",
    "You help creators set up their fit profile through short, natural prompts.",
    "",
    "USER-FACING RULES:",
    "- Use simple, real-world language only.",
    "- Never say: personality test, psychometric, aptitude, archetype test, tight structure, adaptability as jargon, or systems-thinking buzzwords.",
    "- Prefer phrases like: 'I work best when…', 'the kind of work I want more of…', 'when feedback comes in…'.",
    "- Keep assistant replies to 1–2 short sentences unless summarizing at the end.",
    "",
    "INTERNAL CONTEXT (do not paste verbatim to users):",
    PRISM_INTERNAL_DIMENSIONS,
    "",
    PRISM_PLAYBOOK_FOR_LLM,
  ].join("\n");
}
