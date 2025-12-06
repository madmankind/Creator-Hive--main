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

export interface CuratedTalent {
  id: string;
  name: string;                 // e.g. "Lachy Groom"
  displayTitle: string;         // e.g. "UGC Creator · Photographer"
  instagramHandle: string;      // "lachygroom"
  instagramUrl: string;         // "https://instagram.com/..."
  avatarUrl: string;            // for now, static placeholder or /avatars/...
  roleTags: TalentCategoryTag[];   // max 4
  platformTags: PlatformTag[];     // e.g. ["Instagram", "TikTok", "Snapchat"]
  shortBio: string;             // 1 sentence, marketing-grade
  nicheSummary: string;         // short description of clients + niche specialization
  availability: AvailabilityTag[]; // e.g. ["Hourly", "Monthly"]
  location?: string;
  timezone?: string;
  languages?: string[];         // optional
  featuredVideoUrl?: string;    // e.g. a portfolio reel (YouTube/Vimeo/MP4)
  portfolioImages?: string[];   // optional, for future gallery
}

export const curatedTalent: CuratedTalent[] = [
  {
    id: "talent-1",
    name: "Sarah Al-Mansoori",
    displayTitle: "UGC Creator · Content Creator",
    instagramHandle: "sarahalmansoori",
    instagramUrl: "https://instagram.com/sarahalmansoori",
    avatarUrl: "/avatars/sarah.jpg",
    roleTags: ["UGC Creator", "Content Creator", "Influencer"],
    platformTags: ["Instagram", "TikTok", "Snapchat"],
    shortBio: "Dubai-based UGC specialist creating authentic product showcases for luxury and lifestyle brands across GCC markets.",
    nicheSummary: "Specializes in luxury fashion, beauty, and lifestyle brands. Works with premium retailers and e-commerce platforms across UAE, Saudi Arabia, and Kuwait. Known for high-converting product demos and authentic storytelling.",
    availability: ["Hourly", "Monthly"],
    location: "Dubai, UAE",
    timezone: "GST (UTC+4)",
    languages: ["English", "Arabic"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "talent-2",
    name: "Ahmed Hassan",
    displayTitle: "Videographer · Editor",
    instagramHandle: "ahmedhassanfilms",
    instagramUrl: "https://instagram.com/ahmedhassanfilms",
    avatarUrl: "/avatars/ahmed.jpg",
    roleTags: ["Videographer", "Editor", "Producer"],
    platformTags: ["YouTube", "Instagram", "TikTok"],
    shortBio: "Award-winning videographer producing cinematic brand films and social content for tech startups and enterprise clients.",
    nicheSummary: "Expert in tech, fintech, and SaaS brand storytelling. Creates high-production value content for product launches, investor pitches, and marketing campaigns. Based in Riyadh with remote capabilities across MENA.",
    availability: ["Monthly"],
    location: "Riyadh, Saudi Arabia",
    timezone: "AST (UTC+3)",
    languages: ["Arabic", "English"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "talent-3",
    name: "Layla Khoury",
    displayTitle: "Photographer · Content Creator",
    instagramHandle: "laylakhoury",
    instagramUrl: "https://instagram.com/laylakhoury",
    avatarUrl: "/avatars/layla.jpg",
    roleTags: ["Photographer", "Content Creator", "Designer"],
    platformTags: ["Instagram", "LinkedIn"],
    shortBio: "Luxury lifestyle photographer capturing brand aesthetics for hospitality, real estate, and fashion sectors in the GCC.",
    nicheSummary: "Portfolio includes 5-star hotel chains, premium real estate developments, and luxury fashion brands. Expertise in architectural photography, lifestyle shoots, and editorial content. Available for both on-location and studio work.",
    availability: ["Hourly"],
    location: "Abu Dhabi, UAE",
    timezone: "GST (UTC+4)",
    languages: ["English", "Arabic", "French"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "talent-4",
    name: "Omar Al-Rashid",
    displayTitle: "Copywriter · Strategist",
    instagramHandle: "omaralrashid",
    instagramUrl: "https://instagram.com/omaralrashid",
    avatarUrl: "/avatars/omar.jpg",
    roleTags: ["Copywriter", "Strategist", "Content Creator"],
    platformTags: ["LinkedIn", "Twitter/X", "Instagram"],
    shortBio: "B2B marketing strategist and copywriter crafting compelling narratives for fintech, healthcare, and enterprise SaaS brands.",
    nicheSummary: "Deep expertise in B2B content marketing, thought leadership, and conversion-focused copy. Works with VC-backed startups and Fortune 500 companies to develop brand voice, content strategies, and campaign messaging. Bilingual (English/Arabic) with cultural nuance for MENA markets.",
    availability: ["Monthly"],
    location: "Doha, Qatar",
    timezone: "AST (UTC+3)",
    languages: ["English", "Arabic"],
  },
  {
    id: "talent-5",
    name: "Maya Patel",
    displayTitle: "Social Media Manager · Strategist",
    instagramHandle: "mayapatelsocial",
    instagramUrl: "https://instagram.com/mayapatelsocial",
    avatarUrl: "/avatars/maya.jpg",
    roleTags: ["Social Media Manager", "Strategist", "Content Creator"],
    platformTags: ["Instagram", "TikTok", "LinkedIn", "Twitter/X"],
    shortBio: "Growth-focused social media strategist managing multi-platform campaigns for e-commerce and D2C brands scaling in MENA.",
    nicheSummary: "Specializes in Instagram and TikTok growth strategies, community management, and influencer partnerships. Proven track record of 3x+ follower growth and 5x+ engagement rates for D2C brands in fashion, beauty, and wellness. Data-driven approach with monthly reporting and optimization.",
    availability: ["Monthly"],
    location: "Dubai, UAE",
    timezone: "GST (UTC+4)",
    languages: ["English", "Hindi"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "talent-6",
    name: "Zain Malik",
    displayTitle: "Videographer · UGC Creator",
    instagramHandle: "zainmalik",
    instagramUrl: "https://instagram.com/zainmalik",
    avatarUrl: "/avatars/zain.jpg",
    roleTags: ["Videographer", "UGC Creator", "Editor"],
    platformTags: ["TikTok", "Instagram", "YouTube"],
    shortBio: "Fast-paced UGC videographer creating viral-ready content for consumer brands, food & beverage, and mobile apps.",
    nicheSummary: "Expert in short-form video content optimized for TikTok and Instagram Reels. Creates high-volume UGC content for food delivery apps, consumer electronics, and lifestyle brands. Quick turnaround (24-48 hours) with consistent quality. Based in Dubai with access to diverse talent pool.",
    availability: ["Hourly"],
    location: "Dubai, UAE",
    timezone: "GST (UTC+4)",
    languages: ["English", "Urdu", "Arabic"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "talent-7",
    name: "Noor Al-Zahra",
    displayTitle: "Designer · Content Creator",
    instagramHandle: "nooralzahra",
    instagramUrl: "https://instagram.com/nooralzahra",
    avatarUrl: "/avatars/noor.jpg",
    roleTags: ["Designer", "Content Creator", "Social Media Manager"],
    platformTags: ["Instagram", "LinkedIn"],
    shortBio: "Visual designer and content creator specializing in brand identity, social media graphics, and digital marketing assets.",
    nicheSummary: "Creates cohesive visual identities for startups and established brands. Expertise in logo design, brand guidelines, social media templates, and marketing collateral. Works across print and digital with a focus on modern, minimalist aesthetics. Available for both project-based and retainer work.",
    availability: ["Hourly", "Monthly"],
    location: "Kuwait City, Kuwait",
    timezone: "AST (UTC+3)",
    languages: ["English", "Arabic"],
  },
  {
    id: "talent-8",
    name: "Rami Fakhoury",
    displayTitle: "Producer · Videographer",
    instagramHandle: "ramifakhoury",
    instagramUrl: "https://instagram.com/ramifakhoury",
    avatarUrl: "/avatars/rami.jpg",
    roleTags: ["Producer", "Videographer", "Editor"],
    platformTags: ["YouTube", "Instagram"],
    shortBio: "Full-service video production specialist handling end-to-end campaigns from concept to delivery for corporate and commercial clients.",
    nicheSummary: "Manages complete video production pipelines including pre-production planning, on-set direction, post-production editing, and delivery. Works with corporate clients, event organizers, and marketing agencies. Capable of handling large-scale productions with crew management and equipment coordination. Based in Beirut with frequent travel to GCC.",
    availability: ["Monthly"],
    location: "Beirut, Lebanon",
    timezone: "EET (UTC+2)",
    languages: ["English", "Arabic", "French"],
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

