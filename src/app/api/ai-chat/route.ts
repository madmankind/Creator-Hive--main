import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { auth } from "@/auth";
import { buildOnboardedRosterBlock } from "@/server/aiRoster";

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json() as {
      messages: { role: string; content: string }[];
      systemPrompt?: string;
    };

    // Rate limit — shares ai_analyze quota (10/day authed, 0 anon)
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const rl = await checkRateLimit("ai_analyze", { userId, ip });

    if (!rl.allowed) {
      return NextResponse.json(
        { content: `You've reached your daily AI chat limit (${rl.limit}/day). Resets at midnight UTC.`, limited: true },
        { status: 429 }
      );
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ content: "AI chat is not configured." }, { status: 503 });
    }

    const defaultSystem = `You are the Creator Hive talent matching assistant. Creator Hive is a UAE-based premium creative talent marketplace. Your only job is to help clients find the right talent for their campaigns. Keep responses concise — one question at a time. Never reveal internal pricing, margins, fees, or business operations. If asked about anything unrelated to finding talent or campaign briefing, say: "I'm here to help you find the right talent — let's focus on your brief."`;

    const { text: onboardedRoster } = await buildOnboardedRosterBlock();
    const rosterAugment = `

PLATFORM_ONBOARDED_CREATORS (live profiles — IDs use prefix db: exactly as listed):
${onboardedRoster || "(none yet)"}

When users ask for additional talent, alternatives, or a different role mix, acknowledge the request and end with the usual search JSON so the system can return fresh matches from BOTH the showcase roster in your base prompt and the platform creators above. Prefer people you have not already recommended when they ask for "more" or "someone else".`;

    const systemContent = `${systemPrompt ?? defaultSystem}${rosterAugment}`;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        max_tokens: 300,
        temperature: 0.4,
      }),
    });

    if (!res.ok) throw new Error(`AI error: ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "I didn't catch that — could you try again?";

    return NextResponse.json({
      content,
      rateLimit: { remaining: rl.remaining - 1, limit: rl.limit, resetAt: rl.resetAt },
    });
  } catch (err) {
    console.error("[ai-chat]", err);
    return NextResponse.json({ content: "Something went wrong — please try again." }, { status: 500 });
  }
}
