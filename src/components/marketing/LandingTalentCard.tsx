"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Maximize2, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { Talent } from "@/store/useCampaignPodStore";
import type { CuratedTalent } from "@/lib/curatedTalent";
import type { MatchScore } from "@/lib/schemas/booking";
import { PRICING_TIER_DESCRIPTIONS } from "@/lib/schemas/booking";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { PrismBadge } from "@/components/prism/PrismBadge";

type LandingTalentCardProps = {
  talent: Talent;
  isAdded?: boolean;
  onAdd?: (talent: Talent) => void;
  onBook?: (talent: Talent) => void;
  curatedTalent: CuratedTalent;
  matchScore?: MatchScore;
  packageMatch?: { packageName: string; packageEmoji: string };
};

function getTalentTier(talent: CuratedTalent): "HIVE_SELECT" | "HIVE_SIGNATURE" {
  const followers = talent.followers || 0;
  return followers >= 50000 ? "HIVE_SIGNATURE" : "HIVE_SELECT";
}

const TIER_STYLES = {
  HIVE_SELECT: { bg: "bg-white/5", text: "text-white/70", ring: "ring-white/20", label: "Hive Select" },
  HIVE_SIGNATURE: { bg: "bg-purple-500/10", text: "text-purple-300", ring: "ring-purple-400/40", label: "Hive Signature" },
};

type BackTab = "about" | "portfolio" | "links";

const FILLER = /\b(creating|specialist|specializing|focused on|focus on|experts? in|expertise in)\b/gi;

function getPremiumSummary(text: string, maxChars: number): string {
  let s = text.trim().replace(/\s+/g, " ");
  s = s.replace(FILLER, "").replace(/\s+/g, " ").trim();
  const first = s.split(/[.!?]+/)[0]?.trim();
  const use = first && first.length <= maxChars ? first : s;
  if (use.length <= maxChars) return use;
  const cut = use.slice(0, maxChars - 1).trim();
  const lastSpace = cut.lastIndexOf(" ");
  const out = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut;
  return out + "…";
}

function getFrontSummary(t: CuratedTalent): string {
  const raw = t.nicheSummary?.trim() || t.shortBio?.trim() || "";
  return getPremiumSummary(raw, 100);
}

function getAboutSummary(t: CuratedTalent): string {
  const raw = t.nicheSummary?.trim() || t.shortBio?.trim() || "";
  return getPremiumSummary(raw, 200);
}

type LinkItem = { href: string; label: string; sublabel: string; icon: "instagram" | "tiktok" | "youtube" | "behance" | "twitch" | "website" };

function getLinkItems(t: CuratedTalent): LinkItem[] {
  const out: LinkItem[] = [];
  const instagram = t.links?.instagram || t.instagramUrl;
  if (instagram) out.push({ href: instagram, label: "Instagram", sublabel: `@${t.instagramHandle}`, icon: "instagram" });
  const tiktok = t.links?.tiktok || t.tiktokUrl;
  if (tiktok) out.push({ href: tiktok, label: "TikTok", sublabel: t.tiktokHandle || "@username", icon: "tiktok" });
  if (t.links?.youtube) out.push({ href: t.links.youtube, label: "YouTube", sublabel: `@${t.instagramHandle}`, icon: "youtube" });
  if (t.links?.behance) out.push({ href: t.links.behance, label: "Behance", sublabel: "Portfolio", icon: "behance" });
  if (t.links?.twitch) out.push({ href: t.links.twitch, label: "Twitch", sublabel: "Live stream", icon: "twitch" });
  if (t.links?.website) out.push({ href: t.links.website, label: "Website", sublabel: t.links.website.replace(/^https?:\/\//, ""), icon: "website" });
  return out;
}

function LinksTabContent({ curatedTalent }: { curatedTalent: CuratedTalent }) {
  const items = getLinkItems(curatedTalent);
  if (items.length === 0) return <p className="text-xs text-white/50 select-none py-2">No links available</p>;
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
  );
}

// ── Card Front ──────────────────────────────────────────────────────────────

function CardFront({
  talent,
  curatedTalent,
  isAdded,
  onAdd,
  onBook,
  packageMatch,
  matchScore,
  onFlip,
  onExpand,
}: {
  talent: Talent;
  curatedTalent: CuratedTalent;
  isAdded?: boolean;
  onAdd?: (t: Talent) => void;
  onBook?: (t: Talent) => void;
  packageMatch?: { packageName: string; packageEmoji: string };
  matchScore?: MatchScore;
  onFlip: () => void;
  onExpand: () => void;
}) {
  const tier = getTalentTier(curatedTalent);
  const styles = TIER_STYLES[tier];
  const hasAvatar = !!(curatedTalent.profileImageUrl || curatedTalent.avatarUrl);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top: avatar + name + actions */}
      <div className="flex items-center gap-3 mb-3 shrink-0">
        <div className="relative shrink-0">
          {hasAvatar ? (
            <img
              src={curatedTalent.profileImageUrl || curatedTalent.avatarUrl}
              alt={talent.name}
              className="h-11 w-11 rounded-full object-cover ring-1 ring-white/10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white/80">
              {talent.name.charAt(0) || "C"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-semibold text-white/92 block leading-tight select-none">
            {talent.name}
          </span>
          {talent.headline && (
            <span className="text-[12px] text-white/50 block leading-tight select-none truncate mt-0.5">
              {talent.headline}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {curatedTalent.prismArchetype && (
            <PrismBadge archetypeName={curatedTalent.prismArchetype} size={28} />
          )}
          <Tooltip content="Details">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFlip(); }}
              className="w-7 h-7 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] transition text-white/35 hover:text-white/80"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip content="Expand">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onExpand(); }}
              className="w-7 h-7 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] transition text-white/35 hover:text-white/80"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Bio blurb */}
      {(curatedTalent.nicheSummary || curatedTalent.shortBio) && (
        <p className="mb-3 text-[13px] text-white/65 leading-[1.5] line-clamp-2 select-none flex-shrink-0">
          {getFrontSummary(curatedTalent)}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3 flex-1 content-start overflow-hidden">
        {talent.roles.slice(0, 3).map((r) => (
          <span key={r} className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[12px] text-white/65 ring-1 ring-white/[0.10] select-none shrink-0">
            {r}
          </span>
        ))}
        {talent.platforms.slice(0, 2).map((p) => (
          <span key={p} className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[12px] text-white/48 ring-1 ring-white/[0.07] select-none shrink-0">
            {p}
          </span>
        ))}
        <Tooltip content={PRICING_TIER_DESCRIPTIONS[tier]}>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] ring-1 select-none shrink-0 cursor-help", styles.bg, styles.text, styles.ring)}>
            {styles.label}
          </span>
        </Tooltip>
      </div>

      {/* Actions */}
      <div className="mt-auto shrink-0 pt-3 border-t border-white/[0.08] flex items-center gap-2">
        <Tooltip content={isAdded ? "In pod" : "Add to pod"}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (!isAdded) onAdd?.(talent); }}
            disabled={isAdded}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition flex-1 justify-center",
              isAdded
                ? "bg-white/[0.14] text-white/65 cursor-default ring-1 ring-white/20"
                : "bg-white/[0.07] text-white/80 hover:bg-white/[0.14] hover:text-white ring-1 ring-white/10"
            )}
          >
            {isAdded ? "Added" : "+ Add"}
          </button>
        </Tooltip>
        <Tooltip content="Book now">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onBook?.(talent); }}
            className="flex-1 rounded-full bg-white/[0.07] text-white/80 ring-1 ring-white/10 px-4 py-2 text-[13px] font-medium hover:bg-white/[0.14] hover:text-white transition"
          >
            Book now
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

// ── Card Back ───────────────────────────────────────────────────────────────

function CardBack({
  curatedTalent,
  matchScore,
  onFlip,
}: {
  curatedTalent: CuratedTalent;
  matchScore?: MatchScore;
  onFlip: () => void;
}) {
  const [backTab, setBackTab] = useState<BackTab>("about");
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const portfolioItems = curatedTalent.portfolio || [];
  const currentItem = portfolioItems[portfolioIndex];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-1.5">
          {(["about", "portfolio", "links"] as BackTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={(e) => { e.stopPropagation(); setBackTab(tab); }}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-medium capitalize transition",
                backTab === tab
                  ? "bg-white/10 text-white ring-1 ring-white/20"
                  : "text-white/45 hover:text-white/70"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <Tooltip content="Flip back">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFlip(); }}
            className="w-7 h-7 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center hover:bg-white/[0.10] transition text-white/35 hover:text-white/80"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {backTab === "about" && (
            <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
              <div className="space-y-3">
                <p className="text-[13px] leading-relaxed text-white/65 select-none">
                  {getAboutSummary(curatedTalent)}
                </p>
                {(curatedTalent.location || curatedTalent.timezone || curatedTalent.languages) && (
                  <div className="pt-2 border-t border-white/[0.07] space-y-1">
                    {curatedTalent.location && <p className="text-[12px] text-white/45 select-none">📍 {curatedTalent.location}</p>}
                    {curatedTalent.timezone && <p className="text-[12px] text-white/45 select-none">🕐 {curatedTalent.timezone}</p>}
                    {curatedTalent.languages?.length && <p className="text-[12px] text-white/45 select-none">🗣️ {curatedTalent.languages.join(", ")}</p>}
                  </div>
                )}
                {(curatedTalent.followers || curatedTalent.engagementRate) && (
                  <div className="pt-2 border-t border-white/[0.07] flex gap-4 text-[12px]">
                    {curatedTalent.followers && (
                      <div><span className="text-white/35 select-none">Followers </span><span className="text-white/65 select-none">{curatedTalent.followers.toLocaleString()}</span></div>
                    )}
                    {curatedTalent.engagementRate && (
                      <div><span className="text-white/35 select-none">Engagement </span><span className="text-white/65 select-none">{(curatedTalent.engagementRate * 100).toFixed(1)}%</span></div>
                    )}
                  </div>
                )}
                {matchScore && (
                  <div className="pt-2 border-t border-white/[0.07] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-semibold text-emerald-300">{matchScore.score}</span>
                    </div>
                    <p className="text-[11px] text-white/55 line-clamp-2 select-none">{matchScore.rationale}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {backTab === "portfolio" && (
            <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 min-h-0 flex flex-col">
              {portfolioItems.length > 0 ? (
                <>
                  <div className="relative shrink-0 aspect-video rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 mb-2 group/port">
                    {currentItem?.type === "image" ? (
                      <img src={currentItem.src} alt={currentItem.title || `Portfolio ${portfolioIndex + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    )}
                    {portfolioItems.length > 1 && (
                      <>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setPortfolioIndex((p) => (p - 1 + portfolioItems.length) % portfolioItems.length); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/port:opacity-100 transition text-white">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setPortfolioIndex((p) => (p + 1) % portfolioItems.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/port:opacity-100 transition text-white">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  {portfolioItems.length > 1 && (
                    <p className="text-center text-[10px] text-white/35 select-none mb-1">{portfolioIndex + 1} / {portfolioItems.length}</p>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-white/25">
                  <Maximize2 className="w-5 h-5" />
                  <p className="text-[11px] select-none">Portfolio coming soon</p>
                </div>
              )}
            </motion.div>
          )}

          {backTab === "links" && (
            <motion.div key="links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
              <div className="space-y-2">
                <LinksTabContent curatedTalent={curatedTalent} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────────────────────

export function LandingTalentCard({ talent, isAdded, onAdd, onBook, curatedTalent, matchScore, packageMatch }: LandingTalentCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExpandModal, setShowExpandModal] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    if (!showExpandModal) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setShowExpandModal(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [showExpandModal]);

  return (
    <TooltipProvider>
      <motion.article
        className={cn(
          "group relative rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/[0.09]",
          "w-[380px] h-[300px] flex-shrink-0 cursor-pointer select-none overflow-hidden",
          "transition-shadow duration-300",
          packageMatch
            ? "ring-white/[0.15] hover:shadow-[0_0_32px_rgba(255,255,255,0.07)]"
            : "hover:ring-white/[0.16] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        )}
      >
        {/* Package shimmer */}
        {packageMatch && (
          <>
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2.5 py-0.5 rounded-b-lg bg-white/[0.06] ring-1 ring-t-0 ring-white/[0.10] text-[9px] text-white/40 pointer-events-none">
              <span className="text-[10px]">{packageMatch.packageEmoji}</span>
              <span>{packageMatch.packageName}</span>
            </div>
          </>
        )}

        {/* 3D flip or crossfade */}
        <div className="relative w-full h-full" style={{ perspective: prefersReducedMotion ? "none" : "1000px" }}>
          {prefersReducedMotion ? (
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div key="front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="w-full h-full">
                  <CardFront talent={talent} curatedTalent={curatedTalent} isAdded={isAdded} onAdd={onAdd} onBook={onBook} packageMatch={packageMatch} matchScore={matchScore} onFlip={() => setIsFlipped(true)} onExpand={() => setShowExpandModal(true)} />
                </motion.div>
              ) : (
                <motion.div key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="w-full h-full">
                  <CardBack curatedTalent={curatedTalent} matchScore={matchScore} onFlip={() => setIsFlipped(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div
              className="relative w-full h-full transition-transform duration-500"
              style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
              <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                <CardFront talent={talent} curatedTalent={curatedTalent} isAdded={isAdded} onAdd={onAdd} onBook={onBook} packageMatch={packageMatch} matchScore={matchScore} onFlip={() => setIsFlipped(true)} onExpand={() => setShowExpandModal(true)} />
              </div>
              <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <CardBack curatedTalent={curatedTalent} matchScore={matchScore} onFlip={() => setIsFlipped(false)} />
              </div>
            </div>
          )}
        </div>

        {/* Expand modal */}
        <AnimatePresence>
          {showExpandModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
              onClick={() => setShowExpandModal(false)}
            >
              <motion.div
                initial={{ scale: 0.96, y: 8 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 8 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-2xl bg-[#0F1318] border border-white/[0.10] p-6 shadow-2xl"
              >
                <button type="button" onClick={() => setShowExpandModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] ring-1 ring-white/[0.10] flex items-center justify-center text-white/40 hover:text-white/80 transition">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  {(curatedTalent.profileImageUrl || curatedTalent.avatarUrl) && (
                    <img src={curatedTalent.profileImageUrl || curatedTalent.avatarUrl} alt={talent.name} className="h-14 w-14 rounded-full object-cover ring-1 ring-white/10 shrink-0" />
                  )}
                  <div>
                    <p className="text-[16px] font-medium text-white/90">{talent.name}</p>
                    <p className="text-[12px] text-white/45">{talent.headline}</p>
                  </div>
                </div>
                <p className="text-[13px] text-white/65 leading-relaxed mb-4">{curatedTalent.shortBio || curatedTalent.nicheSummary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {talent.roles.map((r) => <span key={r} className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-white/65 ring-1 ring-white/[0.10]">{r}</span>)}
                  {talent.platforms.map((p) => <span key={p} className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-white/45 ring-1 ring-white/[0.07]">{p}</span>)}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </TooltipProvider>
  );
}
