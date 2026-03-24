/**
 * Grok (xAI) enrichment — summary, tags, relevance scoring.
 * Processes items in batches of 5 to stay cheap.
 */

const GROK_API = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = "grok-3-mini";

type EnrichmentResult = {
  summary: string;
  tags: string[];
  category: string;
  tone: string;
  relevance: number; // 0.0–1.0
  duplicateHint: string | null;
};

export async function enrichItems(
  items: { title: string; excerpt: string | null; source: string }[],
): Promise<EnrichmentResult[]> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    console.warn("[editorial] GROK_API_KEY not set — skipping enrichment");
    return items.map(() => ({
      summary: "",
      tags: [],
      category: "uncategorized",
      tone: "unknown",
      relevance: 0.5,
      duplicateHint: null,
    }));
  }

  const systemPrompt = `You are a culture editor for Creator Hive, a premium creative talent marketplace in the UAE.
Culture covers: fashion, beauty, lifestyle, creator-led brands, influencer products, social commerce, platform updates, viral social trends, youth culture signals, and GCC/Middle East relevance.
For each article, return a JSON array with one object per item:
{
  "summary": "1-2 sentence editorial summary, max 160 chars",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "Fashion|Beauty|Lifestyle|Streetwear|Brands|Drops|Style|Culture|Creator Economy|Social Commerce|Platform Update|GCC",
  "tone": "editorial|news|opinion|review|interview|trade|social",
  "relevance": 0.0-1.0 scoring guide:
    0.8-1.0 = creator-led brands, influencer product launches, DTC beauty, fashion drops, social shopping, platform commerce, GCC culture, viral social trends with brand/product angle
    0.5-0.7 = social media moments with cultural signal, youth culture tied to consumer brands, celebrity content with clear product/brand connection
    0.2-0.4 = generic entertainment news, celebrity gossip without brand/product relevance, pure trivia
    0.0-0.2 = completely irrelevant to creator/brand/product/commerce culture,
  "duplicateHint": null or "similar to: <title>"
}
Return ONLY the JSON array. No markdown fences.`;

  const userPrompt = items
    .map(
      (it, i) =>
        `[${i}] Source: ${it.source}\nTitle: ${it.title}\nExcerpt: ${it.excerpt ?? "(none)"}`,
    )
    .join("\n\n");

  try {
    const res = await fetch(GROK_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }),
    });

    if (!res.ok) {
      console.error(`[editorial] Grok API error: ${res.status} ${await res.text()}`);
      return items.map(() => ({
        summary: "", tags: [], category: "uncategorized",
        tone: "unknown", relevance: 0.5, duplicateHint: null,
      }));
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed: EnrichmentResult[] = JSON.parse(cleaned);

    // Ensure we have exactly the right number of results
    return items.map((_, i) => parsed[i] ?? {
      summary: "", tags: [], category: "uncategorized",
      tone: "unknown", relevance: 0.5, duplicateHint: null,
    });
  } catch (err) {
    console.error("[editorial] Grok enrichment failed:", err);
    return items.map(() => ({
      summary: "", tags: [], category: "uncategorized",
      tone: "unknown", relevance: 0.5, duplicateHint: null,
    }));
  }
}
