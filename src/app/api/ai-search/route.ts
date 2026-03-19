import { NextRequest, NextResponse } from "next/server";
import { curatedTalent } from "@/lib/curatedTalent";

// Build a compact roster summary to inject into the AI context
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
5. Prefer UAE-based talent unless the brief specifies otherwise.
6. If the brief is too vague, pick a well-rounded team spanning content creation, video, and strategy.`;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.THAURA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI search not configured" }, { status: 503 });
    }

    const response = await fetch("https://backend.thaura.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "thaura",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Brand brief: "${query.trim()}"` },
        ],
        stream: false,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Thaura API error:", err);
      return NextResponse.json(
        { error: "AI search unavailable", detail: (err as { error?: { message?: string } })?.error?.message },
        { status: response.status }
      );
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";

    // Parse the JSON response from the AI
    let parsed: { talentIds?: string[]; teamSummary?: string; roles?: Record<string, string> };
    try {
      // Strip any markdown fences if present
      const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse Thaura response:", raw);
      return NextResponse.json({ error: "Could not parse AI response", raw }, { status: 500 });
    }

    // Validate IDs exist in roster
    const validIds = new Set(curatedTalent.map(t => t.id));
    const safeIds = (parsed.talentIds ?? []).filter(id => validIds.has(id));

    return NextResponse.json({
      talentIds: safeIds,
      teamSummary: parsed.teamSummary ?? "",
      roles: parsed.roles ?? {},
    });
  } catch (err) {
    console.error("AI search error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
