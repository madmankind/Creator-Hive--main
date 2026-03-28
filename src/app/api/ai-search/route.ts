import { NextRequest, NextResponse } from "next/server";
import { curatedTalent } from "@/lib/curatedTalent";
import { checkRateLimit } from "@/lib/rateLimit";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { formatClientFitForMatching } from "@/lib/matchingFitContext";

// ── Roster context ────────────────────────────────────────────────────────────
// Built once at module load — server-only, never sent to the browser
function buildRosterContext(): string {
  return curatedTalent
    .map((t) => {
      const roles = [t.primaryRole, ...(t.roleTags ?? []).filter(r => r !== t.primaryRole)].join(", ");
      const bio = t.shortBio ?? t.nicheSummary ?? "";
      const brands = t.brandPartners?.slice(0, 3).join(", ") ?? "";
      return `- ID:${t.id} | Name:${t.displayName ?? t.name} | Roles:${roles} | Niche:${t.displayTitle ?? ""} | Bio:${bio.slice(0, 120)} | Brands:${brands} | Location:${t.location ?? "UAE"}`;
    })
    .join("\n");
}

const SYSTEM_PROMPT = `You are Creator Hive's AI talent scout. Creator Hive is a UAE-based premium creative talent marketplace.

Your job: given a natural-language brief from a brand or marketer, recommend the best matching talent from the Creator Hive roster below — assembled into a campaign team.

ROSTER:
${buildRosterContext()}

RULES:
1. Recommend 3–6 talent IDs from the roster that best match the brief.
2. Return ONLY valid JSON in this exact shape — no markdown, no explanation outside the JSON:
{
  "talentIds": ["talent-xxx", "talent-yyy"],
  "teamSummary": "One sentence explaining why this team fits the brief.",
  "roles": {
    "talent-xxx": "Suggested role for this campaign",
    "talent-yyy": "Suggested role for this campaign"
  }
}
3. Only use IDs that appear in the roster. Never invent IDs.
4. Match based on: specialisation, niche, platform, location, follower tier, brand history.
5. When CLIENT_WORKFLOW_CONTEXT is present, weigh pace, feedback style, collaboration preference, logistics, and engagement type alongside roles and niche — PRISM-style fit is secondary to hard skills and category fit.
6. Prefer UAE-based talent unless the brief specifies otherwise.
7. If the brief is too vague, pick a well-rounded team spanning content creation, video, and strategy.`;

// ── Provider config ───────────────────────────────────────────────────────────
// API keys are read server-side from env — never exposed to the browser.
// Grok is primary. Thaura is fallback if GROK_API_KEY is missing.
const GROK_ENDPOINT = "https://api.x.ai/v1/chat/completions";
const THAURA_ENDPOINT = "https://backend.thaura.ai/v1/chat/completions";

interface AIProvider {
  endpoint: string;
  apiKey: string;
  model: string;
}

function getProvider(): AIProvider | null {
  const grokKey = process.env.GROK_API_KEY;
  if (grokKey) {
    return { endpoint: GROK_ENDPOINT, apiKey: grokKey, model: "grok-4-1-fast" };
  }
  const thauraKey = process.env.THAURA_API_KEY;
  if (thauraKey) {
    return { endpoint: THAURA_ENDPOINT, apiKey: thauraKey, model: "thaura" };
  }
  return null;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // ── Rate limiting ────────────────────────────────────────────────────────
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            ?? req.headers.get("x-real-ip")
            ?? null;

    const rl = await checkRateLimit("ai_search", { userId, ip });
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: "Daily AI search limit reached",
          limit: rl.limit,
          remaining: 0,
          resetAt: rl.resetAt,
          message: userId
            ? `You've used all ${rl.limit} AI searches for today. Resets at midnight UTC.`
            : `Guest search limit reached (${rl.limit}/day). Sign in for more searches.`,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit":     String(rl.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset":     rl.resetAt,
            "Retry-After":           "86400",
          },
        }
      );
    }
    // ────────────────────────────────────────────────────────────────────────

    const provider = getProvider();
    if (!provider) {
      return NextResponse.json({ error: "AI search not configured" }, { status: 503 });
    }

    let workflowBlock = "";
    if (userId) {
      const u = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (u?.role === "AGENCY" || u?.role === "ADMIN") {
        const brief = await db.discoveryBrief.findUnique({ where: { userId } });
        if (brief) {
          const formatted = formatClientFitForMatching(brief);
          if (formatted.trim()) workflowBlock = formatted;
        }
      }
    }

    const userContent = workflowBlock
      ? `CLIENT_WORKFLOW_CONTEXT:\n${workflowBlock}\n\nBrand brief: "${query.trim()}"`
      : `Brand brief: "${query.trim()}"`;

    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        stream: false,
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const detail = (err as { error?: { message?: string } })?.error?.message;
      console.error(`AI search error [${provider.model}]:`, detail ?? response.status);
      return NextResponse.json(
        { error: "AI search unavailable", detail },
        { status: response.status }
      );
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";

    // Parse the JSON the model returns
    let parsed: { talentIds?: string[]; teamSummary?: string; roles?: Record<string, string> };
    try {
      const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse AI response:", raw);
      return NextResponse.json({ error: "Could not parse AI response", raw }, { status: 500 });
    }

    // Validate IDs against roster — never trust the model to invent IDs
    const validIds = new Set(curatedTalent.map(t => t.id));
    const safeIds = (parsed.talentIds ?? []).filter(id => validIds.has(id));

    return NextResponse.json({
      talentIds: safeIds,
      teamSummary: parsed.teamSummary ?? "",
      roles: parsed.roles ?? {},
      rateLimit: { remaining: rl.remaining - 1, limit: rl.limit, resetAt: rl.resetAt },
    });
  } catch (err) {
    console.error("AI search error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
