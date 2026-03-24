"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Instagram, ExternalLink, CheckCircle2, Star,
  Zap, Radio, Layers, Film, Languages, Music2, FlaskConical, Compass,
  Clock, Eye, TrendingUp, MessageSquare, Calendar, Play,
} from "lucide-react";

type AvailabilityStatus = "AVAILABLE" | "BUSY" | "UNAVAILABLE";
type PortfolioItem = { id: string; title?: string | null; caption?: string | null; mediaUrl: string; mediaType: string; thumbnailUrl?: string | null; externalLink?: string | null; platform?: string | null };
type CreatorData = {
  id: string; name: string; bio?: string | null; location?: string | null;
  instagram?: string | null; tiktok?: string | null; youtube?: string | null;
  avatarUrl?: string | null; skills: string[]; niches: string[];
  prismArchetype?: string | null; availabilityStatus: string;
  profileViews: number; totalEarned: number; responseRate?: number | null;
  avgResponseHours?: number | null; isVerified: boolean;
  instagramVerified: boolean; tiktokVerified: boolean;
  qualityScore?: number | null; talentStatus: string;
  portfolioItems: PortfolioItem[];
  hourlyRate?: number | null; dayRate?: number | null;
};

const ARCHETYPE_CFG: Record<string, { icon: React.ElementType; color: string; bg: string; ring: string }> = {
  "The Maverick":   { icon: Zap,         color: "#FBBf24", bg: "rgba(251,191,36,0.12)",  ring: "rgba(251,191,36,0.35)" },
  "The Amplifier":  { icon: Radio,        color: "#34D399", bg: "rgba(52,211,153,0.12)",  ring: "rgba(52,211,153,0.35)" },
  "The Architect":  { icon: Layers,       color: "#60A5FA", bg: "rgba(96,165,250,0.12)",  ring: "rgba(96,165,250,0.35)" },
  "The Auteur":     { icon: Film,         color: "#A78BFA", bg: "rgba(167,139,250,0.12)", ring: "rgba(167,139,250,0.35)" },
  "The Translator": { icon: Languages,    color: "#22D3EE", bg: "rgba(34,211,238,0.12)",  ring: "rgba(34,211,238,0.35)" },
  "The Conductor":  { icon: Music2,       color: "#F472B6", bg: "rgba(244,114,182,0.12)", ring: "rgba(244,114,182,0.35)" },
  "The Alchemist":  { icon: FlaskConical, color: "#FB923C", bg: "rgba(251,146,60,0.12)",  ring: "rgba(251,146,60,0.35)" },
  "The Pathfinder": { icon: Compass,      color: "#2DD4BF", bg: "rgba(45,212,191,0.12)",  ring: "rgba(45,212,191,0.35)" },
};

const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { label: string; dot: string; bg: string; text: string }> = {
  AVAILABLE:   { label: "Available",   dot: "#10B981", bg: "rgba(16,185,129,0.12)",  text: "#10B981" },
  BUSY:        { label: "Busy",        dot: "#F59E0B", bg: "rgba(245,158,11,0.12)",  text: "#F59E0B" },
  UNAVAILABLE: { label: "Unavailable", dot: "#EF4444", bg: "rgba(239,68,68,0.12)",   text: "#EF4444" },
};

const TIER_CONFIG = {
  HIVE_SIGNATURE: { label: "Hive Signature", bg: "rgba(124,92,255,0.15)", text: "rgba(167,139,250,0.95)", ring: "rgba(124,92,255,0.40)" },
  HIVE_SELECT:    { label: "Hive Select",    bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.65)", ring: "rgba(255,255,255,0.15)" },
};

function fmtAED(cents: number) {
  if (cents === 0) return "—";
  return `AED ${(cents / 100).toLocaleString()}`;
}

export function CreatorPublicProfile({ creator }: { creator: CreatorData }) {
  const [tab, setTab] = useState<"portfolio" | "about" | "rates">("portfolio");
  const [expanded, setExpanded] = useState<string | null>(null);

  const availability = (creator.availabilityStatus as AvailabilityStatus) ?? "AVAILABLE";
  const avail = AVAILABILITY_CONFIG[availability];
  const archetype = creator.prismArchetype ? ARCHETYPE_CFG[creator.prismArchetype] : null;
  const ArchIcon = archetype?.icon;
  const tier = (creator.qualityScore ?? 0) >= 8 ? "HIVE_SIGNATURE" : "HIVE_SELECT";
  const tierCfg = TIER_CONFIG[tier];

  return (
    <div className="min-h-screen w-full" style={{ background: "#07070B", color: "rgba(255,255,255,0.88)" }}>
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 60%)", opacity: 0.08 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 30%, #7c3aed 0%, #4c1d95 55%, transparent 100%)", filter: "blur(180px)", opacity: 0.09 }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-16 pb-24">
        {/* Hero section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-start gap-5 mb-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              {creator.avatarUrl ? (
                <img src={creator.avatarUrl} alt={creator.name} className="w-20 h-20 rounded-2xl object-cover ring-1 ring-white/10" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-semibold text-white/60">
                  {creator.name.charAt(0)}
                </div>
              )}
              {/* Availability dot */}
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: avail.bg, boxShadow: `0 0 0 1.5px ${avail.dot}` }}>
                <div className="w-2 h-2 rounded-full" style={{ background: avail.dot }} />
              </div>
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-semibold text-white">{creator.name}</h1>
                {creator.isVerified && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
              </div>
              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {/* Tier */}
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ background: tierCfg.bg, color: tierCfg.text, boxShadow: `0 0 0 1px ${tierCfg.ring}` }}>
                  {tierCfg.label}
                </span>
                {/* Archetype */}
                {archetype && ArchIcon && (
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium flex items-center gap-1.5" style={{ background: archetype.bg, color: archetype.color, boxShadow: `0 0 0 1px ${archetype.ring}` }}>
                    <ArchIcon style={{ width: 11, height: 11 }} />
                    {creator.prismArchetype}
                  </span>
                )}
                {/* Availability */}
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium flex items-center gap-1.5" style={{ background: avail.bg, color: avail.text, boxShadow: `0 0 0 1px ${avail.dot}30` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: avail.dot }} />
                  {avail.label}
                </span>
              </div>
              {/* Location */}
              {creator.location && (
                <div className="flex items-center gap-1.5 text-[13px] text-white/45 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {creator.location}
                </div>
              )}
              {/* Stats row */}
              <div className="flex items-center gap-4 text-[12px] text-white/45">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {creator.profileViews.toLocaleString()} views</span>
                {creator.responseRate != null && (
                  <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {Math.round(creator.responseRate * 100)}% response</span>
                )}
                {creator.avgResponseHours != null && (
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Responds in ~{creator.avgResponseHours}h</span>
                )}
              </div>
            </div>

            {/* CTA column */}
            <div className="shrink-0 flex flex-col gap-2">
              <a
                href={`/?book=${creator.id}`}
                className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-medium transition"
                style={{ background: "rgba(124,92,255,0.25)", color: "rgba(167,139,250,0.95)", boxShadow: "0 0 0 1px rgba(124,92,255,0.45)" }}
              >
                <Calendar className="w-4 h-4" />
                Book now
              </a>
              <a
                href={`/dashboard/messages?to=${creator.id}`}
                className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-medium transition"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)", boxShadow: "0 0 0 1px rgba(255,255,255,0.10)" }}
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </a>
            </div>
          </div>

          {/* Bio */}
          {creator.bio && (
            <p className="text-[14px] leading-relaxed text-white/65 mb-6 max-w-xl">
              {creator.bio}
            </p>
          )}

          {/* Social links */}
          <div className="flex items-center gap-3 mb-8">
            {creator.instagram && (
              <a href={`https://instagram.com/${creator.instagram.replace("@", "")}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>
                <Instagram className="w-3.5 h-3.5" />
                @{creator.instagram.replace("@", "")}
                {creator.instagramVerified && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            )}
            {creator.tiktok && (
              <a href={`https://tiktok.com/@${creator.tiktok.replace("@", "")}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>
                <span className="text-[12px]">TikTok</span>
                @{creator.tiktok.replace("@", "")}
                {creator.tiktokVerified && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
              </a>
            )}
          </div>
        </motion.div>

        {/* Tab nav */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {(["portfolio", "about", "rates"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-[13px] font-medium capitalize transition"
              style={{
                background: tab === t ? "rgba(255,255,255,0.10)" : "transparent",
                color: tab === t ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.45)",
                boxShadow: tab === t ? "0 0 0 1px rgba(255,255,255,0.10)" : "none",
              }}>
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Portfolio tab */}
          {tab === "portfolio" && (
            <motion.div key="portfolio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {creator.portfolioItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/25 gap-3">
                  <Play className="w-10 h-10" />
                  <p className="text-[13px]">Portfolio coming soon</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {creator.portfolioItems.map(item => (
                    <div key={item.id} className="relative rounded-xl overflow-hidden aspect-video cursor-pointer group"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                      {item.mediaType === "image" ? (
                        <img src={item.thumbnailUrl ?? item.mediaUrl} alt={item.title ?? "Portfolio"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/30">
                          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        {item.title && <p className="text-[12px] font-medium text-white">{item.title}</p>}
                        {item.caption && <p className="text-[11px] text-white/60 line-clamp-2">{item.caption}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* About tab */}
          {tab === "about" && (
            <motion.div key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="space-y-6">
                {creator.skills.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.skills.map(s => (
                        <span key={s} className="rounded-full px-3 py-1 text-[12px] text-white/70"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {creator.niches.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">Niches</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.niches.map(n => (
                        <span key={n} className="rounded-full px-3 py-1 text-[12px] text-white/70"
                          style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.18)", color: "rgba(167,139,250,0.85)" }}>{n}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Rates tab */}
          {tab === "rates" && (
            <motion.div key="rates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Day Rate", value: creator.dayRate ? fmtAED(creator.dayRate) : "On request" },
                  { label: "Hourly Rate", value: creator.hourlyRate ? fmtAED(creator.hourlyRate) : "On request" },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl p-5"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[11px] uppercase tracking-widest text-white/35 mb-2">{item.label}</p>
                    <p className="text-[22px] font-semibold text-white/90">{item.value}</p>
                  </div>
                ))}
                <div className="col-span-2 rounded-2xl p-5"
                  style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.20)" }}>
                  <p className="text-[12px] text-white/55 leading-relaxed">
                    All rates quoted in AED. Project-based pricing available.
                    <a href={`/?book=${creator.id}`} className="ml-2 text-purple-400 hover:text-purple-300 underline">
                      Get a custom quote →
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
