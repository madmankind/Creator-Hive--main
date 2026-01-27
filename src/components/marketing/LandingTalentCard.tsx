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
  isExpanded?: boolean;
};

export function LandingTalentCard({
  talent,
  isAdded,
  onAdd,
  onOpenProfile,
  isExpanded,
}: LandingTalentCardProps) {
  return (
    <motion.article
      layout
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl",
        "bg-white/5 px-4 py-3 ring-1 ring-white/10",
        "w-[280px] flex-shrink-0",
        isExpanded && "ring-white/20"
      )}
      onClick={() => onOpenProfile?.(talent)}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Top row: avatar + name + Add/Added */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white/80 flex-shrink-0">
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
              "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition flex-shrink-0",
              isAdded
                ? "bg-white/10 text-white/50 cursor-default"
                : "bg-white/10 text-white/80 hover:bg-white/15 ring-1 ring-white/10",
            )}
          >
            <Plus className="h-3 w-3" />
            {isAdded ? "Added" : "Add"}
          </button>
        </div>

        {/* Description - 2 lines max */}
        {talent.bio && (
          <p className="mt-2.5 line-clamp-2 text-xs text-white/70 flex-1 min-h-0 leading-relaxed">
            {talent.bio}
          </p>
        )}

        {/* Tags - max 2 rows */}
        <div className="mt-3 flex flex-wrap gap-1.5 max-h-[48px] overflow-hidden">
          {talent.roles.slice(0, 4).map((r) => (
            <span
              key={r}
              className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-white/70 ring-1 ring-white/10"
            >
              {r}
            </span>
          ))}
          {talent.platforms.slice(0, 2).map((p) => (
            <span
              key={p}
              className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-white/60 ring-1 ring-white/10"
            >
              {p}
            </span>
          ))}
          {talent.availabilityTags?.slice(0, 1).map((a) => (
            <span
              key={a}
              className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-300 ring-1 ring-emerald-400/40"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
