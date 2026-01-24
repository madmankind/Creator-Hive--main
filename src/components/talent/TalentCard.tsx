"use client";

import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import { Talent } from "@/store/useCampaignPodStore";
import { cn } from "@/lib/utils";

type TalentCardProps = {
  talent: Talent;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onBook?: (talent: Talent) => void;
  onAddToPod?: (talent: Talent) => void;
  onOpenProfile?: (talent: Talent) => void;
  /** Discover variant: consistent height, Add/Added CTA instead of heart/hover CTAs */
  variant?: "default" | "discover";
  /** Discover: whether this talent is in the selection set */
  isAdded?: boolean;
  /** Discover: called when Add is clicked */
  onAdd?: (talent: Talent) => void;
  /** Discover: muted accent for 1px border when in a role lane (e.g. rgba(168,85,247,0.4)) */
  laneAccent?: string;
};

export function TalentCard({
  talent,
  isFavorite,
  onToggleFavorite,
  onBook,
  onAddToPod,
  onOpenProfile,
  variant = "default",
  isAdded,
  onAdd,
  laneAccent,
}: TalentCardProps) {
  const isDiscover = variant === "discover";

  return (
    <motion.article
      layout
      whileHover={isDiscover ? undefined : { y: -4 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl",
        "bg-white/5 px-5 py-4",
        isDiscover ? "w-[300px] min-h-[240px] flex-shrink-0" : "w-[360px]",
        laneAccent ? "border" : "ring-1 ring-white/10",
      )}
      style={laneAccent ? { borderColor: laneAccent } : undefined}
      onClick={() => onOpenProfile?.(talent)}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Top row: avatar + name + (heart | Add/Added) */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white/80 flex-shrink-0">
            {talent.name.charAt(0) || "C"}
          </div>
          <div className="flex flex-1 flex-col min-w-0">
            <span className="text-sm font-medium text-white/90 truncate">
              {talent.name}
            </span>
            {talent.headline && (
              <span className="text-xs text-white/60 truncate">{talent.headline}</span>
            )}
          </div>

          {isDiscover ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isAdded) return;
                onAdd?.(talent);
              }}
              disabled={isAdded}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition flex-shrink-0",
                isAdded
                  ? "bg-white/10 text-white/50 cursor-default"
                  : "bg-white/10 text-white/80 hover:bg-white/15 ring-1 ring-white/10",
              )}
            >
              <Plus className="h-3 w-3" />
              {isAdded ? "Added" : "Add"}
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(talent.id);
              }}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full",
                "bg-white/5 ring-1 ring-white/10 transition-transform",
                "hover:scale-105",
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite ? "fill-white text-white" : "text-white/60",
                )}
              />
            </button>
          )}
        </div>

        {/* Description */}
        {talent.bio && (
          <p className="mt-3 line-clamp-3 text-xs text-white/70 flex-1 min-h-0">
            {talent.bio}
          </p>
        )}

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {talent.roles.slice(0, 4).map((r) => (
            <span
              key={r}
              className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/70 ring-1 ring-white/10"
            >
              {r}
            </span>
          ))}
          {talent.platforms.map((p) => (
            <span
              key={p}
              className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/60 ring-1 ring-white/10"
            >
              {p}
            </span>
          ))}
          {talent.availabilityTags?.map((a) => (
            <span
              key={a}
              className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300 ring-1 ring-emerald-400/40"
            >
              {a}
            </span>
          ))}
        </div>

        {/* Hover CTAs (default variant only) */}
        {!isDiscover && (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 flex justify-end px-5 pt-4",
              "opacity-0 transition-opacity group-hover:opacity-100",
            )}
          >
            <div className="pointer-events-auto flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToPod?.(talent);
                }}
                className="rounded-full bg-[#7C3AED] text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] hover:bg-[#8B5CF6] hover:shadow-[0_0_32px_rgba(124,58,237,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/70 px-3 py-1.5 text-[11px] font-medium transition"
              >
                Add to pod
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBook?.(talent);
                }}
                className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black hover:bg-white/90"
              >
                Book talent
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

