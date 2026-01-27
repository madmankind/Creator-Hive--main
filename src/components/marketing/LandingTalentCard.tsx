"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RotateCcw, Maximize2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Talent } from "@/store/useCampaignPodStore";
import type { CuratedTalent } from "@/lib/curatedTalent";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";

type LandingTalentCardProps = {
  talent: Talent;
  isAdded?: boolean;
  onAdd?: (talent: Talent) => void;
  onBook?: (talent: Talent) => void;
  curatedTalent: CuratedTalent;
};

type BackTab = "about" | "portfolio" | "links";

export function LandingTalentCard({
  talent,
  isAdded,
  onAdd,
  onBook,
  curatedTalent,
}: LandingTalentCardProps) {
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
        layout
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl",
          "bg-white/5 px-5 py-4 ring-1 ring-white/10",
          "w-[400px] min-h-[300px] flex-shrink-0",
          "cursor-pointer select-none",
          "transition-all duration-300",
          "hover:ring-white/20 hover:shadow-lg hover:shadow-white/5"
        )}
        whileHover={{ y: -4 }}
        style={{ userSelect: "none" }}
      >
        {/* 3D Flip Container */}
        <div className="relative w-full h-full" style={{ perspective: prefersReducedMotion ? 'none' : '1000px' }}>
          {prefersReducedMotion ? (
            // Crossfade for reduced motion
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="front"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col"
                >
              {/* Top row: avatar + name + Flip/Expand buttons */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-base font-medium text-white/80 flex-shrink-0">
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
                  {/* Flip button */}
                  <Tooltip content="Flip card">
                    <button
                      type="button"
                      onClick={handleFlip}
                      className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white/80"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </Tooltip>

                  {/* Expand button */}
                  <Tooltip content="Expand view">
                    <button
                      type="button"
                      onClick={handleExpand}
                      className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white/80"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Description - 2-3 lines max */}
              {talent.bio && (
                <p className="mb-4 line-clamp-3 text-sm text-white/70 flex-1 min-h-[60px] leading-relaxed select-none">
                  {talent.bio}
                </p>
              )}

              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {talent.roles.slice(0, 4).map((r) => (
                  <span
                    key={r}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10 select-none"
                  >
                    {r}
                  </span>
                ))}
                {talent.platforms.slice(0, 2).map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60 ring-1 ring-white/10 select-none"
                  >
                    {p}
                  </span>
                ))}
                {talent.availabilityTags?.slice(0, 1).map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 ring-1 ring-emerald-400/40 select-none"
                  >
                    {a}
                  </span>
                ))}
              </div>

              {/* Bottom actions (always visible) */}
              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/10">
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
                        ? "bg-white/10 text-white/50 cursor-default"
                        : "bg-white/10 text-white/80 hover:bg-white/15 ring-1 ring-white/10",
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
                    className="flex-1 rounded-full bg-white/10 text-white/90 hover:bg-white/15 ring-1 ring-white/20 hover:ring-white/30 px-4 py-2 text-xs font-medium transition"
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
                  className="w-full h-full flex flex-col p-5"
                >
                  {/* Tab buttons */}
                  <div className="flex items-center justify-between mb-4">
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
                        className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white/80"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                  
                  {/* Tab Content (shared for reduced motion) */}
                  <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                      {backTab === "about" && (
                        <motion.div
                          key="about"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="h-full overflow-y-auto scrollbar-hide"
                        >
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm leading-relaxed text-white/70 mb-2 select-none">
                                {curatedTalent.shortBio}
                              </p>
                              <p className="text-xs leading-relaxed text-white/60 select-none">
                                {curatedTalent.nicheSummary}
                              </p>
                            </div>
                            
                            {(curatedTalent.location || curatedTalent.timezone || curatedTalent.languages) && (
                              <div className="pt-2 border-t border-white/10 space-y-1">
                                {curatedTalent.location && (
                                  <p className="text-xs text-white/50 select-none">📍 {curatedTalent.location}</p>
                                )}
                                {curatedTalent.timezone && (
                                  <p className="text-xs text-white/50 select-none">🕐 {curatedTalent.timezone}</p>
                                )}
                                {curatedTalent.languages && curatedTalent.languages.length > 0 && (
                                  <p className="text-xs text-white/50 select-none">🗣️ {curatedTalent.languages.join(", ")}</p>
                                )}
                              </div>
                            )}

                            {(curatedTalent.followers || curatedTalent.engagementRate) && (
                              <div className="pt-2 border-t border-white/10 flex gap-4 text-xs">
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
                          className="h-full flex flex-col"
                        >
                          {portfolioItems.length > 0 ? (
                            <>
                              <div className="relative flex-1 rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/10 mb-3">
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
                                      className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white/80"
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
                                      className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white/80"
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
                            <div className="flex-1 flex items-center justify-center text-white/40 text-xs select-none">
                              No portfolio yet
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
                          className="h-full overflow-y-auto scrollbar-hide"
                        >
                          <div className="space-y-2">
                            {curatedTalent.instagramUrl && (
                              <a
                                href={curatedTalent.instagramUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-3 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-3 transition"
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-white/90 select-none">Instagram</p>
                                  <p className="text-xs text-white/60 select-none">@{curatedTalent.instagramHandle}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-white/40" />
                              </a>
                            )}
                            
                            {curatedTalent.tiktokUrl && (
                              <a
                                href={curatedTalent.tiktokUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-3 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-3 transition"
                              >
                                <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.26-4.61 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-white/90 select-none">TikTok</p>
                                  <p className="text-xs text-white/60 select-none">{curatedTalent.tiktokHandle || "@username"}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-white/40" />
                              </a>
                            )}
                            
                            {curatedTalent.platformTags.includes("YouTube") && (
                              <a
                                href={`https://youtube.com/@${curatedTalent.instagramHandle}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-3 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-3 transition"
                              >
                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-white/90 select-none">YouTube</p>
                                  <p className="text-xs text-white/60 select-none">@{curatedTalent.instagramHandle}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-white/40" />
                              </a>
                            )}
                            
                            {curatedTalent.platformTags.includes("LinkedIn") && (
                              <a
                                href={`https://linkedin.com/in/${curatedTalent.instagramHandle}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-3 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-3 transition"
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-white/90 select-none">LinkedIn</p>
                                  <p className="text-xs text-white/60 select-none">{curatedTalent.name}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-white/40" />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            // 3D Flip for normal motion
            <div
              className="relative w-full h-full transition-transform duration-500"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Side */}
              <div
                className="absolute inset-0 w-full h-full flex flex-col"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
              >
                {/* Top row: avatar + name + Flip/Expand buttons */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-base font-medium text-white/80 flex-shrink-0">
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
                    {/* Flip button */}
                    <Tooltip content="Flip card">
                      <button
                        type="button"
                        onClick={handleFlip}
                        className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white/80"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </Tooltip>

                    {/* Expand button */}
                    <Tooltip content="Expand view">
                      <button
                        type="button"
                        onClick={handleExpand}
                        className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white/80"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {/* Description - 2-3 lines max */}
                {talent.bio && (
                  <p className="mb-4 line-clamp-3 text-sm text-white/70 flex-1 min-h-[60px] leading-relaxed select-none">
                    {talent.bio}
                  </p>
                )}

                {/* Tags */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {talent.roles.slice(0, 4).map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10 select-none"
                    >
                      {r}
                    </span>
                  ))}
                  {talent.platforms.slice(0, 2).map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60 ring-1 ring-white/10 select-none"
                    >
                      {p}
                    </span>
                  ))}
                  {talent.availabilityTags?.slice(0, 1).map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 ring-1 ring-emerald-400/40 select-none"
                    >
                      {a}
                    </span>
                  ))}
                </div>

                {/* Bottom actions (always visible) */}
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/10">
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
                          ? "bg-white/10 text-white/50 cursor-default"
                          : "bg-white/10 text-white/80 hover:bg-white/15 ring-1 ring-white/10",
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
                      className="flex-1 rounded-full bg-white/10 text-white/90 hover:bg-white/15 ring-1 ring-white/20 hover:ring-white/30 px-4 py-2 text-xs font-medium transition"
                    >
                      Book now
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Back Side (Tabs: About/Portfolio/Links) */}
              <div
                className="absolute inset-0 w-full h-full flex flex-col p-5"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
              {/* Tab buttons */}
              <div className="flex items-center justify-between mb-4">
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
                    className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white/80"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {backTab === "about" && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="h-full overflow-y-auto scrollbar-hide"
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm leading-relaxed text-white/70 mb-2 select-none">
                            {curatedTalent.shortBio}
                          </p>
                          <p className="text-xs leading-relaxed text-white/60 select-none">
                            {curatedTalent.nicheSummary}
                          </p>
                        </div>
                        
                        {(curatedTalent.location || curatedTalent.timezone || curatedTalent.languages) && (
                          <div className="pt-2 border-t border-white/10 space-y-1">
                            {curatedTalent.location && (
                              <p className="text-xs text-white/50 select-none">📍 {curatedTalent.location}</p>
                            )}
                            {curatedTalent.timezone && (
                              <p className="text-xs text-white/50 select-none">🕐 {curatedTalent.timezone}</p>
                            )}
                            {curatedTalent.languages && curatedTalent.languages.length > 0 && (
                              <p className="text-xs text-white/50 select-none">🗣️ {curatedTalent.languages.join(", ")}</p>
                            )}
                          </div>
                        )}

                        {(curatedTalent.followers || curatedTalent.engagementRate) && (
                          <div className="pt-2 border-t border-white/10 flex gap-4 text-xs">
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
                      className="h-full flex flex-col"
                    >
                      {portfolioItems.length > 0 ? (
                        <>
                          <div className="relative flex-1 rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/10 mb-3">
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
                                  className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white/80"
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
                                  className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white/80"
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
                        <div className="flex-1 flex items-center justify-center text-white/40 text-xs select-none">
                          No portfolio yet
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
                      className="h-full overflow-y-auto scrollbar-hide"
                    >
                      <div className="space-y-2">
                        {curatedTalent.instagramUrl && (
                          <a
                            href={curatedTalent.instagramUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-3 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-3 transition"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-white/90 select-none">Instagram</p>
                              <p className="text-xs text-white/60 select-none">@{curatedTalent.instagramHandle}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/40" />
                          </a>
                        )}
                        
                        {curatedTalent.tiktokUrl && (
                          <a
                            href={curatedTalent.tiktokUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-3 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-3 transition"
                          >
                            <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.26-4.61 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-white/90 select-none">TikTok</p>
                              <p className="text-xs text-white/60 select-none">{curatedTalent.tiktokHandle || "@username"}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/40" />
                          </a>
                        )}
                        
                        {curatedTalent.platformTags.includes("YouTube") && (
                          <a
                            href={`https://youtube.com/@${curatedTalent.instagramHandle}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-3 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-3 transition"
                          >
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-white/90 select-none">YouTube</p>
                              <p className="text-xs text-white/60 select-none">@{curatedTalent.instagramHandle}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/40" />
                          </a>
                        )}
                        
                        {curatedTalent.platformTags.includes("LinkedIn") && (
                          <a
                            href={`https://linkedin.com/in/${curatedTalent.instagramHandle}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-3 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-3 transition"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-white/90 select-none">LinkedIn</p>
                              <p className="text-xs text-white/60 select-none">{curatedTalent.name}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/40" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[640px] max-w-[90vw] max-h-screen overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 overflow-y-auto bg-[#0D1117] ring-1 ring-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white/90">{talent.name}</h3>
                    <p className="text-sm text-white/60">{talent.headline}</p>
                  </div>
                  <Tooltip content="Close">
                    <button
                      onClick={() => setShowExpandModal(false)}
                      className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white/80"
                    >
                      ×
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
                          <Image
                            src={item.src}
                            alt={item.title || `Portfolio ${index + 1}`}
                            fill
                            className="object-cover"
                            loading="lazy"
                            sizes="640px"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            {item.poster ? (
                              <Image
                                src={item.poster}
                                alt={item.title || `Video ${index + 1}`}
                                fill
                                className="object-cover"
                                loading="lazy"
                                sizes="640px"
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
                  <div className="text-center py-12 text-white/40 text-sm">
                    No portfolio yet
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
