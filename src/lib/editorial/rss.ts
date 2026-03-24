import RSSParser from "rss-parser";
import { gunzipSync } from "node:zlib";

export type RSSItem = {
  title: string;
  link: string;
  pubDate?: string;
  content?: string;      // description / content:encoded (truncated)
  creator?: string;
  categories?: string[];
  enclosure?: { url: string };
  "media:content"?: { $: { url: string } };
};

const parser = new RSSParser({
  timeout: 12_000,
  headers: {
    "User-Agent": "CreatorHive/1.0 (editorial-ingestion)",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
  customFields: {
    item: [
      ["media:content", { keepArray: false }],
      ["media:thumbnail", { keepArray: false }],
    ],
  },
});

/** Extract best available image URL from an RSS item */
function extractImage(item: Record<string, unknown>): string | null {
  // 1) media:thumbnail (Condé Nast feeds)
  const thumb = item["media:thumbnail"] as { $?: { url?: string } } | undefined;
  if (thumb?.$?.url) return thumb.$.url;
  // 2) media:content
  const media = item["media:content"] as { $?: { url?: string } } | undefined;
  if (media?.$?.url) return media.$.url;
  // 3) enclosure
  const enc = item.enclosure as { url?: string } | undefined;
  if (enc?.url) return enc.url;
  // 4) og:image from content (quick regex on HTML snippet)
  const content = (item.content ?? item["content:encoded"] ?? "") as string;
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
  if (imgMatch?.[1]) return imgMatch[1];
  return null;
}

/** Truncate to ~280 chars for excerpt, strip HTML */
function cleanExcerpt(raw: string | undefined): string | null {
  if (!raw) return null;
  const text = raw.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return text.length > 280 ? text.slice(0, 277) + "…" : text;
}

export async function fetchFeed(feedUrl: string): Promise<RSSItem[]> {
  let feed;
  try {
    feed = await parser.parseURL(feedUrl);
  } catch {
    // Fallback: fetch with gzip decompression (some feeds serve compressed without negotiation)
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "CreatorHive/1.0", "Accept-Encoding": "gzip, deflate" },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const xml = buf[0] === 0x1f && buf[1] === 0x8b ? gunzipSync(buf).toString("utf-8") : buf.toString("utf-8");
    feed = await parser.parseString(xml);
  }
  return (feed.items ?? []).map((item) => {
    const raw = item as unknown as Record<string, unknown>;
    return {
      title: item.title ?? "(untitled)",
      link: item.link ?? "",
      pubDate: item.pubDate ?? item.isoDate,
      content: cleanExcerpt(
        (item.contentSnippet ?? item.content ?? raw["content:encoded"]) as string | undefined,
      ),
      creator: item.creator ?? (raw["dc:creator"] as string | undefined) ?? undefined,
      categories: item.categories ?? [],
      enclosure: item.enclosure as RSSItem["enclosure"],
      "media:content": raw["media:content"] as RSSItem["media:content"],
      _imageUrl: extractImage(raw),
    };
  }) as (RSSItem & { _imageUrl: string | null })[];
}
