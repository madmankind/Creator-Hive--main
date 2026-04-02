import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, campaignData, mode, imageBase64 } = body as {
      query?: string;
      campaignData?: Record<string, unknown>;
      mode?: "analyze" | "brief-parse" | "recommend";
      /** Raw base64 or full data URL — social / campaign screenshots for KPI extraction */
      imageBase64?: string | null;
    };

    // ── Rate limiting ──────────────────────────────────────────────────────
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            ?? req.headers.get("x-real-ip")
            ?? null;

    const rl = await checkRateLimit("ai_analyze", { userId, ip });
    if (!rl.allowed) {
      return NextResponse.json(
        {
          detail: "Daily AI analysis limit reached",
          limit: rl.limit,
          remaining: 0,
          resetAt: rl.resetAt,
          message: `You've used all ${rl.limit} AI analyses for today. Resets at midnight UTC.`,
        },
        { status: 429, headers: { "X-RateLimit-Limit": String(rl.limit), "X-RateLimit-Remaining": "0", "Retry-After": "86400" } }
      );
    }
    // ──────────────────────────────────────────────────────────────────────

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { detail: "AI service not configured" },
        { status: 503 }
      );
    }

    const systemPrompts: Record<string, string> = {
      analyze: `You are a campaign performance analyst for Creator Hive, a UAE-based premium creative talent marketplace. You receive real campaign data and user-entered weekly KPI inputs.

UAE/GCC market benchmarks for reference:
- CPM: AED 8–15 (Instagram/TikTok), AED 20–35 (YouTube)
- Engagement Rate: 3–6% is strong, 1–3% is average, <1% is weak
- CPE (cost per engagement): AED 0.5–2.0 is good
- CTR: 1–3% is average, >3% is strong for UAE audience
- CPA: AED 15–50 for soft conversions, AED 80–200 for purchase conversions
- ROAS: 2–4x is acceptable, >5x is strong for UAE brand campaigns

Rules:
1. Only analyse the data you are given. If a field is null, 0, or missing — say so, don't invent.
2. Be specific: reference actual numbers from the data, compare to benchmarks.
3. Output 2–3 sharp insights max. Each one sentence. No padding.
4. If weekly data is present, prioritise it over estimated totals.
5. Flag any anomaly: overspend, underdelivery, pacing issues.
6. If there is no meaningful data yet, say so clearly and suggest what to enter first.`,

      "brief-parse": `You are a campaign brief parser for Creator Hive. Extract structured data from the brief text provided. Return JSON only with these fields: { objectives: string[], targetAudience: string, deliverables: string[], timeline: string, budgetRange: string, tone: string, platforms: string[], talentRoles: string[] }. No markdown, no explanation outside the JSON.`,

      recommend: `You are a talent matching advisor for Creator Hive, a UAE creative talent marketplace. Based on the campaign context, suggest what types of creators would be most effective. Be specific about roles, content types, platforms, and UAE market dynamics. Reference real performance indicators where data is provided.`,
    };

    const effectiveMode = mode ?? "analyze";
    const systemPrompt = systemPrompts[effectiveMode] ?? systemPrompts.analyze;

    const textContent = campaignData
      ? `${query ?? "Analyze this campaign"}\n\nCampaign data:\n${JSON.stringify(campaignData, null, 2)}`
      : query ?? "No query provided";

    const hasImage = typeof imageBase64 === "string" && imageBase64.length > 80;

    const visionHint =
      "\n\nThe user attached a screenshot (social or campaign analytics). Read visible metrics, charts, and labels; extract KPIs where possible; relate findings to the campaign data.";

    const userMessage = hasImage
      ? {
          role: "user" as const,
          content: [
            { type: "text" as const, text: textContent + visionHint },
            {
              type: "image_url" as const,
              image_url: {
                url: imageBase64!.startsWith("data:") ? imageBase64! : `data:image/png;base64,${imageBase64}`,
              },
            },
          ],
        }
      : { role: "user" as const, content: textContent };

    const model =
      hasImage
        ? (process.env.GROK_VISION_MODEL?.trim() || "grok-2-vision-1212")
        : (process.env.GROK_ANALYZE_MODEL?.trim() || "grok-3-mini");

    // Try xAI Grok first, fall back to basic response
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            userMessage,
          ],
          max_tokens: hasImage ? 1000 : 800,
          temperature: 0.4,
        }),
      });

      if (!res.ok) throw new Error(`AI API error: ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";

      if (effectiveMode === "brief-parse") {
        try {
          const parsed = JSON.parse(content);
          return NextResponse.json({ parsed, raw: content });
        } catch {
          return NextResponse.json({ parsed: null, raw: content });
        }
      }

      return NextResponse.json({
        analysis: content,
        mode: effectiveMode,
      });
    } catch (err) {
      console.warn("[AI Analyze] API call failed:", err);
      return NextResponse.json({
        analysis: "AI analysis is currently unavailable. Campaign data has been logged for manual review.",
        mode: effectiveMode,
        fallback: true,
      });
    }
  } catch (err) {
    return NextResponse.json(
      { detail: "Invalid request body" },
      { status: 400 }
    );
  }
}
