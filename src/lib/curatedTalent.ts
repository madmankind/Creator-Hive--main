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
  | "Creative Director"
  | "Project Manager"
  | "Account Manager"
  | "Account Director"
  | "Talent Manager"
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
  "The Maverick":   "Independent, fast-paced creator who thrives on variety and quick turnarounds.",
  "The Conductor":  "Strategic orchestrator who coordinates multi-platform campaigns and team workflows.",
  "The Pathfinder": "End-to-end producer who guides projects from concept to delivery.",
  "The Translator": "B2B specialist who turns complex ideas into clear, compelling narratives.",
  "The Architect":  "Structured creator who builds high-production value, scalable content systems.",
  "The Alchemist":  "Visual designer who transforms brand briefs into cohesive identities and templates.",
  "The Auteur":     "Luxury-focused creator with a distinct aesthetic and editorial vision.",
  "The Amplifier":  "Authentic UGC creator who amplifies brand messages through relatable content.",
};

/** First name only for external display. */
export function getTalentDisplayName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export interface CuratedTalent {
  id: string;
  name: string;
  displayTitle: string;
  instagramHandle: string;
  instagramUrl: string;
  tiktokUrl?: string;
  tiktokHandle?: string;
  avatarUrl: string;
  profileImageUrl?: string;
  primaryRole: TalentCategoryTag;
  roleTags: TalentCategoryTag[];
  platformTags: PlatformTag[];
  shortBio: string;
  nicheSummary: string;
  availability: AvailabilityTag[];
  tier?: "Tier 1" | "Tier 2";
  prismArchetype: PrismArchetypeName;
  location?: string;
  timezone?: string;
  languages?: string[];
  featuredVideoUrl?: string;
  portfolioImages?: string[];
  portfolio?: PortfolioItem[];
  links?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    behance?: string;
    twitch?: string;
    website?: string;
  };
  followers?: number;
  engagementRate?: number;
  avgEngagement?: number;
  interests?: string[];
  brandPartners?: string[];
}


export const curatedTalent: CuratedTalent[] = [

  // ── HIVE SIGNATURE — Videographers & Filmmakers ──────────────────────────

  {
    id: "talent-amro",
    name: "Amro",
    displayTitle: "Director of Photography · Filmmaker",
    instagramHandle: "amroqudah",
    instagramUrl: "https://instagram.com/amroqudah",
    avatarUrl: "https://ui-avatars.com/api/?name=Amro&background=0d0d1a&color=a78bfa&size=512",
    primaryRole: "Videographer",
    roleTags: ["Videographer", "Producer", "Photographer", "Content Creator"],
    platformTags: ["Instagram", "YouTube"],
    shortBio: "Shoots and directs cinematic brand films, hero reels, and commercial campaigns. Experienced in automotive, luxury hospitality, and destination content.",
    nicheSummary: "Director of Photography based in Dubai. Past work includes automotive brands, premium tourism clients, and large-format lifestyle campaigns.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Auteur",
    location: "Dubai, UAE",
    followers: 1500000,
    engagementRate: 0.032,
    brandPartners: ["Luxury automotive", "Tourism campaigns"],
    portfolio: [
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Cinematic Reel" },
      { type: "image", src: "/portfolio/work-1.svg", title: "DOP Work" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Brand Campaigns" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Amro&background=0d0d1a&color=a78bfa&size=512",
    links: { instagram: "https://instagram.com/amroqudah" },
  },

  {
    id: "talent-ali",
    name: "Ali",
    displayTitle: "Videographer · Founder @caption.ae",
    instagramHandle: "alialrz1",
    instagramUrl: "https://instagram.com/alialrz1",
    avatarUrl: "https://ui-avatars.com/api/?name=Ali&background=0d0d1a&color=67e8f9&size=512",
    primaryRole: "Videographer",
    roleTags: ["Videographer", "Producer", "Content Creator", "Editor"],
    platformTags: ["Instagram"],
    shortBio: "Shoots and edits lifestyle and brand videos, produces social content, and runs creator activations. Experienced in travel, automotive, and Dubai lifestyle.",
    nicheSummary: "Content Creator and Videographer based in Dubai. Founder of @caption.ae. Works across travel, automotive, and Dubai lifestyle brands.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Architect",
    location: "Dubai, UAE",
    followers: 478000,
    engagementRate: 0.028,
    brandPartners: ["caption.ae", "Dubai lifestyle brands"],
    portfolio: [
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Brand Reel" },
      { type: "image", src: "/portfolio/work-1.svg", title: "Lifestyle Content" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Campaign Work" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Ali&background=0d0d1a&color=67e8f9&size=512",
    links: { instagram: "https://instagram.com/alialrz1" },
  },


  {
    id: "talent-ludus",
    name: "Ludus",
    displayTitle: "Commercial Filmmaker · Director",
    instagramHandle: "ludusfilms",
    instagramUrl: "https://instagram.com/ludusfilms",
    avatarUrl: "https://ui-avatars.com/api/?name=Ludus&background=0d0d1a&color=a78bfa&size=512",
    primaryRole: "Videographer",
    roleTags: ["Videographer", "Producer", "Content Creator", "Editor"],
    platformTags: ["Instagram", "TikTok"],
    shortBio: "Produces commercial brand films, social reels, and product videos. Experienced in retail, FMCG, and tech campaigns.",
    nicheSummary: "Commercial filmmaker based in Dubai. Brand credits include Emirates, Garnier, Maybelline NY, Lenovo, and Lenskart.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Architect",
    location: "Dubai, UAE",
    followers: 112000,
    engagementRate: 0.038,
    brandPartners: ["Emirates", "Garnier", "Maybelline", "Lenovo", "Lenskart"],
    portfolio: [
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Commercial Reel" },
      { type: "image", src: "/portfolio/work-1.svg", title: "Brand Films" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Emirates Campaign" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Ludus&background=0d0d1a&color=a78bfa&size=512",
    links: { instagram: "https://instagram.com/ludusfilms", website: "https://ludus-films.com" },
  },

  {
    id: "talent-amir",
    name: "Amir",
    displayTitle: "Videographer · Automotive Specialist",
    instagramHandle: "amir.deleon",
    instagramUrl: "https://instagram.com/amir.deleon",
    avatarUrl: "https://ui-avatars.com/api/?name=Amir&background=0d0d1a&color=67e8f9&size=512",
    primaryRole: "Videographer",
    roleTags: ["Videographer", "Content Creator", "Photographer", "Producer"],
    platformTags: ["Instagram", "YouTube"],
    shortBio: "Shoots cinematic automotive content, produces event coverage reels, and delivers short-form brand films. Experienced in motorsport, performance vehicles, and fitness.",
    nicheSummary: "Videographer based in Dubai. Credits include Abu Dhabi Grand Prix and Qatar Grand Prix.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Maverick",
    location: "Dubai, UAE",
    followers: 132000,
    engagementRate: 0.041,
    brandPartners: ["Abu Dhabi GP", "Qatar GP"],
    portfolio: [
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Automotive Reel" },
      { type: "image", src: "/portfolio/work-1.svg", title: "GP Coverage" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Cinematic Stills" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Amir&background=0d0d1a&color=67e8f9&size=512",
    links: { instagram: "https://instagram.com/amir.deleon" },
  },


  {
    id: "talent-nihal",
    name: "Nihal",
    displayTitle: "Videographer · Travel & Automotive",
    instagramHandle: "nihalxmhd",
    instagramUrl: "https://instagram.com/nihalxmhd",
    avatarUrl: "https://ui-avatars.com/api/?name=Nihal&background=0d0d1a&color=67e8f9&size=512",
    primaryRole: "Videographer",
    roleTags: ["Videographer", "Content Creator", "Photographer", "Producer"],
    platformTags: ["Instagram"],
    shortBio: "Shoots and directs cinematic travel films, destination reels, and automotive content. Experienced in tourism, road trips, and Gulf destination campaigns.",
    nicheSummary: "Filmmaker based in the UAE. Portfolio spans Qatar, Al Ula, Almaty, and China — tourism boards, automotive brands, and destination campaigns.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Pathfinder",
    location: "Dubai, UAE",
    followers: 50500,
    engagementRate: 0.044,
    brandPartners: ["Automotive brands", "Tourism boards"],
    portfolio: [
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Travel Reel" },
      { type: "image", src: "/portfolio/work-1.svg", title: "Automotive" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Destination" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Nihal&background=0d0d1a&color=67e8f9&size=512",
    links: { instagram: "https://instagram.com/nihalxmhd" },
  },

  {
    id: "talent-islam",
    name: "Islam",
    displayTitle: "Filmmaker · UAE Licensed",
    instagramHandle: "islamabdallamedia",
    instagramUrl: "https://instagram.com/islamabdallamedia",
    avatarUrl: "https://ui-avatars.com/api/?name=Islam&background=0d0d1a&color=6ee7b7&size=512",
    primaryRole: "Videographer",
    roleTags: ["Videographer", "Producer", "Content Creator", "Editor"],
    platformTags: ["Instagram"],
    shortBio: "Shoots and directs social films, Arabic-language brand content, and licensed commercial productions. Experienced in automotive and lifestyle campaigns.",
    nicheSummary: "UAE Media Licence holder based in Dubai. Credits include Jeep Wrangler. Delivers Arabic-first brand films and bilingual commercial productions.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Auteur",
    location: "Dubai, UAE",
    followers: 90700,
    engagementRate: 0.036,
    brandPartners: ["Jeep Wrangler"],
    portfolio: [
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Cinematic Reel" },
      { type: "image", src: "/portfolio/work-1.svg", title: "Brand Campaign" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Social Content" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Islam&background=0d0d1a&color=6ee7b7&size=512",
    links: { instagram: "https://instagram.com/islamabdallamedia" },
  },


  {
    id: "talent-tayeb",
    name: "Tayeb",
    displayTitle: "Videographer · Cinematographer",
    instagramHandle: "santoxsanto",
    instagramUrl: "https://instagram.com/santoxsanto",
    avatarUrl: "https://ui-avatars.com/api/?name=Tayeb&background=0d0d1a&color=a78bfa&size=512",
    primaryRole: "Videographer",
    roleTags: ["Videographer", "Producer", "Content Creator", "Editor"],
    platformTags: ["Instagram"],
    shortBio: "Directs and shoots commercials, music videos, and branded content. Experienced in fashion, sportswear, and live entertainment campaigns.",
    nicheSummary: "Director and cinematographer based in Dubai. Credits include an Adidas India campaign. Works across fashion, music, and brand film.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Maverick",
    location: "Dubai, UAE",
    followers: 40100,
    engagementRate: 0.046,
    brandPartners: ["Adidas"],
    portfolio: [
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Commercial Reel" },
      { type: "image", src: "/portfolio/work-1.svg", title: "Campaign Work" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Cinematic Stills" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Tayeb&background=0d0d1a&color=a78bfa&size=512",
    links: { instagram: "https://instagram.com/santoxsanto" },
  },

  {
    id: "talent-jonathan",
    name: "Jonathan",
    displayTitle: "Videographer · Dubai Cinematographer",
    instagramHandle: "jonathan_sentin",
    instagramUrl: "https://instagram.com/jonathan_sentin",
    avatarUrl: "https://ui-avatars.com/api/?name=Jonathan&background=0d0d1a&color=67e8f9&size=512",
    primaryRole: "Videographer",
    roleTags: ["Videographer", "Photographer", "Producer", "Editor"],
    platformTags: ["Instagram"],
    shortBio: "Shoots, photographs, and edits brand content as a single-vendor production resource. Experienced in fashion, hospitality, and Dubai lifestyle campaigns.",
    nicheSummary: "Videographer, photographer, and editor based in Dubai under @doitcreatives. Covers brand reels, event photography, and social-ready content.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Architect",
    location: "Dubai, UAE",
    followers: 60300,
    engagementRate: 0.039,
    portfolio: [
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Dubai Reel" },
      { type: "image", src: "/portfolio/work-1.svg", title: "Cinematic Stills" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Brand Work" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Jonathan&background=0d0d1a&color=67e8f9&size=512",
    links: { instagram: "https://instagram.com/jonathan_sentin", website: "https://www.doitcreatives.com" },
  },


  // ── HIVE SIGNATURE — Content Creators ───────────────────────────────────────

  {
    id: "talent-dan",
    name: "Dan",
    displayTitle: "Content Creator · Hotel & Destination",
    instagramHandle: "danthelion_15",
    instagramUrl: "https://instagram.com/danthelion_15",
    avatarUrl: "https://ui-avatars.com/api/?name=Dan&background=0d0d1a&color=34d399&size=512",
    primaryRole: "Content Creator",
    roleTags: ["Content Creator", "Videographer", "Photographer", "Influencer"],
    platformTags: ["Instagram"],
    shortBio: "Produces hotel and destination content, travel reels, and brand event coverage. Experienced in luxury hospitality, tourism boards, and UAE destination campaigns.",
    nicheSummary: "UAE Advertiser Permit holder and @branddubai Ambassador based in Abu Dhabi. Brand credits include Burj Al Arab, Jumeirah, Anantara, Marsa Al Arab, and Atlantis.",
    availability: ["Monthly"],
    prismArchetype: "The Pathfinder",
    location: "Abu Dhabi, UAE",
    followers: 190000,
    engagementRate: 0.029,
    brandPartners: ["Burj Al Arab", "Jumeirah", "Anantara", "Atlantis", "Brand Dubai"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Hotel Campaign" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Destination Content" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Travel Reel" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Dan&background=0d0d1a&color=34d399&size=512",
    links: { instagram: "https://instagram.com/danthelion_15" },
  },

  {
    id: "talent-nihad",
    name: "Nihad",
    displayTitle: "Content Creator · Golden Visa · Travel",
    instagramHandle: "roaming_blogger",
    instagramUrl: "https://instagram.com/roaming_blogger",
    avatarUrl: "https://ui-avatars.com/api/?name=Nihad&background=0d0d1a&color=34d399&size=512",
    primaryRole: "Content Creator",
    roleTags: ["Content Creator", "Influencer", "Photographer", "Social Media Manager"],
    platformTags: ["Instagram"],
    shortBio: "Creates travel and hospitality content, manages brand partnerships, and produces destination campaigns. Experienced in hotels, airlines, and tourism boards.",
    nicheSummary: "UAE Golden Visa creator based in Dubai. Credits include Air Asia, Conrad, Hyatt, Dubai Holdings, Marriott, and Dubai Shopping Festival.",
    availability: ["Monthly"],
    prismArchetype: "The Pathfinder",
    location: "Dubai, UAE",
    followers: 119000,
    engagementRate: 0.039,
    brandPartners: ["Air Asia", "Conrad", "Hyatt", "Dubai Shopping Festival", "Marriott"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Hospitality Campaign" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Travel Content" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Destination Reel" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Nihad&background=0d0d1a&color=34d399&size=512",
    links: { instagram: "https://instagram.com/roaming_blogger" },
  },


  {
    id: "talent-camila",
    name: "Camila",
    displayTitle: "Content Creator · Lifestyle & Fitness",
    instagramHandle: "camilaatunoni",
    instagramUrl: "https://instagram.com/camilaatunoni",
    avatarUrl: "https://ui-avatars.com/api/?name=Camila&background=0d0d1a&color=f9a8d4&size=512",
    primaryRole: "Content Creator",
    roleTags: ["Content Creator", "UGC Creator", "Influencer", "Social Media Manager"],
    platformTags: ["Instagram", "TikTok"],
    shortBio: "Creates fitness and lifestyle content, manages social pages, and runs brand activation campaigns. Experienced in wellness, F&B, and Gulf lifestyle brands.",
    nicheSummary: "Bilingual (EN/ES) content creator based in Dubai. Works across fitness, wellness, and lifestyle brands on Instagram and TikTok.",
    availability: ["Monthly"],
    prismArchetype: "The Amplifier",
    location: "Dubai, UAE",
    followers: 81600,
    engagementRate: 0.052,
    brandPartners: ["Lifestyle brands", "Fitness brands"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Lifestyle" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Fitness Reel" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Brand Campaign" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Camila&background=0d0d1a&color=f9a8d4&size=512",
    links: { instagram: "https://instagram.com/camilaatunoni" },
  },

  {
    id: "talent-nadine",
    name: "Nadine",
    displayTitle: "Content Creator · Beauty & Events",
    instagramHandle: "thenadinehossam",
    instagramUrl: "https://instagram.com/thenadinehossam",
    avatarUrl: "https://ui-avatars.com/api/?name=Nadine&background=0d0d1a&color=f9a8d4&size=512",
    primaryRole: "Content Creator",
    roleTags: ["Content Creator", "Influencer", "Social Media Manager", "Photographer"],
    platformTags: ["Instagram", "TikTok"],
    shortBio: "Produces beauty and makeup content, covers events, and manages social channels. Experienced in beauty brands, lifestyle events, and UAE campaign productions.",
    nicheSummary: "UAE Advertiser Licensed creator and makeup artist based in Dubai. Credits include Fenty Beauty, UNTOLD Dubai, and HTBAR.",
    availability: ["Monthly"],
    prismArchetype: "The Amplifier",
    location: "Dubai, UAE",
    followers: 77100,
    engagementRate: 0.048,
    brandPartners: ["Fenty Beauty", "UNTOLD Dubai", "HTBAR"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Beauty Campaign" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Event Coverage" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Lifestyle Content" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Nadine&background=0d0d1a&color=f9a8d4&size=512",
    links: { instagram: "https://instagram.com/thenadinehossam" },
  },


  {
    id: "talent-hameda",
    name: "Hameda",
    displayTitle: "Content Creator · Luxury & Hospitality",
    instagramHandle: "hamedanassiri",
    instagramUrl: "https://instagram.com/hamedanassiri",
    avatarUrl: "https://ui-avatars.com/api/?name=Hameda&background=0d0d1a&color=fbbf24&size=512",
    primaryRole: "Content Creator",
    roleTags: ["Content Creator", "Influencer", "Photographer", "Social Media Manager"],
    platformTags: ["Instagram"],
    shortBio: "Creates luxury lifestyle content, manages social channels, and produces hospitality campaigns. Experienced in real estate, hotel brands, and premium tourism.",
    nicheSummary: "Content creator based in Dubai. Works with LuxeList for premium tour content. Active across luxury hotels, real estate, and high-end lifestyle.",
    availability: ["Monthly"],
    prismArchetype: "The Auteur",
    location: "Dubai, UAE",
    followers: 70700,
    engagementRate: 0.042,
    brandPartners: ["LuxeList", "Dubai luxury properties"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Luxury Campaign" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Hotel Content" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Tours Reel" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Hameda&background=0d0d1a&color=fbbf24&size=512",
    links: { instagram: "https://instagram.com/hamedanassiri" },
  },

  {
    id: "talent-dee",
    name: "Dee",
    displayTitle: "Content Creator · Social Media Manager",
    instagramHandle: "deemohamud",
    instagramUrl: "https://instagram.com/deemohamud",
    avatarUrl: "https://ui-avatars.com/api/?name=Dee&background=0d0d1a&color=34d399&size=512",
    primaryRole: "Content Creator",
    roleTags: ["Content Creator", "Social Media Manager", "Influencer", "Strategist"],
    platformTags: ["Instagram", "TikTok"],
    shortBio: "Creates lifestyle content, manages social pages, and handles brand partnerships. Experienced in luxury brands, F&B, and UAE lifestyle campaigns.",
    nicheSummary: "Content creator and social media manager based in Dubai. Credits include Aesop. Works across lifestyle, F&B, and premium brand accounts.",
    availability: ["Monthly"],
    prismArchetype: "The Amplifier",
    location: "Dubai, UAE",
    followers: 31300,
    engagementRate: 0.051,
    brandPartners: ["Aesop"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Luxury Content" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Brand Reel" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Lifestyle" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Dee&background=0d0d1a&color=34d399&size=512",
    links: { instagram: "https://instagram.com/deemohamud" },
  },


  {
    id: "talent-kiko",
    name: "Kiko",
    displayTitle: "Content Creator · Fashion Influencer",
    instagramHandle: "kiko_dubai",
    instagramUrl: "https://instagram.com/kiko_dubai",
    avatarUrl: "https://ui-avatars.com/api/?name=Kiko&background=0d0d1a&color=67e8f9&size=512",
    primaryRole: "Content Creator",
    roleTags: ["Content Creator", "Influencer", "UGC Creator", "Social Media Manager"],
    platformTags: ["Instagram"],
    shortBio: "Creates fashion and lifestyle content, handles brand partnerships, and produces UGC campaigns. Experienced in menswear, sportswear, and UAE retail brands.",
    nicheSummary: "Fashion content creator based in Dubai. Credits include Levi's, US Polo Assn, Crocs, and Splash. Best Fashion Influencer Dubai 2024.",
    availability: ["Monthly"],
    prismArchetype: "The Amplifier",
    location: "Dubai, UAE",
    followers: 31900,
    engagementRate: 0.049,
    brandPartners: ["Levi's", "Crocs", "Splash", "US Polo"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Fashion Campaign" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Brand Work" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Content Reel" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Kiko&background=0d0d1a&color=67e8f9&size=512",
    links: { instagram: "https://instagram.com/kiko_dubai" },
  },

  // ── HIVE SIGNATURE — Photographers ──────────────────────────────────────

  {
    id: "talent-altamash",
    name: "Altamash",
    displayTitle: "Photographer · Visual Artist",
    instagramHandle: "aljvd",
    instagramUrl: "https://instagram.com/aljvd",
    avatarUrl: "https://ui-avatars.com/api/?name=Altamash&background=0d0d1a&color=fbbf24&size=512",
    primaryRole: "Photographer",
    roleTags: ["Photographer", "Content Creator", "Videographer", "Producer"],
    platformTags: ["Instagram"],
    shortBio: "Shoots editorial portraits, fashion campaigns, and brand photography. Experienced in fashion, beauty, and events photography.",
    nicheSummary: "Photographer based in Dubai. Covers fashion editorials, portrait sessions, brand campaigns, and events.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Auteur",
    location: "Dubai, UAE",
    followers: 78700,
    engagementRate: 0.035,
    brandPartners: ["Fashion brands", "Editorial clients", "UAE luxury"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Editorial" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Brand Photography" },
      { type: "image", src: "/portfolio/work-3.svg", title: "Portraiture" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Altamash&background=0d0d1a&color=fbbf24&size=512",
    links: { instagram: "https://instagram.com/aljvd" },
  },


  {
    id: "talent-hala",
    name: "Hala",
    displayTitle: "Photographer · UAE Licensed",
    instagramHandle: "hala.portrait.photography",
    instagramUrl: "https://instagram.com/hala.portrait.photography",
    avatarUrl: "https://ui-avatars.com/api/?name=Hala&background=0d0d1a&color=fbbf24&size=512",
    primaryRole: "Photographer",
    roleTags: ["Photographer", "Content Creator", "Videographer", "Producer"],
    platformTags: ["Instagram"],
    shortBio: "Shoots fashion, beauty, event, and portrait photography. Experienced in editorial, lifestyle, and UAE-based brand campaigns.",
    nicheSummary: "Licensed photographer and videographer based in Dubai. UAE Advertiser Permit 5291081. Covers fashion, beauty, events, and portrait commissions.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Auteur",
    location: "Dubai, UAE",
    followers: 17000,
    engagementRate: 0.053,
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Portrait Work" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Fashion Photography" },
      { type: "image", src: "/portfolio/work-3.svg", title: "Events Coverage" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Hala&background=0d0d1a&color=fbbf24&size=512",
    links: { instagram: "https://instagram.com/hala.portrait.photography" },
  },

  // ── HIVE SIGNATURE — Wardrobe Stylists ───────────────────────────────────

  {
    id: "talent-imane",
    name: "Imane",
    displayTitle: "Wardrobe Stylist · MBC Network",
    instagramHandle: "amynassiri",
    instagramUrl: "https://instagram.com/amynassiri",
    avatarUrl: "https://ui-avatars.com/api/?name=Imane&background=0d0d1a&color=f9a8d4&size=512",
    primaryRole: "Content Creator",
    roleTags: ["Content Creator", "Influencer", "Producer", "Social Media Manager"],
    platformTags: ["Instagram"],
    shortBio: "Styles wardrobe for TV productions, fashion shoots, and brand campaigns. Experienced in broadcast, editorial, and commercial styling.",
    nicheSummary: "Wardrobe stylist at MBC Group based in Dubai. Credits include Shahid VOD TV series OMMI. Works across broadcast, editorial, and brand productions.",
    availability: ["Monthly"],
    prismArchetype: "The Auteur",
    location: "Dubai, UAE",
    followers: 99000,
    engagementRate: 0.038,
    brandPartners: ["MBC Group", "Shahid VOD", "Fashion brands"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Editorial Styling" },
      { type: "image", src: "/portfolio/work-2.svg", title: "TV Production" },
      { type: "image", src: "/portfolio/work-3.svg", title: "Brand Campaigns" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Imane&background=0d0d1a&color=f9a8d4&size=512",
    links: { instagram: "https://instagram.com/amynassiri" },
  },


  {
    id: "talent-maisoon",
    name: "Maisoon",
    displayTitle: "Wardrobe Stylist · Fashion Week",
    instagramHandle: "maisoon_styling",
    instagramUrl: "https://instagram.com/maisoon_styling",
    avatarUrl: "https://ui-avatars.com/api/?name=Maisoon&background=0d0d1a&color=f9a8d4&size=512",
    primaryRole: "Content Creator",
    roleTags: ["Content Creator", "Influencer", "Social Media Manager", "Photographer"],
    platformTags: ["Instagram"],
    shortBio: "Styles outfits for brand shoots, creates fashion UGC content, and consults on wardrobe direction. Experienced in fashion, lifestyle, and UAE campaign styling.",
    nicheSummary: "Wardrobe stylist based in Dubai with Dubai Fashion Week experience. Covers brand shoot wardrobing, fashion UGC, and styling consultation.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Auteur",
    location: "Dubai, UAE",
    followers: 17300,
    engagementRate: 0.057,
    brandPartners: ["Dubai Fashion Week", "Fashion brands"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Styling Portfolio" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Fashion Week" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Content Reel" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Maisoon&background=0d0d1a&color=f9a8d4&size=512",
    links: { instagram: "https://instagram.com/maisoon_styling" },
  },

  // ── HIVE SELECT — UGC Creators ───────────────────────────────────────────

  {
    id: "talent-arti",
    name: "Arti",
    displayTitle: "UGC Creator · Beauty Specialist",
    instagramHandle: "divabeautyae",
    instagramUrl: "https://instagram.com/divabeautyae",
    avatarUrl: "https://ui-avatars.com/api/?name=Arti&background=0d0d1a&color=f9a8d4&size=512",
    primaryRole: "UGC Creator",
    roleTags: ["UGC Creator", "Content Creator", "Influencer", "Social Media Manager"],
    platformTags: ["Instagram", "TikTok"],
    shortBio: "Produces beauty UGC videos, writes product reviews, and manages brand campaign content. Experienced in skincare, makeup, and UAE beauty brand partnerships.",
    nicheSummary: "UAE Advertiser Permitted UGC creator based in Dubai. Credits include Pixibeauty and Ksecret Skincare. Covers product reviews, unboxing, and beauty tutorials.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Amplifier",
    location: "Dubai, UAE",
    followers: 24500,
    engagementRate: 0.062,
    brandPartners: ["Pixibeauty", "Ksecret Skincare"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Beauty UGC" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Product Review" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Brand Collab" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Arti&background=0d0d1a&color=f9a8d4&size=512",
    links: { instagram: "https://instagram.com/divabeautyae" },
  },


  // ── HIVE SELECT — Art Directors ───────────────────────────────────────────

  {
    id: "talent-cheb",
    name: "Cheb",
    displayTitle: "Art Director · Creative Director",
    instagramHandle: "chebmoha",
    instagramUrl: "https://instagram.com/chebmoha",
    avatarUrl: "https://ui-avatars.com/api/?name=Cheb&background=0d0d1a&color=a78bfa&size=512",
    primaryRole: "Creative Director",
    roleTags: ["Creative Director", "Content Creator", "Producer", "Strategist"],
    platformTags: ["Instagram"],
    shortBio: "Art directs brand campaigns, directs shoots, and develops visual concepts. Experienced in sportswear, streetwear, and fashion brand productions.",
    nicheSummary: "Art director and creative director based in Dubai under @shababintl. Credits include Dior Sport, Carhartt, KSA Nike Workshop, and Mercurial.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Alchemist",
    location: "Dubai, UAE",
    tier: "Tier 1",
    followers: 38100,
    engagementRate: 0.051,
    brandPartners: ["Dior Sport", "Carhartt", "Nike", "Mercurial"],
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Brand Direction" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Nike Workshop" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Campaign Reel" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Cheb&background=0d0d1a&color=a78bfa&size=512",
    links: { instagram: "https://instagram.com/chebmoha", website: "https://www.shabab.world" },
  },

  {
    id: "talent-ahmed-baageel",
    name: "Ahmed",
    displayTitle: "Art Director · Production Designer",
    instagramHandle: "ba3geel",
    instagramUrl: "https://instagram.com/ba3geel",
    avatarUrl: "https://ui-avatars.com/api/?name=Ahmed&background=0d0d1a&color=a78bfa&size=512",
    primaryRole: "Creative Director",
    roleTags: ["Creative Director", "Producer", "Content Creator", "Strategist"],
    platformTags: ["Instagram"],
    shortBio: "Art directs productions, designs sets and environments, and oversees visual execution on-location. Experienced in architectural design and commercial production.",
    nicheSummary: "Architect, art director, and production designer based in Dubai. Founder of @makzn.7. Covers campaign art direction, set design, and brand production.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Alchemist",
    location: "Dubai, UAE",
    tier: "Tier 1",
    followers: 19700,
    engagementRate: 0.043,
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Art Direction" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Production Design" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Campaign Work" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Ahmed&background=0d0d1a&color=a78bfa&size=512",
    links: { instagram: "https://instagram.com/ba3geel", website: "https://www.makzn7.com" },
  },


  // ── HIVE SELECT — Strategists & Operators ────────────────────────────────

  {
    id: "talent-reem",
    name: "Reem",
    displayTitle: "Content Creator · Editor",
    instagramHandle: "reemaloteibi",
    instagramUrl: "https://instagram.com/reemaloteibi",
    avatarUrl: "https://ui-avatars.com/api/?name=Reem&background=111827&color=c4b5fd&size=512",
    primaryRole: "Content Creator",
    roleTags: ["Content Creator", "Strategist", "Editor", "Social Media Manager"],
    platformTags: ["Instagram"],
    shortBio: "Edits virality-friendly long and short-form videos, manages social pages, and supports brand content strategy. Experienced in F&B, beauty, and automotive.",
    nicheSummary: "Content creator and editor based in Dubai. Works across F&B, beauty, and automotive brands on social and campaign productions.",
    availability: ["Monthly"],
    prismArchetype: "The Auteur",
    location: "Dubai, UAE",
    tier: "Tier 1",
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Content Portfolio" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Campaign Work" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Visual Storytelling" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Reem&background=111827&color=c4b5fd&size=512",
    links: { instagram: "https://instagram.com/reemaloteibi" },
  },

  {
    id: "talent-tony",
    name: "Tony",
    displayTitle: "Creative Director · Strategist",
    instagramHandle: "tonyeich",
    instagramUrl: "https://instagram.com/tonyeich",
    avatarUrl: "https://ui-avatars.com/api/?name=Tony&background=111827&color=c4b5fd&size=512",
    primaryRole: "Creative Director",
    roleTags: ["Creative Director", "Strategist", "Social Media Manager", "Content Creator"],
    platformTags: ["Instagram"],
    shortBio: "Leads creative direction, develops campaign strategy, and manages brand execution. Experienced in hospitality, travel, and F&B brand campaigns.",
    nicheSummary: "Creative director based in Dubai. Works across hospitality, travel, and F&B brands with experience in UAE tourism and destination campaigns.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Amplifier",
    location: "Dubai, UAE",
    tier: "Tier 1",
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Hospitality Campaign" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Travel Content" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Destination Brand" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Tony&background=111827&color=c4b5fd&size=512",
    links: { instagram: "https://instagram.com/tonyeich" },
  },

  {
    id: "talent-ajil",
    name: "Ajil",
    displayTitle: "Brand Strategist · Project Lead",
    instagramHandle: "madmankind",
    instagramUrl: "https://instagram.com/madmankind",
    avatarUrl: "https://ui-avatars.com/api/?name=Ajil&background=111827&color=c4b5fd&size=512",
    primaryRole: "Strategist",
    roleTags: ["Account Director", "Project Manager", "Strategist", "Talent Manager"],
    platformTags: ["Instagram"],
    shortBio: "Manages campaigns end-to-end, builds creative systems, and leads project execution. Experienced in brand strategy, operations, and creative team management.",
    nicheSummary: "Brand strategist and project lead based in Dubai. Works across creative operations, campaign management, and content-led brand strategy.",
    availability: ["Hourly"],
    prismArchetype: "The Alchemist",
    location: "Dubai, UAE",
    tier: "Tier 1",
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Brand Strategy" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Project Work" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Creative Operations" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Ajil&background=111827&color=c4b5fd&size=512",
    links: { instagram: "https://instagram.com/madmankind" },
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
