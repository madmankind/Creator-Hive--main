import { db } from "@/server/db";

export type CultureStory = {
  id: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  canonicalUrl: string;
  category: string | null;
  displayCategory: string;
  aiSummary: string | null;
  publishedAt: Date | null;
  sourceName: string;
  sourceSlug: string;
  sourceTier: string;
  tags: string[];
  aiRelevance: number | null;
};

/**
 * 7 display categories for Culture. Everything maps into one of these.
 * "Global" is the unfiltered mixed view.
 */
export const CULTURE_CATEGORIES = [
  "Global", "Fashion", "Beauty", "Lifestyle", "Tech", "Creator Economy", "UAE",
] as const;
export type CultureCategory = (typeof CULTURE_CATEGORIES)[number];

/** Map raw AI category + tags → one of the 7 display categories */
function toDisplayCategory(rawCat: string | null, tags: string[]): string {
  const cat = rawCat?.toLowerCase() ?? "";
  const tagStr = tags.join(" ").toLowerCase();

  // UAE / GCC
  if (cat === "gcc" || /gcc|dubai|saudi|uae|arab|middle.east|qatar|bahrain|oman|kuwait/.test(tagStr)) return "UAE";
  // Creator Economy (includes social commerce, platform updates, creator/influencer signals, viral social trends with creator angle)
  if (cat === "creator economy" || cat === "social commerce" || cat === "platform update" ||
      /creator|influencer|youtube|tiktok.*creator|dtc|direct.to.consumer|social.*commerce|platform|viral.*brand|social.*trend/.test(tagStr)) return "Creator Economy";
  // Tech
  if (/wearable|smart.*watch|consumer.*tech|headphone|gadget|ai\b|device|app\b/.test(tagStr)) return "Tech";
  // Beauty (includes skincare, wellness, fragrance)
  if (cat === "beauty" || /beauty|skincare|skin.*care|makeup|fragrance|cosmetic|wellness|self.care|supplement/.test(tagStr)) return "Beauty";
  // Lifestyle (includes luxury, design, objects, culture moments, social/viral culture, entertainment with cultural signal)
  if (cat === "lifestyle" || cat === "culture" || cat === "brands" || cat === "entertainment" ||
      /lifestyle|home|travel|food|design|interior|object|ceramic|furniture|luxury|hospitality|viral|meme|social.*moment|youth.*culture|pop.*culture/.test(tagStr)) return "Lifestyle";
  // Fashion (default for fashion, streetwear, style, drops)
  if (cat === "fashion" || cat === "streetwear" || cat === "style" || cat === "drops" ||
      /fashion|runway|collection|sneaker|menswear|streetwear|apparel/.test(tagStr)) return "Fashion";
  return "Lifestyle"; // wildcard fallback
}

/**
 * Priority weighting for Global view (per brief):
 * 1. Beauty/skincare/wellness  2. Fashion/luxury  3. Creator economy
 * 4. Lifestyle/design  5. Social commerce  6. Tech  7. UAE
 */
const CATEGORY_WEIGHT: Record<string, number> = {
  "Beauty": 1.25,
  "Fashion": 1.0,
  "Creator Economy": 1.15,
  "Lifestyle": 1.05,
  "Tech": 0.95,
  "UAE": 0.9,
};

/** Max items per display category in Global view to prevent any single category from dominating */
const CATEGORY_CAP_GLOBAL = 6;
/** Max items from one publisher in first visible screen */
const SOURCE_CAP_FIRST_SCREEN = 2;
/** Max consecutive stories from the same display category */
const MAX_CONSECUTIVE_SAME = 2;

type ScoredItem = {
  item: {
    id: string; title: string; excerpt: string | null; imageUrl: string | null;
    canonicalUrl: string; category: string | null; aiSummary: string | null;
    publishedAt: Date | null; tags: string[]; aiRelevance: number | null;
    source: { name: string; slug: string; tier: string };
  };
  displayCategory: string;
  score: number;
};

/**
 * Fetch Culture stories with optional category filter.
 * When category is "Global" or omitted: returns a diversity-balanced mix.
 * When a specific category: returns only that category, sorted by score.
 */
export async function getCultureStories(
  limit = 24,
  category: CultureCategory | string = "Global",
): Promise<CultureStory[]> {
  try {
    const items = await db.editorialItem.findMany({
      where: { status: { in: ["ENRICHED", "PUBLISHED"] } },
      orderBy: [{ publishedAt: "desc" }],
      take: Math.min(limit * 6, 300),
      include: { source: { select: { name: true, slug: true, tier: true } } },
    });

    // Score + classify
    const scored: ScoredItem[] = items.map((item) => {
      const displayCategory = toDisplayCategory(item.category, item.tags);
      const catWeight = CATEGORY_WEIGHT[displayCategory] ?? 1.0;
      const tierBonus = item.source.tier === "hero" ? 0.12 : item.source.tier === "primary" ? 0.06 : 0;
      // Ensure social/viral hero sources compete fairly with editorial heavyweights
      const baseRelevance = item.aiRelevance ?? 0.5;
      const relevance = item.source.slug === "pubity" ? Math.max(baseRelevance, 0.55) : baseRelevance;
      const ageHours = (Date.now() - (item.publishedAt?.getTime() ?? 0)) / 3_600_000;
      const recencyDecay = Math.max(0.1, 1 - ageHours / (7 * 24));
      const imageBonus = item.imageUrl ? 0.08 : 0;
      const score = (relevance * catWeight + tierBonus + imageBonus) * (0.35 + 0.65 * recencyDecay);
      return { item, displayCategory, score };
    });

    // Filter by category if not Global
    const isGlobal = category === "Global" || !CULTURE_CATEGORIES.includes(category as CultureCategory);
    const pool = isGlobal ? scored : scored.filter(s => s.displayCategory === category);
    pool.sort((a, b) => b.score - a.score);

    // Selection with diversity constraints
    const selected: ScoredItem[] = [];
    const usedIds = new Set<string>();
    const catCounts = new Map<string, number>();
    const srcCountsFirst = new Map<string, number>();

    for (const s of pool) {
      if (selected.length >= limit) break;
      if (usedIds.has(s.item.id)) continue;

      // Global: enforce category cap
      if (isGlobal) {
        const cc = catCounts.get(s.displayCategory) ?? 0;
        if (cc >= CATEGORY_CAP_GLOBAL) continue;
      }

      // Source cap in first screen
      const isFirstScreen = selected.length < 6;
      if (isFirstScreen) {
        const sc = srcCountsFirst.get(s.item.source.slug) ?? 0;
        if (sc >= SOURCE_CAP_FIRST_SCREEN) continue;
      }

      // Consecutive-same check
      if (selected.length >= MAX_CONSECUTIVE_SAME) {
        const tail = selected.slice(-MAX_CONSECUTIVE_SAME).map(x => x.displayCategory);
        if (tail.every(c => c === s.displayCategory)) continue;
      }

      selected.push(s);
      usedIds.add(s.item.id);
      catCounts.set(s.displayCategory, (catCounts.get(s.displayCategory) ?? 0) + 1);
      if (isFirstScreen) srcCountsFirst.set(s.item.source.slug, (srcCountsFirst.get(s.item.source.slug) ?? 0) + 1);
    }

    // Backfill if constraints were too strict
    if (selected.length < limit) {
      for (const s of pool) {
        if (selected.length >= limit) break;
        if (!usedIds.has(s.item.id)) { selected.push(s); usedIds.add(s.item.id); }
      }
    }

    return selected.map(({ item, displayCategory }) => ({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      imageUrl: item.imageUrl,
      canonicalUrl: item.canonicalUrl,
      category: item.category,
      displayCategory,
      aiSummary: item.aiSummary,
      publishedAt: item.publishedAt,
      sourceName: item.source.name,
      sourceSlug: item.source.slug,
      sourceTier: item.source.tier,
      tags: item.tags,
      aiRelevance: item.aiRelevance,
    }));
  } catch (err) {
    console.error("[culture] Failed to fetch stories:", err);
    return [];
  }
}
