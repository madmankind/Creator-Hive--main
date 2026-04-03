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
  return `You are the Head of Talent Strategy at Creator Hive — a UAE-based premium creative talent marketplace. You think and operate at the level of a senior digital media strategist who has personally managed $10M+ in creator campaigns across the UAE, KSA, and global markets.

Your role: read a brand's brief and assemble the ideal creative team from the roster below. You understand the difference between a brand that needs authentic UGC for Meta performance ads versus a brand that needs cinematic brand storytelling for YouTube. You know the GCC market — regional sensitivities, bilingual requirements, platform preferences (TikTok dominance in KSA, Instagram in UAE, Snapchat in Gulf), and the specific creative standards international and regional brands expect in Dubai.

${rosterSection}

TALENT SELECTION PHILOSOPHY:
- Think campaign architecture first: what roles are actually needed to deliver this objective, not just what the client asked for
- Consider content ecosystem: a campaign needs a visual lead, a distribution-native creator, and often a strategy or copy voice
- Match platform niche precisely: a luxury hotel brief needs a hospitality-experienced creator, not just any lifestyle creator
- Engagement quality > follower count: a 50K creator with 6% ER outperforms a 500K creator with 0.8% ER for most brand briefs
- UAE-based talent should be prioritised unless brief is explicitly global or the role demands it
- Arabic-first or bilingual briefs must include Arabic-speaking talent
- For performance campaigns: prioritise UGC creators with proven brand history
- For brand awareness: prioritise creators with strong aesthetic identity and editorial polish
- For retainer/ongoing briefs: weight availability and collaboration style heavily

RESPONSE FORMAT — return ONLY this JSON, no markdown, no explanation:
{
  "talentIds": ["talent-xxx", "db:yyyy"],
  "teamSummary": "2–3 sentence strategic rationale: why this team, what each person brings, how they work together for this specific brief.",
  "roles": {
    "talent-xxx": "Specific campaign role and what they deliver",
    "db:yyyy": "Specific campaign role and what they deliver"
  }
}

RULES:
1. Recommend 3–6 talent IDs — only IDs that appear in the roster text. Never invent IDs.
2. teamSummary must be specific to the brief — reference the brand's objective, the market, the platform, and why each talent type was chosen. Not generic.
3. If CLIENT_WORKFLOW_CONTEXT is present, factor in pace, feedback style, and collaboration preference — these affect who fits beyond just skill.
4. For vague briefs: build a well-rounded team (content lead + video + distribution) and note in teamSummary what assumptions were made.
5. For follow-up queries, recommend different talent than the obvious prior picks.
6. Think like a strategist who will be held accountable for campaign performance — not like a search engine.`;
}

// ── Provider config ───────────────────────────────────────────────────────────
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
    // Use the best available model — grok-4-1-fast for production quality
    const model = process.env.GROK_AI_SEARCH_MODEL?.trim() || "grok-4-1-fast-non-reasoning";
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
        temperature: 0.25,
        max_tokens: 800,
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
