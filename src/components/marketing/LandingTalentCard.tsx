"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Talent } from "@/store/useCampaignPodStore";
import { cn } from "@/lib/utils";

type LandingTalentCardProps = {
  talent: Talent;
  isAdded?: boolean;
  onAdd?: (talent: Talent) => void;
  onOpenProfile?: (talent: Talent) => void;
};

export function LandingTalentCard({
  talent,
  isAdded,
  onAdd,
  onOpenProfile,
}: LandingTalentCardProps) {
  return (
    <motion.article
      layout
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl",
        "bg-white/5 px-5 py-4 ring-1 ring-white/10",
        "w-[300px] min-h-[240px] flex-shrink-0"
      )}
      onClick={() => onOpenProfile?.(talent)}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Top row: avatar + name + Add/Added */}
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
      </div>
    </motion.article>
  );
}
