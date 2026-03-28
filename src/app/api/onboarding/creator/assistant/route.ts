import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  ARCHETYPE_ASSESSMENT_PLAYBOOK_FOR_LLM,
  buildTalentOnboardingCoachSystemPrompt,
  normalizePrismArchetypeLabel,
} from "@/lib/talent-onboarding/prismPlaybook";

type Msg = { role: "user" | "assistant" | "system"; content: string };

async function callGrok(system: string, messages: Msg[], maxTokens: number) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) return { ok: false as const, content: "" };
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "grok-3-mini",
      messages: [{ role: "system", content: system }, ...messages],
      max_tokens: maxTokens,
      temperature: 0.35,
    }),
  });
  if (!res.ok) return { ok: false as const, content: "" };
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim() ?? "";
  return { ok: true as const, content };
}

function safeJsonParse<T>(raw: string): T | null {
  const t = raw.trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(t.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const rl = await checkRateLimit("talent_onboarding", { userId: user.id, ip });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Daily onboarding AI limit reached. Try again tomorrow." },
      { status: 429 },
    );
  }

  let body: {
    action: "welcome" | "ack" | "coach" | "finalize";
    userName?: string;
    stepId?: string;
    displayAnswer?: string;
    draft?: Record<string, unknown>;
    transcript?: { role: string; content: string }[];
    intakeDigest?: string;
    messages?: { role: "user" | "assistant"; content: string }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const baseSystem = buildTalentOnboardingCoachSystemPrompt();

  if (body.action === "welcome") {
    const name = typeof body.userName === "string" ? body.userName.trim() : "";
    const sys = `${baseSystem}\n\nTASK: Opening message only. 2 short sentences. Welcome them by name if provided. Say we're setting up their fit profile — quick and easy. No bullet points.`;
    const r = await callGrok(
      sys,
      [
        {
          role: "user",
          content: name
            ? `Creator name: ${name}. Generate welcome.`
            : "Generate welcome for a new creator.",
        },
      ],
      120,
    );
    const say = r.ok && r.content
      ? r.content
      : `Welcome${name ? `, ${name.split(" ")[0]}` : ""}. Let's set up your profile — it'll only take a few minutes.`;
    return NextResponse.json({ say, rateLimit: { remaining: rl.remaining - 1, limit: rl.limit } });
  }

  if (body.action === "ack") {
    const stepId = body.stepId ?? "";
    const ans = body.displayAnswer ?? "";
    const sys = `${baseSystem}\n\nTASK: Reply with ONLY valid JSON: {"say":"<one short warm sentence acknowledging their answer>"}.\nStep id: ${stepId}\nTheir answer summary: ${ans.slice(0, 500)}`;
    const r = await callGrok(sys, [{ role: "user", content: "Generate JSON ack." }], 120);
    const parsed = r.ok ? safeJsonParse<{ say?: string }>(r.content) : null;
    const say =
      parsed?.say ??
      (r.ok && r.content && !r.content.startsWith("{")
        ? r.content
        : "Got it — thanks. Onward.");
    return NextResponse.json({ say, rateLimit: { remaining: rl.remaining - 1, limit: rl.limit } });
  }

  if (body.action === "coach") {
    const draft = body.draft ?? {};
    const draftBlock = JSON.stringify(draft).slice(0, 6000);
    const history = (body.messages ?? []).filter(
      (m) => m.role === "user" || m.role === "assistant",
    );
    const sys = `${baseSystem}

CONTEXT — They already answered quick questions on the homepage. Facts:
${draftBlock}

Also keep in mind how UAE / GCC brand briefs typically look: tight timelines, bilingual asks, platform mixes (IG/TikTok/YouTube), performance vs brand lift, legal/compliance sensitivity.

TASK: Continue naturally in 1–2 short sentences. Coach them on fit to those briefs and clarify anything fuzzy. Do not repeat the whole playbook. No JSON unless they explicitly ask for a summary.`;

    const grokMessages: Msg[] = history.map((m) => ({
      role: m.role,
      content: m.content.slice(0, 4000),
    }));
    const r = await callGrok(sys, grokMessages, 360);
    const content =
      r.ok && r.content
        ? r.content
        : "Thanks — tell me a bit more about the brands or campaigns you'd love to work on.";
    return NextResponse.json({
      content,
      rateLimit: { remaining: rl.remaining - 1, limit: rl.limit },
    });
  }

  if (body.action === "finalize") {
    const draft = body.draft ?? {};
    const transcript = (body.transcript ?? [])
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n")
      .slice(0, 12000);

    const digest =
      typeof body.intakeDigest === "string" && body.intakeDigest.trim()
        ? body.intakeDigest.trim().slice(0, 12000)
        : "";

    const sys = `${baseSystem}

${ARCHETYPE_ASSESSMENT_PLAYBOOK_FOR_LLM}

TASK: Final JSON only. No markdown. Shape:
{
  "say": "2 sentences max — thank them; you may briefly nod to their archetype without sounding like a test result.",
  "prismArchetype": "EXACTLY one of the canonical labels listed in the assessment playbook (including the word The).",
  "prismArchetypeSecondary": "optional second canonical label or null — only if clearly supported",
  "generatedMatchTags": ["kebab-case","tags","max",12],
  "onboardingAiSummary": "one paragraph: internal fit summary + brief rationale for archetype choice",
  "workEnvironmentFit": "short phrase summarizing how they like to work with teams/brands",
  "celebrationPreferences": "one short line, max ~25 words, two vivid phrases joined by 'and' — how they prefer to work (e.g. fast-paced collabs and insight-led brand stories). For UI: 'You prefer to work in …'"
}

Use the FULL draft JSON and FULL transcript. This is the authoritative assessment pass — align archetype with playbook definitions.`;

    const r = await callGrok(
      sys,
      [
        {
          role: "user",
          content: `DRAFT JSON:\n${JSON.stringify(draft).slice(0, 8000)}\n\nSTRUCTURED_INTAKE_DIGEST:\n${digest || "(none)"}\n\nTRANSCRIPT:\n${transcript}`,
        },
      ],
      500,
    );

    const parsed = r.ok
      ? safeJsonParse<{
          say?: string;
          prismArchetype?: string;
          prismArchetypeSecondary?: string | null;
          generatedMatchTags?: string[];
          onboardingAiSummary?: string;
          workEnvironmentFit?: string;
          celebrationPreferences?: string;
        }>(r.content)
      : null;

    const rawPrimary = typeof parsed?.prismArchetype === "string" ? parsed.prismArchetype : null;
    const rawSecondary =
      typeof parsed?.prismArchetypeSecondary === "string" ? parsed.prismArchetypeSecondary : null;
    let prismArchetype = normalizePrismArchetypeLabel(rawPrimary);
    let prismArchetypeSecondary = normalizePrismArchetypeLabel(rawSecondary);
    if (!prismArchetype && rawPrimary?.trim()) {
      prismArchetype = "The Translator";
    }
    if (prismArchetypeSecondary === prismArchetype) {
      prismArchetypeSecondary = null;
    }

    const celebrationPreferences =
      typeof parsed?.celebrationPreferences === "string" && parsed.celebrationPreferences.trim()
        ? parsed.celebrationPreferences.trim().slice(0, 280)
        : null;

    return NextResponse.json({
      say:
        parsed?.say ??
        "You're all set — we'll use this to line up better-matched briefs for you.",
      prismArchetype,
      prismArchetypeSecondary,
      generatedMatchTags: Array.isArray(parsed?.generatedMatchTags)
        ? parsed!.generatedMatchTags!.slice(0, 16)
        : [],
      onboardingAiSummary: parsed?.onboardingAiSummary ?? null,
      workEnvironmentFit: parsed?.workEnvironmentFit ?? null,
      celebrationPreferences,
      rateLimit: { remaining: rl.remaining - 1, limit: rl.limit },
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
