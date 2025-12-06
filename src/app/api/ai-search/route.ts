// src/app/api/ai-search/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { query, roles } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }
    // Allow search with just roles selected (no query text required)
    if ((!query || typeof query !== "string" || query.trim().length === 0) && 
        (!roles || !Array.isArray(roles) || roles.length === 0)) {
      return NextResponse.json(
        { error: "Please provide either a campaign brief or select talent roles." },
        { status: 400 }
      );
    }

    const system = `
You are a matching assistant for a creator marketplace.
You will read a user brief and selected talent roles.
You MUST produce a well-structured JSON containing:
- "interpretedBrief": concise understanding of the need,
- "primaryRoles": ranked 1..N from the given roles that fit best,
- "secondaryKeywords": list of niche/industry/skills inferred from the brief,
- "searchDSL": an internal AND/OR query string (simple) we can use later.
Keep it short, consistent, and valid JSON.
`;

    const user = `
Brief: ${query || "No specific brief provided - general talent search"}
Selected Roles: ${Array.isArray(roles) ? roles.join(", ") : "None selected"}
`;

    // For demo purposes, return a mock response if OpenAI quota is exceeded
    // In production, you'd handle this more gracefully
    const mockResponse = {
      interpretedBrief: `Looking for ${roles?.length ? roles.join(', ') : 'talent'} for: ${query || 'general project'}`,
      primaryRoles: Array.isArray(roles) ? roles.slice(0, 3) : [],
      secondaryKeywords: ["creative", "professional", "experienced"],
      searchDSL: `(${query || 'talent'}) AND (${Array.isArray(roles) ? roles.join(' OR ') : 'any'})`
    };

    // Try OpenAI first, fallback to mock
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (!response.ok) {
        console.log("OpenAI API unavailable, using mock response");
        return NextResponse.json({
          ok: true,
          query,
          roles,
          ai: mockResponse,
          source: "mock"
        });
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content?.trim?.() ?? "{}";

      let parsed: unknown = null;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { raw: content };
      }

      return NextResponse.json({
        ok: true,
        query,
        roles,
        ai: parsed,
        source: "openai"
      });
    } catch (error) {
      console.log("OpenAI error, using mock response:", error);
      return NextResponse.json({
        ok: true,
        query,
        roles,
        ai: mockResponse,
        source: "mock"
      });
    }
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
