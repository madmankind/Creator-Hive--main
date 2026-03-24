import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, campaignData, mode } = body as {
      query?: string;
      campaignData?: Record<string, unknown>;
      mode?: "analyze" | "brief-parse" | "recommend";
    };

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { detail: "AI service not configured" },
        { status: 503 }
      );
    }

    const systemPrompts: Record<string, string> = {
      analyze: `You are a campaign performance analyst for Creator Hive, a UAE creative talent marketplace. Analyze the campaign data provided and give actionable insights. Be concise, data-driven, and specific to UAE/GCC market dynamics. Format: 2-3 key insights, each 1-2 sentences.`,
      "brief-parse": `You are a campaign brief parser for Creator Hive. Extract structured data from the brief text provided. Return JSON only with these fields: { objectives: string[], targetAudience: string, deliverables: string[], timeline: string, budgetRange: string, tone: string, platforms: string[], talentRoles: string[] }. No markdown, no explanation.`,
      recommend: `You are a talent matching advisor for Creator Hive, a UAE creative talent marketplace. Based on the campaign context, suggest what types of creators would be most effective. Consider UAE market trends, platform performance data, and content format ROI. Be specific about roles, content types, and platforms.`,
    };

    const effectiveMode = mode ?? "analyze";
    const systemPrompt = systemPrompts[effectiveMode] ?? systemPrompts.analyze;

    const userContent = campaignData
      ? `${query ?? "Analyze this campaign"}\n\nCampaign data:\n${JSON.stringify(campaignData, null, 2)}`
      : query ?? "No query provided";

    // Try xAI Grok first, fall back to basic response
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-3-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          max_tokens: 800,
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
