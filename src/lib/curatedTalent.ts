export type AvailabilityTag = "Hourly" | "Monthly";

export type TalentCategoryTag =
  | "UGC Creator"
  | "Content Creator"
  | "Photographer"
  | "Videographer"
  | "Copywriter"
  | "Designer"
  | "Strategist"
  | "Editor"
  | "Social Media Manager"
  | "Influencer"
  | "Producer"
  | "Other";

export type PlatformTag = "Instagram" | "TikTok" | "YouTube" | "Snapchat" | "Twitter/X" | "LinkedIn";

export type PortfolioItem = {
  type: "image" | "video";
  src: string;
  poster?: string;
  title?: string;
};

export type PrismArchetypeName = 
  | "The Maverick"
  | "The Conductor"
  | "The Pathfinder"
  | "The Translator"
  | "The Architect"
  | "The Alchemist"
  | "The Auteur"
  | "The Amplifier";

/** Short descriptions for Prism persona tooltip on hover */
export const PRISM_ARCHETYPE_DESCRIPTIONS: Record<PrismArchetypeName, string> = {
  "The Maverick": "Independent, fast-paced creator who thrives on variety and quick turnarounds.",
  "The Conductor": "Strategic orchestrator who coordinates multi-platform campaigns and team workflows.",
  "The Pathfinder": "End-to-end producer who guides projects from concept to delivery.",
  "The Translator": "B2B specialist who turns complex ideas into clear, compelling narratives.",
  "The Architect": "Structured creator who builds high-production value, scalable content systems.",
  "The Alchemist": "Visual designer who transforms brand briefs into cohesive identities and templates.",
  "The Auteur": "Luxury-focused creator with a distinct aesthetic and editorial vision.",
  "The Amplifier": "Authentic UGC creator who amplifies brand messages through relatable content.",
};

export interface CuratedTalent {
  id: string;
  name: string;                 // e.g. "Lachy Groom"
  displayTitle: string;         // e.g. "UGC Creator · Photographer"
  instagramHandle: string;      // "lachygroom"
  instagramUrl: string;         // "https://instagram.com/..." (deprecated, use links.instagram)
  tiktokUrl?: string;           // "https://tiktok.com/@..." (deprecated, use links.tiktok)
  tiktokHandle?: string;        // "@username" (deprecated)
  avatarUrl: string;            // Legacy fallback (deprecated, use profileImageUrl)
  profileImageUrl?: string;     // Preferred: uploaded avatar (admin + talent-side)
  primaryRole: TalentCategoryTag; // Required: Primary role for grouping (must exist in roleTags)
  roleTags: TalentCategoryTag[];   // max 4
  platformTags: PlatformTag[];     // e.g. ["Instagram", "TikTok", "Snapchat"]
  shortBio: string;             // 1 sentence, marketing-grade
  nicheSummary: string;         // short description of clients + niche specialization
  availability: AvailabilityTag[]; // e.g. ["Hourly", "Monthly"]
  tier?: "Tier 1" | "Tier 2";    // Optional: pricing tier (deprecated, removed from UI)
  prismArchetype: PrismArchetypeName; // Required: Prism archetype (full name)
  location?: string;
  timezone?: string;
  languages?: string[];         // optional
  featuredVideoUrl?: string;    // e.g. a portfolio reel (YouTube/Vimeo/MP4)
  portfolioImages?: string[];   // optional, for future gallery (deprecated, use portfolio)
  portfolio?: PortfolioItem[]; // Portfolio items (images/videos) - at least 3 items
  links?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    behance?: string;
    twitch?: string;
    website?: string;
  };
  followers?: number;           // Numeric follower count for discovery view
  engagementRate?: number;      // Decimal (0.045 = 4.5%)
  avgEngagement?: number;       // Average engagements per post
  interests?: string[];         // Audience interests/topics
  brandPartners?: string[];     // Notable brand work
}

export const curatedTalent: CuratedTalent[] = [
  {
    id: "talent-1",
    name: "Sarah Al-Mansoori",
    displayTitle: "UGC Creator · Content Creator",
    instagramHandle: "sarahalmansoori",
    instagramUrl: "https://instagram.com/sarahalmansoori",
    tiktokUrl: "https://tiktok.com/@sarahalmansoori",
    tiktokHandle: "@sarahalmansoori",
    avatarUrl: "https://ui-avatars.com/api/?name=Sarah+Al-Mansoori&background=3b2a4a&color=ffffff&size=80",
    primaryRole: "UGC Creator",
    roleTags: ["UGC Creator", "Content Creator", "Influencer"],
    platformTags: ["Instagram", "TikTok", "Snapchat"],
    shortBio: "Dubai-based UGC specialist creating authentic product showcases for luxury and lifestyle brands across GCC markets.",
    nicheSummary: "Specializes in luxury fashion, beauty, and lifestyle brands. Works with premium retailers and e-commerce platforms across UAE, Saudi Arabia, and Kuwait. Known for high-converting product demos and authentic storytelling.",
    availability: ["Hourly", "Monthly"],
    location: "Dubai, UAE",
    timezone: "GST (UTC+4)",
    languages: ["English", "Arabic"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    followers: 185000,
    engagementRate: 0.038,
    avgEngagement: 7030,
    interests: ["Luxury Fashion", "Beauty", "Lifestyle"],
    brandPartners: ["Chalhoub Group", "Faces", "Ounass"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Luxury Product Showcase" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Beauty Brand Campaign" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Lifestyle UGC" },
    ],
    tier: "Tier 1",
    prismArchetype: "The Amplifier",
    profileImageUrl: "https://ui-avatars.com/api/?name=Sarah+Al-Mansoori&background=3b2a4a&color=ffffff&size=80",
    links: {
      instagram: "https://instagram.com/sarahalmansoori",
      tiktok: "https://tiktok.com/@sarahalmansoori",
    },
  },
  {
    id: "talent-2",
    name: "Ahmed Hassan",
    displayTitle: "Videographer · Editor",
    instagramHandle: "ahmedhassanfilms",
    instagramUrl: "https://instagram.com/ahmedhassanfilms",
    avatarUrl: "https://ui-avatars.com/api/?name=Ahmed+Hassan&background=2a3b4a&color=ffffff&size=80",
    primaryRole: "Videographer",
    roleTags: ["Videographer", "Editor", "Producer"],
    platformTags: ["YouTube", "Instagram", "TikTok"],
    shortBio: "Award-winning videographer producing cinematic brand films and social content for tech startups and enterprise clients.",
    nicheSummary: "Expert in tech, fintech, and SaaS brand storytelling. Creates high-production value content for product launches, investor pitches, and marketing campaigns. Based in Riyadh with remote capabilities across MENA.",
    availability: ["Monthly"],
    location: "Riyadh, Saudi Arabia",
    timezone: "AST (UTC+3)",
    languages: ["Arabic", "English"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    followers: 92000,
    engagementRate: 0.028,
    avgEngagement: 2575,
    interests: ["Tech", "SaaS", "Product Launches"],
    brandPartners: ["STC", "Jahez", "Sary"],
    portfolio: [
      { type: "video", src: "/portfolio/work-1.svg", poster: "/portfolio/work-1.svg", title: "Tech Brand Film" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Product Launch Video" },
      { type: "image", src: "/portfolio/work-3.svg", title: "Corporate Campaign" },
    ],
    tier: "Tier 1",
    prismArchetype: "The Architect",
    profileImageUrl: "https://ui-avatars.com/api/?name=Ahmed+Hassan&background=2a3b4a&color=ffffff&size=80",
    links: {
      instagram: "https://instagram.com/ahmedhassanfilms",
      youtube: "https://youtube.com/@ahmedhassanfilms",
    },
  },
  {
    id: "talent-3",
    name: "Layla Khoury",
    displayTitle: "Photographer · Content Creator",
    instagramHandle: "laylakhoury",
    instagramUrl: "https://instagram.com/laylakhoury",
    avatarUrl: "https://ui-avatars.com/api/?name=Layla+Khoury&background=2a4a3b&color=ffffff&size=80",
    primaryRole: "Photographer",
    roleTags: ["Photographer", "Content Creator", "Designer"],
    platformTags: ["Instagram", "LinkedIn"],
    shortBio: "Luxury lifestyle photographer capturing brand aesthetics for hospitality, real estate, and fashion sectors in the GCC.",
    nicheSummary: "Portfolio includes 5-star hotel chains, premium real estate developments, and luxury fashion brands. Expertise in architectural photography, lifestyle shoots, and editorial content. Available for both on-location and studio work.",
    availability: ["Hourly"],
    location: "Abu Dhabi, UAE",
    timezone: "GST (UTC+4)",
    languages: ["English", "Arabic", "French"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    followers: 74000,
    engagementRate: 0.052,
    avgEngagement: 3848,
    interests: ["Hospitality", "Real Estate", "Fashion"],
    brandPartners: ["Mandarin Oriental", "Emaar", "Aldar"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Hotel Photography" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Real Estate Shoot" },
      { type: "image", src: "/portfolio/work-3.svg", title: "Fashion Editorial" },
    ],
    tier: "Tier 1",
    prismArchetype: "The Auteur",
    profileImageUrl: "https://ui-avatars.com/api/?name=Layla+Khoury&background=2a4a3b&color=ffffff&size=80",
    links: {
      instagram: "https://instagram.com/laylakhoury",
    },
  },
  {
    id: "talent-4",
    name: "Omar Al-Rashid",
    displayTitle: "Copywriter · Strategist",
    instagramHandle: "omaralrashid",
    instagramUrl: "https://instagram.com/omaralrashid",
    avatarUrl: "https://ui-avatars.com/api/?name=Omar+Al-Rashid&background=4a3b2a&color=ffffff&size=80",
    primaryRole: "Copywriter",
    roleTags: ["Copywriter", "Strategist", "Content Creator"],
    platformTags: ["LinkedIn", "Twitter/X", "Instagram"],
    shortBio: "B2B marketing strategist and copywriter crafting compelling narratives for fintech, healthcare, and enterprise SaaS brands.",
    nicheSummary: "Deep expertise in B2B content marketing, thought leadership, and conversion-focused copy. Works with VC-backed startups and Fortune 500 companies to develop brand voice, content strategies, and campaign messaging. Bilingual (English/Arabic) with cultural nuance for MENA markets.",
    availability: ["Monthly"],
    location: "Doha, Qatar",
    timezone: "AST (UTC+3)",
    languages: ["English", "Arabic"],
    followers: 41000,
    engagementRate: 0.047,
    avgEngagement: 1927,
    interests: ["Fintech", "Enterprise SaaS", "B2B"],
    brandPartners: ["QNB", "Bein Sports", "Careem"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "B2B Content Strategy" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Thought Leadership" },
      { type: "image", src: "/portfolio/work-3.svg", title: "Brand Voice Development" },
    ],
    tier: "Tier 2",
    prismArchetype: "The Translator",
    profileImageUrl: "https://ui-avatars.com/api/?name=Omar+Al-Rashid&background=4a3b2a&color=ffffff&size=80",
    links: {
      instagram: "https://instagram.com/omaralrashid",
    },
  },
  {
    id: "talent-5",
    name: "Maya Patel",
    displayTitle: "Social Media Manager · Strategist",
    instagramHandle: "mayapatelsocial",
    instagramUrl: "https://instagram.com/mayapatelsocial",
    avatarUrl: "https://ui-avatars.com/api/?name=Maya+Patel&background=4a2a3b&color=ffffff&size=80",
    primaryRole: "Social Media Manager",
    roleTags: ["Social Media Manager", "Strategist", "Content Creator"],
    platformTags: ["Instagram", "TikTok", "LinkedIn", "Twitter/X"],
    shortBio: "Growth-focused social media strategist managing multi-platform campaigns for e-commerce and D2C brands scaling in MENA.",
    nicheSummary: "Specializes in Instagram and TikTok growth strategies, community management, and influencer partnerships. Proven track record of 3x+ follower growth and 5x+ engagement rates for D2C brands in fashion, beauty, and wellness. Data-driven approach with monthly reporting and optimization.",
    availability: ["Monthly"],
    location: "Dubai, UAE",
    timezone: "GST (UTC+4)",
    languages: ["English", "Hindi"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    followers: 130000,
    engagementRate: 0.041,
    avgEngagement: 5330,
    interests: ["E-commerce", "Beauty", "Wellness"],
    brandPartners: ["Namshi", "Faces", "Noon"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Social Media Campaign" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Growth Strategy" },
      { type: "image", src: "/portfolio/work-3.svg", title: "Community Management" },
    ],
    tier: "Tier 1",
    prismArchetype: "The Conductor",
    profileImageUrl: "https://ui-avatars.com/api/?name=Maya+Patel&background=4a2a3b&color=ffffff&size=80",
    links: {
      instagram: "https://instagram.com/mayapatelsocial",
    },
  },
  {
    id: "talent-6",
    name: "Zain Malik",
    displayTitle: "Videographer · UGC Creator",
    instagramHandle: "zainmalik",
    instagramUrl: "https://instagram.com/zainmalik",
    tiktokUrl: "https://tiktok.com/@zainmalik",
    tiktokHandle: "@zainmalik",
    avatarUrl: "https://ui-avatars.com/api/?name=Zain+Malik&background=2a4a4a&color=ffffff&size=80",
    primaryRole: "Videographer",
    roleTags: ["Videographer", "UGC Creator", "Editor"],
    platformTags: ["TikTok", "Instagram", "YouTube"],
    shortBio: "Fast-paced UGC videographer creating viral-ready content for consumer brands, food & beverage, and mobile apps.",
    nicheSummary: "Expert in short-form video content optimized for TikTok and Instagram Reels. Creates high-volume UGC content for food delivery apps, consumer electronics, and lifestyle brands. Quick turnaround (24-48 hours) with consistent quality. Based in Dubai with access to diverse talent pool.",
    availability: ["Hourly"],
    location: "Dubai, UAE",
    timezone: "GST (UTC+4)",
    languages: ["English", "Urdu", "Arabic"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    followers: 98000,
    engagementRate: 0.056,
    avgEngagement: 5488,
    interests: ["Food & Beverage", "Consumer Electronics", "Apps"],
    brandPartners: ["Talabat", "Samsung", "Anghami"],
    portfolio: [
      { type: "video", src: "/portfolio/work-1.svg", poster: "/portfolio/work-1.svg", title: "UGC Video Content" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Food Delivery Campaign" },
      { type: "image", src: "/portfolio/work-3.svg", title: "Product Demo" },
    ],
    tier: "Tier 1",
    prismArchetype: "The Maverick",
    profileImageUrl: "https://ui-avatars.com/api/?name=Zain+Malik&background=2a4a4a&color=ffffff&size=80",
    links: {
      instagram: "https://instagram.com/zainmalik",
      tiktok: "https://tiktok.com/@zainmalik",
    },
  },
  {
    id: "talent-7",
    name: "Noor Al-Zahra",
    displayTitle: "Designer · Content Creator",
    instagramHandle: "nooralzahra",
    instagramUrl: "https://instagram.com/nooralzahra",
    avatarUrl: "https://ui-avatars.com/api/?name=Noor+Al-Zahra&background=3b4a2a&color=ffffff&size=80",
    primaryRole: "Designer",
    roleTags: ["Designer", "Content Creator", "Social Media Manager"],
    platformTags: ["Instagram", "LinkedIn"],
    shortBio: "Visual designer and content creator specializing in brand identity, social media graphics, and digital marketing assets.",
    nicheSummary: "Creates cohesive visual identities for startups and established brands. Expertise in logo design, brand guidelines, social media templates, and marketing collateral. Works across print and digital with a focus on modern, minimalist aesthetics. Available for both project-based and retainer work.",
    availability: ["Hourly", "Monthly"],
    location: "Kuwait City, Kuwait",
    timezone: "AST (UTC+3)",
    languages: ["English", "Arabic"],
    followers: 36000,
    engagementRate: 0.049,
    avgEngagement: 1764,
    interests: ["Design Systems", "Brand Identity", "Templates"],
    brandPartners: ["Boutique 1", "Kuwait Finance House", "Sadu House"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Brand Identity Design" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Social Media Templates" },
      { type: "image", src: "/portfolio/work-3.svg", title: "Logo Design" },
    ],
    tier: "Tier 2",
    prismArchetype: "The Alchemist",
    profileImageUrl: "https://ui-avatars.com/api/?name=Noor+Al-Zahra&background=3b4a2a&color=ffffff&size=80",
    links: {
      instagram: "https://instagram.com/nooralzahra",
      behance: "https://behance.net/nooralzahra",
    },
  },
  {
    id: "talent-8",
    name: "Rami Fakhoury",
    displayTitle: "Producer · Videographer",
    instagramHandle: "ramifakhoury",
    instagramUrl: "https://instagram.com/ramifakhoury",
    avatarUrl: "https://ui-avatars.com/api/?name=Rami+Fakhoury&background=4a2a2a&color=ffffff&size=80",
    primaryRole: "Producer",
    roleTags: ["Producer", "Videographer", "Editor"],
    platformTags: ["YouTube", "Instagram"],
    shortBio: "Full-service video production specialist handling end-to-end campaigns from concept to delivery for corporate and commercial clients.",
    nicheSummary: "Manages complete video production pipelines including pre-production planning, on-set direction, post-production editing, and delivery. Works with corporate clients, event organizers, and marketing agencies. Capable of handling large-scale productions with crew management and equipment coordination. Based in Beirut with frequent travel to GCC.",
    availability: ["Monthly"],
    location: "Beirut, Lebanon",
    timezone: "EET (UTC+2)",
    languages: ["English", "Arabic", "French"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    followers: 57000,
    engagementRate: 0.031,
    avgEngagement: 1767,
    interests: ["Corporate", "Events", "Commercial"],
    brandPartners: ["Audi", "PepsiCo", "Majid Al Futtaim"],
    portfolio: [
      { type: "video", src: "/portfolio/work-1.svg", poster: "/portfolio/work-1.svg", title: "Corporate Production" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Event Coverage" },
      { type: "image", src: "/portfolio/work-3.svg", title: "Commercial Campaign" },
    ],
    tier: "Tier 1",
    prismArchetype: "The Pathfinder",
    profileImageUrl: "https://ui-avatars.com/api/?name=Rami+Fakhoury&background=4a2a2a&color=ffffff&size=80",
    links: {
      instagram: "https://instagram.com/ramifakhoury",
      youtube: "https://youtube.com/@ramifakhoury",
    },
  },
];

// Runtime guard: validate primaryRole consistency (dev-only, non-throwing)
if (typeof window === 'undefined' || process.env.NODE_ENV === 'development') {
  curatedTalent.forEach((talent, index) => {
    if (!talent.roleTags.includes(talent.primaryRole)) {
      console.warn(
        `[curatedTalent] Talent "${talent.name}" (index ${index}): primaryRole "${talent.primaryRole}" not found in roleTags:`,
        talent.roleTags
      );
    }
    if (talent.roleTags.length > 4) {
      console.warn(
        `[curatedTalent] Talent "${talent.name}" (index ${index}): roleTags length ${talent.roleTags.length} exceeds max 4:`,
        talent.roleTags
      );
    }
  });
}
