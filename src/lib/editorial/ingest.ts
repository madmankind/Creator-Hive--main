import { db } from "@/server/db";
import { fetchFeed, type RSSItem } from "./rss";
import { enrichItems } from "./enrich";
import { EDITORIAL_SOURCES } from "./sources";

const ENRICH_BATCH = 5;

/** Seed editorial sources if they don't exist */
export async function seedSources() {
  for (const src of EDITORIAL_SOURCES) {
    await db.editorialSource.upsert({
      where: { slug: src.slug },
      update: { feedUrl: src.feedUrl, siteUrl: src.siteUrl, name: src.name, tags: src.tags, tier: src.tier },
      create: { slug: src.slug, name: src.name, feedUrl: src.feedUrl, siteUrl: src.siteUrl, category: src.category, tags: src.tags, tier: src.tier },
    });
  }
  console.log(`[editorial] Seeded ${EDITORIAL_SOURCES.length} sources`);
}

/** Run ingestion for a single source */
async function ingestSource(sourceId: string, slug: string, feedUrl: string) {
  const run = await db.editorialRun.create({
    data: { sourceId },
  });

  let itemsFound = 0;
  let itemsNew = 0;
  let itemsSkipped = 0;

  try {
    console.log(`[editorial] Fetching ${slug}: ${feedUrl}`);
    const rawItems = await fetchFeed(feedUrl) as (RSSItem & { _imageUrl: string | null })[];
    itemsFound = rawItems.length;

    // Filter out items we already have (dedupe by canonical URL)
    const urls = rawItems.map((r) => r.link).filter(Boolean);
    const existing = await db.editorialItem.findMany({
      where: { canonicalUrl: { in: urls } },
      select: { canonicalUrl: true },
    });
    const existingSet = new Set(existing.map((e) => e.canonicalUrl));

    const newItems = rawItems.filter((r) => r.link && !existingSet.has(r.link));
    itemsSkipped = itemsFound - newItems.length;

    if (newItems.length === 0) {
      console.log(`[editorial] ${slug}: no new items (${itemsSkipped} skipped)`);
      await db.editorialRun.update({
        where: { id: run.id },
        data: { finishedAt: new Date(), itemsFound, itemsNew: 0, itemsSkipped },
      });
      await db.editorialSource.update({
        where: { id: sourceId },
        data: { lastFetchAt: new Date(), lastError: null },
      });
      return { slug, itemsFound, itemsNew: 0, itemsSkipped };
    }

    // Insert new items as PENDING
    for (const item of newItems) {
      await db.editorialItem.create({
        data: {
          sourceId,
          canonicalUrl: item.link,
          title: item.title,
          excerpt: item.content ?? null,
          imageUrl: (item as RSSItem & { _imageUrl: string | null })._imageUrl,
          author: item.creator ?? null,
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
          category: item.categories?.[0] ?? null,
          status: "PENDING",
        },
      });
      itemsNew++;
    }

    // Enrich in batches
    for (let i = 0; i < newItems.length; i += ENRICH_BATCH) {
      const batch = newItems.slice(i, i + ENRICH_BATCH);
      const enrichInput = batch.map((it) => ({
        title: it.title,
        excerpt: it.content ?? null,
        source: slug,
      }));

      const enriched = await enrichItems(enrichInput);

      for (let j = 0; j < batch.length; j++) {
        const e = enriched[j];
        if (!e) continue;
        const item = batch[j];
        // Hero-tier sources get a lower threshold (0.25) to surface more content
        // Primary/brief sources still need 0.4+
        const source = await db.editorialSource.findUnique({ where: { id: sourceId }, select: { tier: true } });
        const threshold = source?.tier === "hero" ? 0.25 : 0.4;
        const status =
          e.duplicateHint ? "DUPLICATE" : e.relevance >= threshold ? "ENRICHED" : "HIDDEN";

        await db.editorialItem.update({
          where: { canonicalUrl: item.link },
          data: {
            aiSummary: e.summary || null,
            tags: e.tags ?? [],
            category: e.category || null,
            aiTone: e.tone || null,
            aiRelevance: e.relevance ?? 0.5,
            duplicateOf: e.duplicateHint ?? null,
            status,
          },
        });
      }
    }

    await db.editorialRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), itemsFound, itemsNew, itemsSkipped },
    });
    await db.editorialSource.update({
      where: { id: sourceId },
      data: { lastFetchAt: new Date(), lastError: null },
    });

    console.log(`[editorial] ${slug}: ${itemsNew} new, ${itemsSkipped} skipped`);
    return { slug, itemsFound, itemsNew, itemsSkipped };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[editorial] ${slug} failed:`, msg);
    await db.editorialRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), itemsFound, itemsNew, itemsSkipped, error: msg },
    });
    await db.editorialSource.update({
      where: { id: sourceId },
      data: { lastError: msg },
    });
    return { slug, itemsFound, itemsNew, itemsSkipped, error: msg };
  }
}

/** Run full ingestion across all active sources */
export async function runFullIngestion() {
  await seedSources();

  const sources = await db.editorialSource.findMany({
    where: { status: "ACTIVE" },
  });

  console.log(`[editorial] Starting ingestion for ${sources.length} sources`);
  const results = [];

  for (const src of sources) {
    const result = await ingestSource(src.id, src.slug, src.feedUrl);
    results.push(result);
  }

  console.log("[editorial] Ingestion complete:", JSON.stringify(results, null, 2));
  return results;
}
