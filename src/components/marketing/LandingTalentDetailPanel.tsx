"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CuratedTalent } from "@/lib/curatedTalent";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

type LandingTalentDetailPanelProps = {
  talent: CuratedTalent | null;
  onClose?: () => void;
};

export function LandingTalentDetailPanel({ talent, onClose }: LandingTalentDetailPanelProps) {
  const [view, setView] = useState<"about" | "work">("about");

  if (!talent) return null;

  return (
    <div className="mt-6 min-h-[260px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-[#0D1117] ring-1 ring-white/10 p-6 md:p-8"
      >
        {/* Toggle Buttons */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setView("about")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition",
              view === "about"
                ? "bg-white/10 text-white ring-1 ring-white/20"
                : "bg-white/5 text-white/60 hover:bg-white/8"
            )}
          >
            About
          </button>
          <button
            type="button"
            onClick={() => setView("work")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition",
              view === "work"
                ? "bg-white/10 text-white ring-1 ring-white/20"
                : "bg-white/5 text-white/60 hover:bg-white/8"
            )}
          >
            Work
          </button>
        </div>

        {/* Content with Flip Animation */}
        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            {view === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Left: Bio + Socials */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    {(talent.profileImageUrl || talent.avatarUrl) ? (
                      <img
                        src={talent.profileImageUrl || talent.avatarUrl}
                        alt={talent.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/10 ring-2 ring-white/20 flex items-center justify-center text-white/60 text-2xl font-medium flex-shrink-0">
                        {talent.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white/90 mb-1">
                        {talent.name}
                      </h3>
                      <p className="text-sm text-white/60">{talent.displayTitle}</p>
                    </div>
                  </div>

                  {/* Premium summary — 1–2 sentences, max 220 chars */}
                  {(talent.nicheSummary || talent.shortBio) && (
                    <p className="text-[13px] leading-relaxed text-white/70">
                      {getPremiumSummary(talent.nicheSummary?.trim() || talent.shortBio || "", 220)}
                    </p>
                  )}

                  {/* Social Pills — prefer links.*, fallback to legacy. No fabricated URLs. */}
                  <div className="flex flex-wrap gap-2">
                    {(talent.links?.instagram || talent.instagramUrl) && (
                      <a
                        href={talent.links?.instagram || talent.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10 hover:bg-white/10 transition"
                      >
                        Instagram
                      </a>
                    )}
                    {(talent.links?.tiktok || talent.tiktokUrl) && (
                      <a
                        href={talent.links?.tiktok || talent.tiktokUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10 hover:bg-white/10 transition"
                      >
                        TikTok
                      </a>
                    )}
                    {talent.links?.youtube && (
                      <a
                        href={talent.links.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10 hover:bg-white/10 transition"
                      >
                        YouTube
                      </a>
                    )}
                    {talent.links?.behance && (
                      <a
                        href={talent.links.behance}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10 hover:bg-white/10 transition"
                      >
                        Behance
                      </a>
                    )}
                    {talent.links?.website && (
                      <a
                        href={talent.links.website}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10 hover:bg-white/10 transition"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Tags — cap at 10 */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {talent.roleTags.slice(0, 10).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {talent.location && (
                    <p className="text-xs text-white/60">📍 {talent.location}</p>
                  )}
                </div>
              </motion.div>
            )}

            {view === "work" && (
              <motion.div
                key="work"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                {talent.portfolio && talent.portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {talent.portfolio.map((item, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10"
                      >
                        {item.type === "image" ? (
                          <Image
                            src={item.src}
                            alt={item.title || `Portfolio item ${index + 1}`}
                            fill
                            className="object-cover"
                            loading="lazy"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        ) : (
                          <video
                            src={item.src}
                            poster={item.poster}
                            controls
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/50">
                    <p className="text-sm">Portfolio coming soon</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
