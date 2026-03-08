"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RotateCcw, Maximize2, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { Talent } from "@/store/useCampaignPodStore";
import type { CuratedTalent } from "@/lib/curatedTalent";
import type { MatchScore } from "@/lib/schemas/booking";
import { PRICING_TIER_DESCRIPTIONS } from "@/lib/schemas/booking";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { PrismBadge } from "@/components/prism/PrismBadge";

type LandingTalentCardProps = {
  talent: Talent;
  isAdded?: boolean;
  onAdd?: (talent: Talent) => void;
  onBook?: (talent: Talent) => void;
  curatedTalent: CuratedTalent;
  matchScore?: MatchScore; // Optional match score for display on back
  packageMatch?: { packageName: string; packageEmoji: string }; // Shows "Best for [package]" badge
};

/** Determine tier based on talent attributes */
function getTalentTier(talent: CuratedTalent): "HIVE_SELECT" | "HIVE_SIGNATURE" {
  const followers = talent.followers || 0;
  // Hive Signature: 50k+ followers (proven social influence)
  return followers >= 50000 ? "HIVE_SIGNATURE" : "HIVE_SELECT";
}

const TIER_STYLES = {
  HIVE_SELECT: {
    bg: "bg-white/5",
    text: "text-white/70",
    ring: "ring-white/20",
    label: "Hive Select",
  },
  HIVE_SIGNATURE: {
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    ring: "ring-purple-400/40",
    label: "Hive Signature",
  },
};

type BackTab = "about" | "portfolio" | "links";

const FILLER =
  /\b(creating|specialist|specializing|focused on|focus on|experts? in|expertise in)\b/gi

/** Deterministic premium summary: trim, collapse spaces, drop redundant filler, first sentence preferred, clean cutoff at maxChars. */
function getPremiumSummary(text: string, maxChars: number): string {
  let s = text.trim().replace(/\s+/g, " ")
  s = s.replace(FILLER, "").replace(/\s+/g, " ").trim()
  const first = s.split(/[.!?]+/)[0]?.trim()
  const use = first && first.length <= maxChars ? first : s
  if (use.length <= maxChars) return use
  const cut = use.slice(0, maxChars - 1).trim()
  const lastSpace = cut.lastIndexOf(" ")
  const out = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut
  return out + "…"
}

/** Front: premium blurb, standardized 90 chars for consistent 2-line display. Prefer nicheSummary, else shortBio. */
function getFrontSummary(t: CuratedTalent): string {
  const raw = t.nicheSummary?.trim() || t.shortBio?.trim() || ""
  return getPremiumSummary(raw, 90)
}

/** Back About: concise, max 180 chars, 4 lines. */
function getAboutSummary(t: CuratedTalent): string {
  const raw = t.nicheSummary?.trim() || t.shortBio?.trim() || ""
  return getPremiumSummary(raw, 180)
}

type LinkItem = { href: string; label: string; sublabel: string; icon: "instagram" | "tiktok" | "youtube" | "behance" | "twitch" | "website" }

/** Normalized links: prefer links.*, fallback to legacy. No fabricated URLs. */
function getLinkItems(t: CuratedTalent): LinkItem[] {
  const out: LinkItem[] = []
  const instagram = t.links?.instagram || t.instagramUrl
  if (instagram) out.push({ href: instagram, label: "Instagram", sublabel: `@${t.instagramHandle}`, icon: "instagram" })
  const tiktok = t.links?.tiktok || t.tiktokUrl
  if (tiktok) out.push({ href: tiktok, label: "TikTok", sublabel: t.tiktokHandle || "@username", icon: "tiktok" })
  if (t.links?.youtube) out.push({ href: t.links.youtube, label: "YouTube", sublabel: `@${t.instagramHandle}`, icon: "youtube" })
  if (t.links?.behance) out.push({ href: t.links.behance, label: "Behance", sublabel: "Portfolio", icon: "behance" })
  if (t.links?.twitch) out.push({ href: t.links.twitch, label: "Twitch", sublabel: "Live stream", icon: "twitch" })
  if (t.links?.website) out.push({ href: t.links.website, label: "Website", sublabel: t.links.website.replace(/^https?:\/\//, ""), icon: "website" })
  return out
}

function LinksTabContent({ curatedTalent }: { curatedTalent: CuratedTalent }) {
  const items = getLinkItems(curatedTalent)
  if (items.length === 0) return <p className="text-xs text-white/50 select-none py-2">No links available</p>
  return (
    <>
      {items.map((link) => (
        <a
          key={link.icon}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-3 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-3 transition"
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            link.icon === "instagram" && "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
            link.icon === "tiktok" && "bg-black/40",
            link.icon === "youtube" && "bg-red-500/20",
            link.icon === "behance" && "bg-blue-500/20",
            link.icon === "twitch" && "bg-purple-500/20",
            link.icon === "website" && "bg-white/10"
          )}>
            {link.icon === "website" ? <ExternalLink className="w-4 h-4 text-white/80" /> : <span className="w-4 h-4" aria-hidden />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/90 select-none">{link.label}</p>
            <p className="text-xs text-white/60 select-none truncate">{link.sublabel}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-white/40 shrink-0" />
        </a>
      ))}
    </>
  )
}

export function LandingTalentCard({
  talent,
  isAdded,
  onAdd,
  onBook,
  curatedTalent,
  matchScore,
  packageMatch,
}: LandingTalentCardProps) {
  const DEBUG_CARD_BOUNDS = false; // Set true to show card root / front / back outlines

  const [isFlipped, setIsFlipped] = useState(false);
  const [showExpandModal, setShowExpandModal] = useState(false);
  const [backTab, setBackTab] = useState<BackTab>("about");
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const portfolioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Handle escape key to close expand modal
  useEffect(() => {
    if (!showExpandModal) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowExpandModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showExpandModal]);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowExpandModal(true);
  };

  const portfolioItems = curatedTalent.portfolio || [];
  const currentPortfolioItem = portfolioItems[portfolioIndex];

  const nextPortfolio = () => {
    if (portfolioItems.length > 0) {
      setPortfolioIndex((prev) => (prev + 1) % portfolioItems.length);
    }
  };

  const prevPortfolio = () => {
    if (portfolioItems.length > 0) {
      setPortfolioIndex((prev) => (prev - 1 + portfolioItems.length) % portfolioItems.length);
    }
  };

  return (
    <TooltipProvider>
      <motion.article
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl",
          "bg-white/5 p-5 ring-1 ring-white/10",
          "w-[280px] h-[260px] flex-shrink-0",
          "cursor-pointer select-none",
          "transition-all duration-300",
          packageMatch
            ? "hover:ring-white/25 hover:shadow-[0_0_28px_rgba(255,255,255,0.06)] ring-white/[0.16]"
            : "hover:ring-white/20 hover:shadow-lg hover:shadow-white/5",
          DEBUG_CARD_BOUNDS && "outline outline-1 outline-red-500/40"
        )}
      >
        {/* Package match top-edge shimmer */}
        {packageMatch && (
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none z-10" />
        )}
        {/* Package match badge — inset in top edge, very subtle */}
        {packageMatch && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2.5 py-0.5 rounded-b-lg bg-white/[0.06] ring-1 ring-t-0 ring-white/[0.12] text-[9px] text-white/45 pointer-events-none tracking-[0.03em]">
            <span className="leading-none text-[10px]">{packageMatch.packageEmoji}</span>
            <span>{packageMatch.packageName}</span>
          </div>
        )}
        {/* 3D Flip Container - parent defines height so absolute inset-0 children have a containing block */}
        <div className="relative w-full h-full" style={{ perspective: prefersReducedMotion ? 'none' : '1000px' }}>
          {prefersReducedMotion ? (
            <>
              {/* Crossfade for reduced motion */}
              <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="front"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("w-full h-full flex flex-col", DEBUG_CARD_BOUNDS && "outline outline-1 outline-green-500/40")}
                >
              {/* Top row: avatar + name + Flip/Expand buttons */}
              <div className="flex items-center gap-3 mb-3">
                {(curatedTalent.profileImageUrl || curatedTalent.avatarUrl) ? (
                  <img
                    src={curatedTalent.profileImageUrl || curatedTalent.avatarUrl}
                    alt={talent.name}
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
                    onError={(e) => {
                      // Fallback to initial if image fails
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-base font-medium text-white/80 flex-shrink-0"
                  style={{ display: (curatedTalent.profileImageUrl || curatedTalent.avatarUrl) ? 'none' : 'flex' }}
                >
                  {talent.name.charAt(0) || "C"}
                </div>
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-base font-medium text-white/90 truncate select-none">
                    {talent.name}
                  </span>
                  {talent.headline && (
                    <span className="text-xs text-white/60 truncate select-none">{talent.headline}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Prism Badge */}
                  {curatedTalent.prismArchetype && (
                    <PrismBadge archetypeName={curatedTalent.prismArchetype} size={32} />
                  )}

                  {/* Flip button */}
                  <Tooltip content="Flip">
                    <button
                      type="button"
                      onClick={handleFlip}
                      className="w-8 h-8 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] hover:ring-white/[0.18] transition-all duration-150 text-white/40 hover:text-white/90"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </Tooltip>

                  {/* Expand button */}
                  <Tooltip content="Expand">
                    <button
                      type="button"
                      onClick={handleExpand}
                      className="w-8 h-8 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] hover:ring-white/[0.18] transition-all duration-150 text-white/40 hover:text-white/90"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Description — premium blurb, 2 lines, not a paragraph */}
              {(curatedTalent.nicheSummary || curatedTalent.shortBio) && (
                <p className="mb-2 line-clamp-2 text-[13px] text-white/70 flex-1 min-h-0 leading-[1.35] select-none">
                  {getFrontSummary(curatedTalent)}
                </p>
              )}

              {/* Tags — roles, platforms, tier */}
              <div className="mb-2 flex flex-wrap gap-x-1.5 gap-y-1 min-h-[32px]">
                {talent.roles.slice(0, 3).map((r) => (
                  <span
                    key={r}
                    className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70 ring-1 ring-white/10 select-none shrink-0"
                  >
                    {r}
                  </span>
                ))}
                {talent.platforms.slice(0, 2).map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/60 ring-1 ring-white/10 select-none shrink-0"
                  >
                    {p}
                  </span>
                ))}
                {/* Tier tag with tooltip */}
                {(() => {
                  const tier = getTalentTier(curatedTalent);
                  const styles = TIER_STYLES[tier];
                  return (
                    <Tooltip content={PRICING_TIER_DESCRIPTIONS[tier]}>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] ring-1 select-none shrink-0 cursor-help",
                          styles.bg,
                          styles.text,
                          styles.ring
                        )}
                      >
                        {styles.label}
                      </span>
                    </Tooltip>
                  );
                })()}
              </div>

              {/* Bottom actions (always visible) */}
              <div className="flex items-center gap-3 mt-auto shrink-0 pt-3 border-t border-white/10">
                <Tooltip content={isAdded ? "Already added to pod" : "Add to pod"}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAdded) return;
                      onAdd?.(talent);
                    }}
                    disabled={isAdded}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition flex-1 justify-center",
                      isAdded
                        ? "bg-white/20 text-white/70 cursor-default ring-1 ring-white/20"
                        : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white ring-1 ring-white/10 hover:ring-white/20",
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAdded ? "Added" : "Add"}
                  </button>
                </Tooltip>

                <Tooltip content="Book this talent">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBook?.(talent);
                    }}
                    className="flex-1 rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white ring-1 ring-white/20 hover:ring-white/30 px-4 py-2 text-xs font-medium transition"
                  >
                    Book now
                  </button>
                </Tooltip>
              </div>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("w-full h-full flex flex-col min-h-0", DEBUG_CARD_BOUNDS && "outline outline-1 outline-amber-500/40")}
                >
                  {/* Tab buttons */}
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setBackTab("about"); }}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition",
                          backTab === "about"
                            ? "bg-white/10 text-white ring-1 ring-white/20"
                            : "bg-white/5 text-white/60 hover:bg-white/8"
                        )}
                      >
                        About
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setBackTab("portfolio"); }}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition",
                          backTab === "portfolio"
                            ? "bg-white/10 text-white ring-1 ring-white/20"
                            : "bg-white/5 text-white/60 hover:bg-white/8"
                        )}
                      >
                        Portfolio
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setBackTab("links"); }}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition",
                          backTab === "links"
                            ? "bg-white/10 text-white ring-1 ring-white/20"
                            : "bg-white/5 text-white/60 hover:bg-white/8"
                        )}
                      >
                        Links
                      </button>
                    </div>

                    <Tooltip content="Flip back">
                      <button
                        type="button"
                        onClick={handleFlip}
                        className="w-8 h-8 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] hover:ring-white/[0.18] transition-all duration-150 text-white/40 hover:text-white/90"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                  
                  {/* Tab content wrapper — flex-1 min-h-0 for Portfolio scroll inside card */}
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                      {backTab === "about" && (
                        <motion.div
                          key="about"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
                        >
                          <div className="space-y-2">
                            <p className="text-[13px] leading-relaxed text-white/70 line-clamp-4 select-none min-h-0">
                              {getAboutSummary(curatedTalent)}
                            </p>
                            {(curatedTalent.location || curatedTalent.timezone || curatedTalent.languages) && (
                              <div className="pt-2 border-t border-white/10 space-y-0.5">
                                {curatedTalent.location && (
                                  <p className="text-[11px] text-white/50 select-none">📍 {curatedTalent.location}</p>
                                )}
                                {curatedTalent.timezone && (
                                  <p className="text-[11px] text-white/50 select-none">🕐 {curatedTalent.timezone}</p>
                                )}
                                {curatedTalent.languages && curatedTalent.languages.length > 0 && (
                                  <p className="text-[11px] text-white/50 select-none">🗣️ {curatedTalent.languages.join(", ")}</p>
                                )}
                              </div>
                            )}

                            {(curatedTalent.followers || curatedTalent.engagementRate) && (
                              <div className="pt-2 border-t border-white/10 flex gap-4 text-[11px]">
                                {curatedTalent.followers && (
                                  <div>
                                    <span className="text-white/50 select-none">Followers: </span>
                                    <span className="text-white/70 select-none">{curatedTalent.followers.toLocaleString()}</span>
                                  </div>
                                )}
                                {curatedTalent.engagementRate && (
                                  <div>
                                    <span className="text-white/50 select-none">Engagement: </span>
                                    <span className="text-white/70 select-none">{(curatedTalent.engagementRate * 100).toFixed(1)}%</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Match Score */}
                            {matchScore && (
                              <div className="pt-2 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-semibold text-emerald-300">{matchScore.score}</span>
                                  </div>
                                  <p className="text-[11px] text-white/60 line-clamp-1 select-none">{matchScore.rationale}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {backTab === "portfolio" && (
                        <motion.div
                          key="portfolio"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1 min-h-0 flex flex-col overflow-y-auto scrollbar-hide"
                        >
                          {portfolioItems.length > 0 ? (
                            <>
                              <div className="relative shrink-0 aspect-video rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/10 mb-3">
                                {currentPortfolioItem.type === "image" ? (
                                  <Image
                                    src={currentPortfolioItem.src}
                                    alt={currentPortfolioItem.title || `Portfolio ${portfolioIndex + 1}`}
                                    fill
                                    className="object-cover"
                                    loading="lazy"
                                    sizes="360px"
                                  />
                                ) : (
                                  <div className="relative w-full h-full">
                                    {currentPortfolioItem.poster ? (
                                      <Image
                                        src={currentPortfolioItem.poster}
                                        alt={currentPortfolioItem.title || `Video ${portfolioIndex + 1}`}
                                        fill
                                        className="object-cover"
                                        loading="lazy"
                                        sizes="360px"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                          <svg className="w-6 h-6 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                          </svg>
                                        </div>
                                      </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z"/>
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {portfolioItems.length > 1 && (
                                <div className="flex items-center justify-between gap-2">
                                  <Tooltip content="Previous">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); prevPortfolio(); }}
                                      className="w-8 h-8 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] hover:ring-white/[0.18] transition-all duration-150 text-white/40 hover:text-white/90"
                                    >
                                      <ChevronLeft className="w-4 h-4" />
                                    </button>
                                  </Tooltip>
                                  <span className="text-xs text-white/50 select-none">
                                    {portfolioIndex + 1} / {portfolioItems.length}
                                  </span>
                                  <Tooltip content="Next">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); nextPortfolio(); }}
                                      className="w-8 h-8 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] hover:ring-white/[0.18] transition-all duration-150 text-white/40 hover:text-white/90"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </Tooltip>
                                </div>
                              )}
                              
                              <Tooltip content="Expand portfolio">
                                <button
                                  type="button"
                                  onClick={handleExpand}
                                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 px-3 py-2 text-xs text-white/70 hover:text-white/90 transition"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  Expand portfolio
                                </button>
                              </Tooltip>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-xs select-none space-y-2">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-white/20" />
                          </div>
                          <p>Portfolio coming soon</p>
                        </div>
                      )}
                        </motion.div>
                      )}

                      {backTab === "links" && (
                        <motion.div
                          key="links"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
                        >
                          <div className="space-y-2">
                            <LinksTabContent curatedTalent={curatedTalent} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </>
          ) : (
            <>
              {/* 3D Flip for normal motion */}
              <div
              className="relative w-full h-full transition-transform duration-500"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Side */}
              <div
                className={cn("absolute inset-0 w-full h-full flex flex-col", DEBUG_CARD_BOUNDS && "outline outline-1 outline-green-500/40")}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
              >
                {/* Top row: avatar + name + Flip/Expand buttons */}
                <div className="flex items-center gap-3 mb-3">
                  {(curatedTalent.profileImageUrl || curatedTalent.avatarUrl) ? (
                    <img
                      src={curatedTalent.profileImageUrl || curatedTalent.avatarUrl}
                      alt={talent.name}
                      className="h-12 w-12 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-base font-medium text-white/80 flex-shrink-0"
                    style={{ display: (curatedTalent.profileImageUrl || curatedTalent.avatarUrl) ? 'none' : 'flex' }}
                  >
                    {talent.name.charAt(0) || "C"}
                  </div>
                  <div className="flex flex-1 flex-col min-w-0">
                    <span className="text-base font-medium text-white/90 truncate select-none">
                      {talent.name}
                    </span>
                    {talent.headline && (
                      <span className="text-xs text-white/60 truncate select-none">{talent.headline}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Prism Badge */}
                    {curatedTalent.prismArchetype && (
                      <PrismBadge archetypeName={curatedTalent.prismArchetype} size={32} />
                    )}

                    {/* Flip button */}
                    <Tooltip content="Flip">
                      <button
                        type="button"
                        onClick={handleFlip}
                        className="w-8 h-8 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] hover:ring-white/[0.18] transition-all duration-150 text-white/40 hover:text-white/90"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </Tooltip>

                    {/* Expand button */}
                    <Tooltip content="Expand">
                      <button
                        type="button"
                        onClick={handleExpand}
                        className="w-8 h-8 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] hover:ring-white/[0.18] transition-all duration-150 text-white/40 hover:text-white/90"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {/* Description — premium blurb, 2 lines */}
                {(curatedTalent.nicheSummary || curatedTalent.shortBio) && (
                  <p className="mb-2 line-clamp-2 text-[13px] text-white/70 flex-1 min-h-0 leading-[1.35] select-none">
                    {getFrontSummary(curatedTalent)}
                  </p>
                )}

                {/* Tags — roles, platforms, tier */}
                <div className="mb-2 flex flex-wrap gap-x-1.5 gap-y-1 min-h-[32px]">
                  {talent.roles.slice(0, 3).map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70 ring-1 ring-white/10 select-none shrink-0"
                    >
                      {r}
                    </span>
                  ))}
                  {talent.platforms.slice(0, 2).map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/60 ring-1 ring-white/10 select-none shrink-0"
                    >
                      {p}
                    </span>
                  ))}
                  {/* Tier tag with tooltip */}
                  {(() => {
                    const tier = getTalentTier(curatedTalent);
                    const styles = TIER_STYLES[tier];
                    return (
                      <Tooltip content={PRICING_TIER_DESCRIPTIONS[tier]}>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] ring-1 select-none shrink-0 cursor-help",
                            styles.bg,
                            styles.text,
                            styles.ring
                          )}
                        >
                          {styles.label}
                        </span>
                      </Tooltip>
                    );
                  })()}
                </div>

                {/* Bottom actions (always visible) */}
                <div className="flex items-center gap-3 mt-auto shrink-0 pt-3 border-t border-white/10">
                  <Tooltip content={isAdded ? "Already added to pod" : "Add to pod"}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAdded) return;
                        onAdd?.(talent);
                      }}
                      disabled={isAdded}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition flex-1 justify-center",
                        isAdded
                          ? "bg-white/20 text-white/70 cursor-default ring-1 ring-white/20"
                          : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white ring-1 ring-white/10 hover:ring-white/20",
                      )}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isAdded ? "Added" : "Add"}
                    </button>
                  </Tooltip>

                  <Tooltip content="Book this talent">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBook?.(talent);
                      }}
                      className="flex-1 rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white ring-1 ring-white/20 hover:ring-white/30 px-4 py-2 text-xs font-medium transition"
                    >
                      Book now
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Back Side (Tabs: About/Portfolio/Links) — min-h-0 for flex scroll chain, no extra padding (card has p-6) */}
              <div
                className={cn("absolute inset-0 w-full h-full flex flex-col min-h-0", DEBUG_CARD_BOUNDS && "outline outline-1 outline-amber-500/40")}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
              {/* Tab buttons — fixed at top */}
              <div className="shrink-0 flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setBackTab("about"); }}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition",
                      backTab === "about"
                        ? "bg-white/10 text-white ring-1 ring-white/20"
                        : "bg-white/5 text-white/60 hover:bg-white/8"
                    )}
                  >
                    About
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setBackTab("portfolio"); }}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition",
                      backTab === "portfolio"
                        ? "bg-white/10 text-white ring-1 ring-white/20"
                        : "bg-white/5 text-white/60 hover:bg-white/8"
                    )}
                  >
                    Portfolio
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setBackTab("links"); }}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition",
                      backTab === "links"
                        ? "bg-white/10 text-white ring-1 ring-white/20"
                        : "bg-white/5 text-white/60 hover:bg-white/8"
                    )}
                  >
                    Links
                  </button>
                </div>

                <Tooltip content="Flip back">
                  <button
                    type="button"
                    onClick={handleFlip}
                    className="w-8 h-8 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] hover:ring-white/[0.18] transition-all duration-150 text-white/40 hover:text-white/90"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>

              {/* Tab Content — scrollable inside card */}
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                  {backTab === "about" && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
                    >
                      <div className="space-y-2">
                        <p className="text-[13px] leading-relaxed text-white/70 line-clamp-4 select-none min-h-0">
                          {getAboutSummary(curatedTalent)}
                        </p>
                        {(curatedTalent.location || curatedTalent.timezone || curatedTalent.languages) && (
                          <div className="pt-2 border-t border-white/10 space-y-0.5">
                            {curatedTalent.location && (
                              <p className="text-[11px] text-white/50 select-none">📍 {curatedTalent.location}</p>
                            )}
                            {curatedTalent.timezone && (
                              <p className="text-[11px] text-white/50 select-none">🕐 {curatedTalent.timezone}</p>
                            )}
                            {curatedTalent.languages && curatedTalent.languages.length > 0 && (
                              <p className="text-[11px] text-white/50 select-none">🗣️ {curatedTalent.languages.join(", ")}</p>
                            )}
                          </div>
                        )}

                        {(curatedTalent.followers || curatedTalent.engagementRate) && (
                          <div className="pt-2 border-t border-white/10 flex gap-4 text-[11px]">
                            {curatedTalent.followers && (
                              <div>
                                <span className="text-white/50 select-none">Followers: </span>
                                <span className="text-white/70 select-none">{curatedTalent.followers.toLocaleString()}</span>
                              </div>
                            )}
                            {curatedTalent.engagementRate && (
                              <div>
                                <span className="text-white/50 select-none">Engagement: </span>
                                <span className="text-white/70 select-none">{(curatedTalent.engagementRate * 100).toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Match Score */}
                        {matchScore && (
                          <div className="pt-2 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40 flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-emerald-300">{matchScore.score}</span>
                              </div>
                              <p className="text-[11px] text-white/60 line-clamp-1 select-none">{matchScore.rationale}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {backTab === "portfolio" && (
                    <motion.div
                      key="portfolio"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 min-h-0 flex flex-col overflow-y-auto scrollbar-hide"
                    >
                      {portfolioItems.length > 0 ? (
                        <>
                          <div className="relative shrink-0 aspect-video rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/10 mb-3 group/portfolio">
                            {currentPortfolioItem.type === "image" ? (
                              <img
                                src={currentPortfolioItem.src}
                                alt={currentPortfolioItem.title || `Portfolio ${portfolioIndex + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="relative w-full h-full">
                                {currentPortfolioItem.poster ? (
                                  <img
                                    src={currentPortfolioItem.poster}
                                    alt={currentPortfolioItem.title || `Video ${portfolioIndex + 1}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                      <svg className="w-6 h-6 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    </div>
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Portfolio carousel arrows - show on hover */}
                            {portfolioItems.length > 1 && (
                              <>
                                <Tooltip content="Previous">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); prevPortfolio(); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm ring-1 ring-white/20 flex items-center justify-center hover:bg-black/80 transition text-white opacity-0 group-hover/portfolio:opacity-100"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                                <Tooltip content="Next">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); nextPortfolio(); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm ring-1 ring-white/20 flex items-center justify-center hover:bg-black/80 transition text-white opacity-0 group-hover/portfolio:opacity-100"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                              </>
                            )}
                          </div>
                          
                          {portfolioItems.length > 1 && (
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-xs text-white/50 select-none">
                                {portfolioIndex + 1} / {portfolioItems.length}
                              </span>
                            </div>
                          )}
                          
                          <Tooltip content="Expand portfolio">
                            <button
                              type="button"
                              onClick={handleExpand}
                              className="mt-3 w-full flex items-center justify-center gap-2 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 px-3 py-2 text-xs text-white/70 hover:text-white/90 transition"
                            >
                              <Maximize2 className="w-3 h-3" />
                              Expand portfolio
                            </button>
                          </Tooltip>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-xs select-none space-y-2">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-white/20" />
                          </div>
                          <p>Portfolio coming soon</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {backTab === "links" && (
                    <motion.div
                      key="links"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
                    >
                      <div className="space-y-2">
                        <LinksTabContent curatedTalent={curatedTalent} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            </div>
            </>
          )}
        </div>
      </motion.article>

      {/* Expand Modal (Viewport Overlay) */}
      <AnimatePresence>
        {showExpandModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExpandModal(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowExpandModal(false);
                }
              }}
            >
              <div 
                className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-[#0D1117] ring-1 ring-white/10 rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white/90">{talent.name}</h3>
                    <p className="text-sm text-white/60">{talent.headline}</p>
                  </div>
                  <Tooltip content="Close">
                    <button
                      onClick={() => setShowExpandModal(false)}
                      className="w-8 h-8 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] hover:ring-white/[0.18] transition-all duration-150 text-white/40 hover:text-white/90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
                
                {/* Expanded Portfolio */}
                {portfolioItems.length > 0 ? (
                  <div className="space-y-4">
                    {portfolioItems.map((item, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/10"
                      >
                        {item.type === "image" ? (
                          <img
                            src={item.src}
                            alt={item.title || `Portfolio ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            {item.poster ? (
                              <img
                                src={item.poster}
                                alt={item.title || `Video ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {item.title && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <p className="text-sm text-white/90">{item.title}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-white/30 text-sm space-y-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <Maximize2 className="w-8 h-8 text-white/20" />
                    </div>
                    <p>Portfolio coming soon</p>
                  </div>
                )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
