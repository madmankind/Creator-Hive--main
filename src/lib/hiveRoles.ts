/**
 * Creator Hive — Generic Role Archetypes
 * These are bookable role slots matched to real vetted talent within 48h.
 * Kept separate from curatedTalent (named Hive Signature profiles).
 */

import type { TalentCategoryTag, PlatformTag } from "@/lib/curatedTalent";

export interface HiveRole {
  id: string;
  /** Internal role category — matches TalentCategoryTag for filtering */
  primaryRole: TalentCategoryTag;
  /** Card headline — the role title clients see */
  title: string;
  /** One-line pitch */
  tagline: string;
  /** 2–3 sentence capability description. No names. */
  description: string;
  /** What clients get */
  deliverables: string[];
  /** Typical platforms this role covers */
  platforms: PlatformTag[];
  /** AED monthly rate range (internal pricing guidance) */
  rateRange: { min: number; max: number; unit: "monthly" | "project" };
  /** Typical engagement type */
  availability: ("Hourly" | "Monthly")[];
  /** Visual accent colour for the card */
  accent: string;
  /** Icon character or emoji — used as avatar placeholder */
  icon: string;
  /** UAE-based talent available for this role */
  uaeAvailable: boolean;
}

export const hiveRoles: HiveRole[] = [
  {
    id: "role-ugc-creator",
    primaryRole: "UGC Creator",
    title: "UGC Creator",
    tagline: "Authentic content that converts.",
    description: "Produces raw, platform-native content built for performance. Specialises in product demos, testimonials, unboxings, and lifestyle integrations that feel organic — not produced.",
    deliverables: ["Product demo reels", "Testimonial videos", "Lifestyle content", "Story sequences", "Hook variations for A/B testing"],
    platforms: ["Instagram", "TikTok"],
    rateRange: { min: 8000, max: 15000, unit: "monthly" },
    availability: ["Monthly", "Hourly"],
    accent: "#F59E0B",
    icon: "🎬",
    uaeAvailable: true,
  },
  {
    id: "role-content-creator",
    primaryRole: "Content Creator",
    title: "Content Creator",
    tagline: "Multi-format, brand-ready output.",
    description: "End-to-end content production for brands — from ideation through to final deliverable. Covers photo, video, and static formats across Instagram, TikTok, and beyond.",
    deliverables: ["Feed posts", "Reels & short-form video", "Story content", "Brand photography", "Caption and content copy"],
    platforms: ["Instagram", "TikTok", "YouTube"],
    rateRange: { min: 10000, max: 20000, unit: "monthly" },
    availability: ["Monthly", "Hourly"],
    accent: "#A78BFA",
    icon: "✦",
    uaeAvailable: true,
  },
  {
    id: "role-videographer",
    primaryRole: "Videographer",
    title: "Videographer",
    tagline: "Cinematic production for brands that want to be seen.",
    description: "Full-service video production from pre-production planning to final edit. Shoots commercial-grade content for campaigns, hero films, events, and always-on social.",
    deliverables: ["Hero brand films", "Campaign shoot", "Event coverage", "Talking-head interviews", "Product cinematography"],
    platforms: ["YouTube", "Instagram"],
    rateRange: { min: 15000, max: 30000, unit: "monthly" },
    availability: ["Monthly", "Hourly"],
    accent: "#60A5FA",
    icon: "📽",
    uaeAvailable: true,
  },
  {
    id: "role-photographer",
    primaryRole: "Photographer",
    title: "Photographer",
    tagline: "Still images that hold attention.",
    description: "Commercial and lifestyle photography for brands, e-commerce, editorial, and social. Delivers fully retouched, brand-consistent image libraries ready for multi-channel use.",
    deliverables: ["Campaign shoot", "Product photography", "Lifestyle imagery", "Brand portraits", "Retouched image library"],
    platforms: ["Instagram"],
    rateRange: { min: 10000, max: 22000, unit: "monthly" },
    availability: ["Monthly", "Hourly"],
    accent: "#34D399",
    icon: "◎",
    uaeAvailable: true,
  },
  {
    id: "role-smm",
    primaryRole: "Social Media Manager",
    title: "Social Media Manager",
    tagline: "Channels managed. Growth tracked.",
    description: "Full ownership of social channels — strategy, content calendar, community management, and monthly performance reporting. Available in English and Arabic.",
    deliverables: ["Monthly content calendar", "Community management", "Story content", "Monthly performance report", "Hashtag and audience strategy"],
    platforms: ["Instagram", "TikTok", "LinkedIn"],
    rateRange: { min: 8000, max: 18000, unit: "monthly" },
    availability: ["Monthly"],
    accent: "#F472B6",
    icon: "◈",
    uaeAvailable: true,
  },
  {
    id: "role-creative-director",
    primaryRole: "Creative Director",
    title: "Creative Director",
    tagline: "Brand vision. Campaign architecture.",
    description: "Senior creative leadership for campaigns and brand projects. Owns concept, visual direction, and creative brief — works with production teams to bring ideas to life.",
    deliverables: ["Campaign concept", "Creative brief", "Visual direction doc", "Mood boards", "Production oversight"],
    platforms: ["Instagram", "YouTube"],
    rateRange: { min: 20000, max: 45000, unit: "monthly" },
    availability: ["Monthly", "Hourly"],
    accent: "#C084FC",
    icon: "◆",
    uaeAvailable: true,
  },
  {
    id: "role-editor",
    primaryRole: "Editor",
    title: "Video Editor",
    tagline: "Fast turnaround. Platform-ready cuts.",
    description: "Post-production specialist for reels, short-form campaigns, long-form YouTube, and branded content. Delivers polished edits with motion graphics, captions, and sound design.",
    deliverables: ["Reel edits", "Long-form cuts", "Motion graphics", "Caption overlays", "Raw footage organisation"],
    platforms: ["Instagram", "TikTok", "YouTube"],
    rateRange: { min: 12000, max: 22000, unit: "monthly" },
    availability: ["Monthly", "Hourly"],
    accent: "#FB923C",
    icon: "✂",
    uaeAvailable: true,
  },
  {
    id: "role-designer",
    primaryRole: "Designer",
    title: "Graphic Designer",
    tagline: "Visual identity. Campaign assets.",
    description: "Brand and digital design across social templates, campaign assets, decks, and OOH. Comfortable in Figma, Adobe Suite, and motion-ready formats.",
    deliverables: ["Social templates", "Campaign assets", "Brand presentations", "OOH and print-ready files", "Motion-ready assets"],
    platforms: ["Instagram", "LinkedIn"],
    rateRange: { min: 10000, max: 20000, unit: "monthly" },
    availability: ["Monthly", "Hourly"],
    accent: "#38BDF8",
    icon: "◐",
    uaeAvailable: true,
  },
  {
    id: "role-copywriter",
    primaryRole: "Copywriter",
    title: "Copywriter",
    tagline: "Words that move brands forward.",
    description: "Strategic copywriting for campaigns, social, brand voice guides, and ad copy. Available for English and Arabic. Understands UAE and GCC market tone.",
    deliverables: ["Campaign copy", "Social captions", "Brand voice guide", "Ad copy variations", "Email sequences"],
    platforms: ["Instagram", "LinkedIn"],
    rateRange: { min: 8000, max: 16000, unit: "monthly" },
    availability: ["Monthly", "Hourly"],
    accent: "#4ADE80",
    icon: "✎",
    uaeAvailable: true,
  },
  {
    id: "role-influencer",
    primaryRole: "Influencer",
    title: "Influencer",
    tagline: "Reach. Trust. Conversion.",
    description: "UAE-based influencers across lifestyle, fashion, food, tech, and wellness verticals. Matched to your brief by niche, audience size, and engagement profile.",
    deliverables: ["Sponsored feed posts", "Story takeovers", "Reel collaborations", "Product seeding", "Long-term ambassador work"],
    platforms: ["Instagram", "TikTok", "YouTube"],
    rateRange: { min: 5000, max: 40000, unit: "project" },
    availability: ["Hourly", "Monthly"],
    accent: "#FBBF24",
    icon: "★",
    uaeAvailable: true,
  },
  {
    id: "role-strategist",
    primaryRole: "Strategist",
    title: "Brand Strategist",
    tagline: "Direction before execution.",
    description: "Senior brand and content strategy for campaigns, launches, and always-on programs. Delivers audience insights, channel strategy, and a clear creative brief before any content is made.",
    deliverables: ["Audience research", "Channel strategy", "Content pillars", "Campaign framework", "Performance benchmarks"],
    platforms: ["Instagram", "LinkedIn"],
    rateRange: { min: 15000, max: 35000, unit: "monthly" },
    availability: ["Monthly", "Hourly"],
    accent: "#818CF8",
    icon: "⬡",
    uaeAvailable: true,
  },
  {
    id: "role-producer",
    primaryRole: "Producer",
    title: "Production Manager",
    tagline: "On-time, on-budget delivery.",
    description: "End-to-end production management for shoots, campaigns, and multi-creator projects. Handles logistics, vendor coordination, talent scheduling, and post-production pipeline.",
    deliverables: ["Production schedule", "Vendor briefing", "Shoot coordination", "Post-production pipeline", "Final delivery package"],
    platforms: ["Instagram", "YouTube"],
    rateRange: { min: 15000, max: 28000, unit: "monthly" },
    availability: ["Monthly", "Hourly"],
    accent: "#2DD4BF",
    icon: "⬢",
    uaeAvailable: true,
  },
  {
    id: "role-arabic-smm",
    primaryRole: "Social Media Manager",
    title: "Arabic Social Media Manager",
    tagline: "Native Arabic voice. GCC-ready content.",
    description: "Arabic-first social media management for brands targeting UAE, KSA, Kuwait, and broader GCC audiences. Fluent in Gulf dialect and Standard Arabic content formats.",
    deliverables: ["Arabic content calendar", "Community management (AR)", "Story content in Arabic", "GCC trend monitoring", "Bilingual performance reports"],
    platforms: ["Instagram", "TikTok", "Snapchat"],
    rateRange: { min: 10000, max: 20000, unit: "monthly" },
    availability: ["Monthly"],
    accent: "#F87171",
    icon: "ع",
    uaeAvailable: true,
  },
  {
    id: "role-podcast-strategist",
    primaryRole: "Strategist",
    title: "Podcast Strategist",
    tagline: "Concept to launch. Season to season.",
    description: "Full-service podcast strategy for brands — format development, guest pipeline, editorial direction, launch planning, and distribution advisory. Ideal for thought-leadership and branded shows.",
    deliverables: ["Season architecture", "Guest pipeline", "Episode theme development", "Distribution strategy", "Launch plan"],
    platforms: ["YouTube"],
    rateRange: { min: 10000, max: 20000, unit: "monthly" },
    availability: ["Monthly"],
    accent: "#E879F9",
    icon: "◎",
    uaeAvailable: true,
  },
  {
    id: "role-motion-designer",
    primaryRole: "Designer",
    title: "Motion Designer",
    tagline: "Animation that holds attention.",
    description: "2D and 3D motion design for social, digital campaigns, and brand identity animations. Delivers Reels-ready motion content, logo animations, and kinetic typography.",
    deliverables: ["Animated reels", "Logo reveals", "Kinetic typography", "Transition packs", "Social motion templates"],
    platforms: ["Instagram", "TikTok", "YouTube"],
    rateRange: { min: 12000, max: 25000, unit: "monthly" },
    availability: ["Monthly", "Hourly"],
    accent: "#34D399",
    icon: "◉",
    uaeAvailable: true,
  },
];

/** All unique primaryRoles represented in hiveRoles — for filtering */
export const HIVE_ROLE_CATEGORIES = [
  ...new Set(hiveRoles.map((r) => r.primaryRole)),
] as TalentCategoryTag[];
