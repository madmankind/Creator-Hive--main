export type AvailabilityTag = "Hourly" | "Monthly";

/** TOGGLE: Set to true to show named Signature talent in the carousel. Set to false to hide them. */
export const SHOW_SIGNATURE_TALENT = false;

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
  /** Client-facing display name (e.g. "Shay" for "Shay Thomas"). Falls back to first name if not set. */
  displayName?: string;
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
  /** true = talent is based outside UAE and operates globally */
  isGlobal?: boolean;
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
    languages: ["EN", "AR"],
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
    displayTitle: "Filmmaker · Content Creator",
    instagramHandle: "islamabdallamedia",
    instagramUrl: "https://instagram.com/islamabdallamedia",
    avatarUrl: "https://ui-avatars.com/api/?name=Islam&background=0d0d1a&color=6ee7b7&size=512",
    primaryRole: "Videographer",
    roleTags: ["Videographer", "Producer", "Content Creator", "Editor"],
    platformTags: ["Instagram"],
    shortBio: "Shoots and directs social films and brand content. Experienced in automotive, lifestyle, and bilingual campaign productions.",
    nicheSummary: "Filmmaker based in Dubai. Credits include Jeep Wrangler. Delivers Arabic and bilingual brand films for automotive and lifestyle campaigns.",
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
    roleTags: ["Content Creator", "Videographer", "Photographer", "Editor"],
    platformTags: ["Instagram"],
    shortBio: "Produces hotel and destination content, travel reels, and brand event coverage. Experienced in luxury hospitality, tourism, and destination campaigns.",
    nicheSummary: "Hotel and destination content creator based in Abu Dhabi. Brand credits include Burj Al Arab, Jumeirah, Anantara, Marsa Al Arab, and Atlantis.",
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
    displayTitle: "Content Creator · Travel & Hospitality",
    instagramHandle: "roaming_blogger",
    instagramUrl: "https://instagram.com/roaming_blogger",
    avatarUrl: "https://ui-avatars.com/api/?name=Nihad&background=0d0d1a&color=34d399&size=512",
    primaryRole: "Content Creator",
    roleTags: ["Content Creator", "Editor", "Photographer", "Social Media Manager"],
    platformTags: ["Instagram"],
    shortBio: "Creates travel and hospitality content, manages brand partnerships, and produces destination campaigns. Experienced in hotels, airlines, and tourism boards.",
    nicheSummary: "Travel and hospitality content creator based in Dubai. Credits include Air Asia, Conrad, Hyatt, Dubai Holdings, Marriott, and Dubai Shopping Festival.",
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
    roleTags: ["Content Creator", "UGC Creator", "Photographer", "Social Media Manager"],
    platformTags: ["Instagram", "TikTok"],
    shortBio: "Creates fitness and lifestyle content, manages social pages, and runs brand activation campaigns. Experienced in wellness, F&B, and Gulf lifestyle brands.",
    nicheSummary: "Content creator based in Dubai. Works across fitness, wellness, and lifestyle brands on Instagram and TikTok.",
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
    roleTags: ["Content Creator", "UGC Creator", "Social Media Manager", "Photographer"],
    platformTags: ["Instagram", "TikTok"],
    shortBio: "Produces beauty and makeup content, covers events, and manages social channels. Experienced in beauty brands, lifestyle events, and campaign productions.",
    nicheSummary: "Content creator and makeup artist based in Dubai. Credits include Fenty Beauty, UNTOLD Dubai, and HTBAR.",
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
    roleTags: ["Content Creator", "UGC Creator", "Photographer", "Social Media Manager"],
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
    roleTags: ["Content Creator", "Social Media Manager", "Copywriter", "Strategist"],
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
    roleTags: ["Content Creator", "Photographer", "UGC Creator", "Social Media Manager"],
    platformTags: ["Instagram"],
    shortBio: "Creates fashion and lifestyle content, handles brand partnerships, and produces UGC campaigns. Experienced in menswear, sportswear, and UAE retail brands.",
    nicheSummary: "Fashion content creator based in Dubai. Credits include Levi's, US Polo Assn, Crocs, and Splash.",
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
    displayTitle: "Photographer · Videographer",
    instagramHandle: "hala.portrait.photography",
    instagramUrl: "https://instagram.com/hala.portrait.photography",
    avatarUrl: "https://ui-avatars.com/api/?name=Hala&background=0d0d1a&color=fbbf24&size=512",
    primaryRole: "Photographer",
    roleTags: ["Photographer", "Content Creator", "Videographer", "Producer"],
    platformTags: ["Instagram"],
    shortBio: "Shoots fashion, beauty, event, and portrait photography. Experienced in editorial, lifestyle, and commercial campaigns.",
    nicheSummary: "Photographer and videographer based in Dubai. Covers fashion, beauty, events, and portrait commissions.",
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
    roleTags: ["Content Creator", "Creative Director", "Producer", "Social Media Manager"],
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
    roleTags: ["Content Creator", "Social Media Manager", "Photographer"],
    platformTags: ["Instagram"],
    shortBio: "Styles outfits for brand shoots, creates fashion UGC content, and consults on wardrobe direction. Experienced in fashion, lifestyle, and campaign styling.",
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
    roleTags: ["UGC Creator", "Content Creator", "Photographer", "Social Media Manager"],
    platformTags: ["Instagram", "TikTok"],
    shortBio: "Produces beauty UGC videos, writes product reviews, and manages brand campaign content. Experienced in skincare, makeup, and beauty brand partnerships.",
    nicheSummary: "UGC creator based in Dubai. Credits include Pixibeauty and Ksecret Skincare. Covers product reviews, unboxing, and beauty tutorials.",
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


  // ── HIVE SELECT — Video Editors & Motion ─────────────────────────────────

  {
    id: "talent-irene",
    name: "Irene Zoe Dattini",
    displayName: "Irene",
    displayTitle: "Video Editor · Art Director",
    instagramHandle: "",
    instagramUrl: "",
    avatarUrl: "https://ui-avatars.com/api/?name=Irene+Zoe&background=1a0d2e&color=c4b5fd&size=512",
    primaryRole: "Editor",
    roleTags: ["Editor", "Creative Director", "Designer", "Other"],
    platformTags: ["YouTube"],
    shortBio: "Edits and art directs high-end brand films, music videos, and fashion campaigns with a distinct Italian-European aesthetic. Brings motion design and visual storytelling together for luxury, automotive, and fashion brands.",
    nicheSummary: "Dual-based in Italy and UAE, Irene blends European editorial sensibility with Gulf market fluency — cutting fashion, luxury, and automotive content that holds its own on any international brief.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Auteur",
    location: "Italy · Dubai, UAE",
    isGlobal: true,
    languages: ["EN", "IT"],
    tier: "Tier 1",
    brandPartners: [],
    featuredVideoUrl: "https://www.youtube.com/watch?v=t9_9e4BcaAc&list=PLIsgxj5eY8rWJlWBq37w6SHdDuGpvAVVe",
    portfolio: [
      { type: "video", src: "https://www.youtube.com/watch?v=t9_9e4BcaAc", poster: "https://img.youtube.com/vi/t9_9e4BcaAc/maxresdefault.jpg", title: "Showreel" },
      { type: "image", src: "/portfolio/work-1.svg", title: "Art Direction" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Motion Design" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Irene+Zoe&background=1a0d2e&color=c4b5fd&size=512",
    links: {
      youtube: "https://www.youtube.com/watch?v=t9_9e4BcaAc&list=PLIsgxj5eY8rWJlWBq37w6SHdDuGpvAVVe",
    },
  },

  // ── HIVE SIGNATURE — Sound Design & Music Production ────────────────────

  {
    id: "talent-kss",
    name: "Kerberos & Styx",
    displayTitle: "Sound Design · Music Production · Sonic Branding",
    instagramHandle: "kerberos.and.styx",
    instagramUrl: "https://instagram.com/kerberos.and.styx",
    avatarUrl: "https://ui-avatars.com/api/?name=KSS&background=0d0d1a&color=a78bfa&size=512",
    primaryRole: "Producer",
    roleTags: ["Producer", "Creative Director", "Strategist", "Other"],
    platformTags: ["Instagram"],
    shortBio: "Designs original music and custom sounds for sonic branding, film, documentaries, and app/software UX. Experienced in brand audio, art installations, and product sound design.",
    nicheSummary: "Netherlands and UAE-based sound design and music production studio founded by Nisham Olakara. Specialises in sonic branding, original scores for film and documentaries, and custom UX sound for apps and devices.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Auteur",
    location: "Netherlands · Dubai, UAE",
    isGlobal: true,
    tier: "Tier 1",
    brandPartners: ["Sonic branding", "Film production", "Software & app companies"],
    portfolio: [
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Sonic Branding Reel" },
      { type: "image", src: "/portfolio/work-1.svg", title: "Sound Design" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Film Score" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=KSS&background=0d0d1a&color=a78bfa&size=512",
    links: {
      instagram: "https://instagram.com/kerberos.and.styx",
      website: "https://www.kerberosandstyx.com",
    },
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
    id: "talent-aziza",
    name: "Aziza",
    displayTitle: "Brand Strategist · Account Manager",
    instagramHandle: "",
    instagramUrl: "",
    avatarUrl: "https://ui-avatars.com/api/?name=Aziza&background=111827&color=c4b5fd&size=512",
    primaryRole: "Strategist",
    roleTags: ["Strategist", "Account Manager", "Account Director", "Project Manager"],
    platformTags: ["LinkedIn"],
    shortBio: "Develops brand strategy, guides campaign direction, and manages creative projects. Experienced in brand positioning, campaign management, and creative operations.",
    nicheSummary: "Brand strategist and account manager based in Dubai. Dual role across strategy and account management at Creator Hive.",
    availability: ["Monthly"],
    prismArchetype: "The Conductor",
    location: "Dubai, UAE",
    tier: "Tier 1",
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Strategy Work" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Account Management" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Campaign Coordination" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Aziza&background=111827&color=c4b5fd&size=512",
    links: {},
  },


  {
    id: "talent-shay-thomas",
    name: "Shay Thomas",
    displayName: "Shay",
    displayTitle: "PR Manager",
    instagramHandle: "",
    instagramUrl: "",
    avatarUrl: "https://ui-avatars.com/api/?name=Shay+Thomas&background=111827&color=c4b5fd&size=512",
    primaryRole: "Other",
    roleTags: ["Other", "Strategist", "Social Media Manager", "Account Manager"],
    platformTags: ["LinkedIn"],
    shortBio: "Manages public relations, coordinates media outreach, and oversees brand communications. Experienced in PR, media relations, and brand reputation.",
    nicheSummary: "PR manager based in Dubai. Handles public relations management at Creator Hive.",
    availability: ["Monthly"],
    prismArchetype: "The Conductor",
    location: "Dubai, UAE",
    tier: "Tier 1",
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "PR Campaigns" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Media Relations" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Brand Comms" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Shay+Thomas&background=111827&color=c4b5fd&size=512",
    links: {},
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


{
    id: "talent-abir",
    name: "Abir",
    displayTitle: "Talent Manager",
    instagramHandle: "",
    instagramUrl: "",
    avatarUrl: "https://ui-avatars.com/api/?name=Abir&background=111827&color=c4b5fd&size=512",
    primaryRole: "Talent Manager",
    roleTags: ["Talent Manager", "Account Manager", "Strategist", "Project Manager"],
    platformTags: ["LinkedIn"],
    shortBio: "Sources talent, manages creator relationships, and oversees onboarding. Experienced in talent management, creator operations, and roster development.",
    nicheSummary: "Talent manager based in Dubai. Handles talent sourcing, management, and onboarding at Creator Hive.",
    availability: ["Monthly"],
    prismArchetype: "The Conductor",
    location: "Dubai, UAE",
    tier: "Tier 1",
    portfolio: [
      { type: "image", src: "/portfolio/work-1.svg", title: "Talent Sourcing" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Creator Management" },
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Onboarding" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Abir&background=111827&color=c4b5fd&size=512",
    links: {},
  },
{
    id: "talent-fils",
    name: "Fils",
    displayTitle: "Music Producer",
    instagramHandle: "",
    instagramUrl: "",
    avatarUrl: "https://ui-avatars.com/api/?name=Fils&background=0d0d1a&color=a78bfa&size=512",
    primaryRole: "Producer",
    roleTags: ["Producer", "Creative Director", "Strategist", "Other"],
    platformTags: ["LinkedIn"],
    shortBio: "Produces original music, composes scores, and delivers production work. Experienced in music production, composition, and studio work.",
    nicheSummary: "Music producer based in Dubai. LinkedIn profile for production and composition work.",
    availability: ["Hourly", "Monthly"],
    prismArchetype: "The Auteur",
    location: "Dubai, UAE",
    tier: "Tier 1",
    portfolio: [
      { type: "video", src: "/portfolio/work-3.svg", poster: "/portfolio/work-3.svg", title: "Music Reel" },
      { type: "image", src: "/portfolio/work-1.svg", title: "Production Work" },
      { type: "image", src: "/portfolio/work-2.svg", title: "Composition" },
    ],
    profileImageUrl: "https://ui-avatars.com/api/?name=Fils&background=0d0d1a&color=a78bfa&size=512",
    links: { website: "https://linkedin.com/in/anurag-ajith" },
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

/**
 * Derive the closest PRISM archetype from the client's briefing fit profile.
 * Called once per search session — the result is shown as a badge on all matched cards.
 */
export function deriveArchetypeFromClientFit(
  fit: Record<string, unknown> | null,
  primaryObjective?: string
): PrismArchetypeName | null {
  if (!fit && !primaryObjective) return null;

  const pace = String(fit?.pace ?? "").toLowerCase();
  const feedback = String(fit?.feedbackStyle ?? "").toLowerCase();
  const workKind = String(fit?.workKind ?? "").toLowerCase();
  const howWork = String(fit?.howWorkRuns ?? "").toLowerCase();
  const engagement = String(fit?.engagement ?? "").toLowerCase();
  const objective = (primaryObjective ?? "").toLowerCase();

  // Fast / iterative / performance → Maverick
  if (pace.includes("fast") || pace.includes("sprint") || engagement.includes("hourly")) return "The Maverick";
  // Strategy / orchestration / multi-platform → Conductor
  if (objective.includes("strategy") || workKind.includes("strategy") || howWork.includes("team") || howWork.includes("multiple")) return "The Conductor";
  // Exploration / brand building / new market → Pathfinder
  if (objective.includes("awareness") || objective.includes("brand") || engagement.includes("exploring")) return "The Pathfinder";
  // B2B / technical / complex narrative → Translator
  if (workKind.includes("b2b") || workKind.includes("technical") || workKind.includes("linkedin")) return "The Translator";
  // High production / structured / long-form → Architect
  if (workKind.includes("video") || workKind.includes("production") || pace.includes("structured")) return "The Architect";
  // Visual / design / identity → Alchemist
  if (workKind.includes("design") || workKind.includes("visual") || workKind.includes("brand identity")) return "The Alchemist";
  // Luxury / editorial / premium → Auteur
  if (workKind.includes("luxury") || workKind.includes("premium") || feedback.includes("editorial")) return "The Auteur";
  // UGC / social / performance ads → Amplifier
  if (objective.includes("ugc") || objective.includes("conversion") || objective.includes("performance")) return "The Amplifier";

  return null;
}
