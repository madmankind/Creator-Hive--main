/**
 * Editorial source definitions — RSS feeds for Culture ingestion.
 *
 * Balanced across 7 display categories:
 *   Beauty / skincare / wellness — highest priority
 *   Fashion / luxury / streetwear
 *   Creator economy / influencer launches
 *   Lifestyle / design / objects
 *   Social commerce / retail / platform shifts
 *   Tech / wearables / consumer devices
 *   UAE / GCC cultural commerce
 *
 * feedTier determines content placement:
 *   hero    → eligible for cover story + trending rail
 *   primary → story grid + secondary cards
 *   brief   → compact briefs / lower rail
 */

export type FeedTier = "hero" | "primary" | "brief";

export type SourceDef = {
  slug: string;
  name: string;
  feedUrl: string;
  siteUrl: string;
  category: string;
  tags: string[];
  tier: FeedTier;
};

export const EDITORIAL_SOURCES: SourceDef[] = [
  // ── BEAUTY / WELLNESS ──
  {
    slug: "glossy", name: "Glossy",
    feedUrl: "https://www.glossy.co/feed/", siteUrl: "https://www.glossy.co",
    category: "beauty", tags: ["beauty", "brands", "creator-products", "social-commerce"], tier: "hero",
  },
  {
    slug: "allure", name: "Allure",
    feedUrl: "https://www.allure.com/feed/rss", siteUrl: "https://www.allure.com",
    category: "beauty", tags: ["beauty", "skincare", "wellness"], tier: "hero",
  },

  // ── FASHION / LUXURY / STREETWEAR ──
  {
    slug: "vogue", name: "Vogue",
    feedUrl: "https://www.vogue.com/feed/rss", siteUrl: "https://www.vogue.com",
    category: "fashion", tags: ["fashion", "beauty", "lifestyle", "brands"], tier: "hero",
  },
  {
    slug: "highsnobiety", name: "Highsnobiety",
    feedUrl: "https://www.highsnobiety.com/feeds/rss", siteUrl: "https://www.highsnobiety.com",
    category: "streetwear", tags: ["fashion", "brands", "lifestyle", "creator-products"], tier: "hero",
  },
  {
    slug: "gq", name: "GQ",
    feedUrl: "https://www.gq.com/feed/rss", siteUrl: "https://www.gq.com",
    category: "style", tags: ["fashion", "beauty", "lifestyle"], tier: "hero",
  },
  {
    slug: "hypebeast", name: "Hypebeast",
    feedUrl: "https://hypebeast.com/feed", siteUrl: "https://hypebeast.com",
    category: "streetwear", tags: ["fashion", "brands", "lifestyle", "creator-products"], tier: "hero",
  },
  {
    slug: "dazed", name: "Dazed",
    feedUrl: "https://www.dazeddigital.com/rss", siteUrl: "https://www.dazeddigital.com",
    category: "fashion", tags: ["fashion", "culture", "lifestyle", "brands"], tier: "primary",
  },
  {
    slug: "wwd", name: "WWD",
    feedUrl: "https://wwd.com/feed", siteUrl: "https://wwd.com",
    category: "fashion", tags: ["fashion", "brands", "beauty"], tier: "primary",
  },
  {
    slug: "business-of-fashion", name: "Business of Fashion",
    feedUrl: "https://www.businessoffashion.com/feed", siteUrl: "https://www.businessoffashion.com",
    category: "brands", tags: ["fashion", "brands", "creator-economy", "social-commerce"], tier: "primary",
  },

  // ── CREATOR ECONOMY / INFLUENCER ──
  {
    slug: "tubefilter", name: "Tubefilter",
    feedUrl: "https://www.tubefilter.com/feed/", siteUrl: "https://www.tubefilter.com",
    category: "creator-economy", tags: ["creator-economy", "platform-update", "social-commerce"], tier: "primary",
  },
  {
    slug: "passionfruit", name: "Passionfruit",
    feedUrl: "https://passionfru.it/feed/", siteUrl: "https://passionfru.it",
    category: "creator-economy", tags: ["creator-economy", "platform-update", "creators", "social-media"], tier: "primary",
  },
  {
    slug: "social-media-today", name: "Social Media Today",
    feedUrl: "https://www.socialmediatoday.com/feeds/news/", siteUrl: "https://www.socialmediatoday.com",
    category: "platform-update", tags: ["platform-update", "social-media", "creator-economy", "marketing"], tier: "primary",
  },
  {
    slug: "creatoriq", name: "CreatorIQ",
    feedUrl: "https://www.creatoriq.com/blog/rss.xml", siteUrl: "https://www.creatoriq.com",
    category: "creator-economy", tags: ["creator-economy", "influencer-marketing", "measurement", "brands"], tier: "brief",
  },
  {
    slug: "upfluence", name: "Upfluence",
    feedUrl: "https://www.upfluence.com/feed", siteUrl: "https://www.upfluence.com",
    category: "creator-economy", tags: ["creator-economy", "influencer-marketing", "affiliate", "social-commerce"], tier: "brief",
  },

  // ── SOCIAL COMMERCE / RETAIL ──
  {
    slug: "modern-retail", name: "Modern Retail",
    feedUrl: "https://www.modernretail.co/feed/", siteUrl: "https://www.modernretail.co",
    category: "social-commerce", tags: ["social-commerce", "platform-update", "brands", "creator-products"], tier: "primary",
  },

  // ── TECH / CONSUMER DEVICES / CULTURE-RELEVANT ──
  {
    slug: "the-verge", name: "The Verge",
    feedUrl: "https://www.theverge.com/rss/index.xml", siteUrl: "https://www.theverge.com",
    category: "tech", tags: ["tech", "wearables", "consumer-tech", "creator-economy"], tier: "primary",
  },
  {
    slug: "wired", name: "Wired",
    feedUrl: "https://www.wired.com/feed/rss", siteUrl: "https://www.wired.com",
    category: "tech", tags: ["tech", "culture", "consumer-tech", "lifestyle"], tier: "primary",
  },
  {
    slug: "fast-company", name: "Fast Company",
    feedUrl: "https://www.fastcompany.com/latest/rss", siteUrl: "https://www.fastcompany.com",
    category: "brands", tags: ["brands", "creator-economy", "tech", "social-commerce"], tier: "primary",
  },

  // ── UAE / GCC ──
  {
    slug: "vogue-arabia", name: "Vogue Arabia",
    feedUrl: "https://en.vogue.me/feed/rss", siteUrl: "https://en.vogue.me",
    category: "fashion", tags: ["fashion", "beauty", "gcc", "lifestyle"], tier: "hero",
  },
  {
    slug: "campaign-me", name: "Campaign Middle East",
    feedUrl: "https://campaignme.com/feed/", siteUrl: "https://campaignme.com",
    category: "brands", tags: ["gcc", "campaigns", "brands", "creator-economy"], tier: "primary",
  },

  // ── ADVERTISING / BRAND PARTNERSHIPS ──
  {
    slug: "adweek", name: "Adweek",
    feedUrl: "https://www.adweek.com/feed/", siteUrl: "https://www.adweek.com",
    category: "brands", tags: ["campaigns", "brands", "creator-economy", "social-commerce"], tier: "brief",
  },

  // ── SOCIAL CULTURE / VIRAL / CREATOR WORLD ──
  {
    slug: "pubity", name: "Pubity",
    feedUrl: "https://pubity.com/feed/", siteUrl: "https://pubity.com",
    category: "lifestyle", tags: ["social-trends", "creator-economy", "culture", "lifestyle", "viral"],
    tier: "hero",
  },
];
