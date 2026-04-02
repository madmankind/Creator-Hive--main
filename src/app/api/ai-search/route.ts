import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { formatClientFitForMatching } from "@/lib/matchingFitContext";
import { getCombinedAiRoster } from "@/server/aiRoster";
import {
  coerceTalentIdList,
  extractFirstJsonObject,
  fallbackShowcaseIdsFromQuery,
  resolveTalentIds,
} from "@/lib/aiSearchMatch";

function buildSearchSystemPrompt(rosterSection: string): string {
  return `You are Creator Hive's AI talent scout. Creator Hive is a UAE-based premium creative talent marketplace.

Your job: given a natural-language brief from a brand or marketer, recommend the best matching talent from BOTH rosters below — assembled into a campaign team. IDs prefixed \`db:\` are real creators who completed onboarding on the platform; \`talent-*\` IDs are showcase roster entries.

${rosterSection}

RULES:
1. Recommend 3–6 talent IDs from the lists above that best match the brief (mix showcase + platform when both fit).
2. Return ONLY valid JSON in this exact shape — no markdown, no explanation outside the JSON:
{
  "talentIds": ["talent-xxx", "db:yyyy"],
  "teamSummary": "One sentence explaining why this team fits the brief.",
  "roles": {
    "talent-xxx": "Suggested role for this campaign",
    "db:yyyy": "Suggested role for this campaign"
  }
}
3. Only use IDs that appear in the roster text. Never invent IDs.
4. Match based on: specialisation, niche, platform, location, follower tier, brand history, and onboarding fit fields for db: creators.
5. When CLIENT_WORKFLOW_CONTEXT is present, weigh pace, feedback style, collaboration preference, logistics, and engagement type alongside roles and niche — PRISM-style fit is secondary to hard skills and category fit.
6. Prefer UAE-based talent unless the brief specifies otherwise.
7. If the brief is too vague, pick a well-rounded team spanning content creation, video, and strategy.
8. For follow-up queries (e.g. "more editors", "someone else for UGC"), still only return IDs from the roster — pick different people than an obvious prior pick when the user asks for alternatives.`;
}

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
    const model = process.env.GROK_AI_SEARCH_MODEL?.trim() || "grok-3-mini";
    return { endpoint: GROK_ENDPOINT, apiKey: grokKey, model };
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

    const { rosterSystemSection, validTalentIds } = await getCombinedAiRoster({ compact: true });
    const systemPrompt = buildSearchSystemPrompt(rosterSystemSection);

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
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        stream: false,
        temperature: 0.2,
        max_tokens: 520,
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
    const stripped = raw.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();

    const tryParse = (s: string): Record<string, unknown> | null => {
      try {
        const v = JSON.parse(s) as unknown;
        return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
      } catch {
        return null;
      }
    };

    let obj = tryParse(stripped);
    if (!obj) {
      const inner = extractFirstJsonObject(stripped);
      if (inner) obj = tryParse(inner);
    }

    let safeIds: string[] = [];
    let teamSummary = "";
    let roles: Record<string, string> = {};

    if (obj) {
      const rawIds = coerceTalentIdList(obj);
      safeIds = resolveTalentIds(rawIds, validTalentIds);
      teamSummary = typeof obj.teamSummary === "string" ? obj.teamSummary : "";
      const r = obj.roles;
      if (r && typeof r === "object" && !Array.isArray(r)) {
        roles = Object.fromEntries(
          Object.entries(r as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")]),
        );
      }
    } else {
      console.error("AI search: could not parse JSON from model:", raw.slice(0, 800));
    }

    const queryTrim = query.trim();
    if (safeIds.length === 0) {
      safeIds = fallbackShowcaseIdsFromQuery(queryTrim, validTalentIds, 6);
    }

    return NextResponse.json({
      talentIds: safeIds,
      teamSummary:
        teamSummary.trim() ||
        (safeIds.length > 0 ? "Here's a shortlist from the roster based on your brief." : ""),
      roles,
      rateLimit: { remaining: rl.remaining - 1, limit: rl.limit, resetAt: rl.resetAt },
    });
  } catch (err) {
    console.error("AI search error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
