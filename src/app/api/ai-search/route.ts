/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/ai-search/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Generate mock talent results based on AI interpretation
function generateMockResults(aiData: any, roles: string[] = []): any[] {
  // Mock talent pool - in production, this would query your database
  const mockTalents = [
    {
      creator: {
        id: "talent-1",
        name: "Sarah Al-Mansoori",
        roles: ["UGC Creator", "Content Creator", "Influencer"],
        niches: ["Luxury Fashion", "Beauty", "Lifestyle"],
      },
      score: 0.92,
    },
    {
      creator: {
        id: "talent-2",
        name: "Ahmed Hassan",
        roles: ["Videographer", "Editor", "Producer"],
        niches: ["Tech", "SaaS", "Brand Films"],
      },
      score: 0.88,
    },
    {
      creator: {
        id: "talent-3",
        name: "Layla Khoury",
        roles: ["Photographer", "Content Creator", "Designer"],
        niches: ["Hospitality", "Real Estate", "Fashion"],
      },
      score: 0.85,
    },
    {
      creator: {
        id: "talent-4",
        name: "Omar Al-Rashid",
        roles: ["Copywriter", "Strategist", "Content Creator"],
        niches: ["B2B", "Fintech", "SaaS"],
      },
      score: 0.82,
    },
    {
      creator: {
        id: "talent-5",
        name: "Maya Patel",
        roles: ["Social Media Manager", "Strategist", "Content Creator"],
        niches: ["E-commerce", "D2C", "Growth"],
      },
      score: 0.79,
    },
    {
      creator: {
        id: "talent-6",
        name: "Zain Malik",
        roles: ["Videographer", "UGC Creator", "Editor"],
        niches: ["Food & Beverage", "Consumer Electronics", "Mobile Apps"],
      },
      score: 0.76,
    },
  ];

  // Filter and score based on roles if provided
  let filtered = mockTalents;
  if (roles && roles.length > 0) {
    filtered = mockTalents.filter((t) =>
      roles.some((role) =>
        t.creator.roles.some((r: string) =>
          r.toLowerCase().includes(role.toLowerCase())
        )
      )
    );
  }

  // If AI data has primaryRoles, boost those matches
  if (aiData?.primaryRoles && Array.isArray(aiData.primaryRoles)) {
    filtered = filtered.map((t) => {
      const roleMatch = aiData.primaryRoles.some((pr: string) =>
        t.creator.roles.some((r: string) =>
          r.toLowerCase().includes(pr.toLowerCase())
        )
      );
      return {
        ...t,
        score: roleMatch ? Math.min(t.score + 0.05, 1.0) : t.score,
      };
    });
  }

  // Sort by score descending
  return filtered.sort((a, b) => b.score - a.score);
}

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
        // Generate mock results based on mock AI interpretation
        const mockResults = generateMockResults(mockResponse, roles);

        return NextResponse.json({
          ok: true,
          query,
          roles,
          ai: mockResponse,
          results: mockResults,
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

      // Generate mock results based on AI interpretation
      const mockResults = generateMockResults(parsed, roles);

      return NextResponse.json({
        ok: true,
        query,
        roles,
        ai: parsed,
        results: mockResults,
        source: "openai"
      });
    } catch (error) {
      console.log("OpenAI error, using mock response:", error);
      // Generate mock results based on mock AI interpretation
      const mockResults = generateMockResults(mockResponse, roles);

      return NextResponse.json({
        ok: true,
        query,
        roles,
        ai: mockResponse,
        results: mockResults,
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
