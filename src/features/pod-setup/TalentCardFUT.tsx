"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Talent } from "@/store/useCampaignPodStore";
import type { TalentPodConfig } from "@/types/pod";
import { calculateTalentRate, formatCurrency } from "@/lib/podPricing";
import { TalentCardStats } from "./TalentCardStats";
import { TalentCardFUTExpanded } from "./TalentCardFUTExpanded";
import { emeraldTheme } from "@/lib/theme";

interface TalentCardFUTProps {
  talent: Talent;
  config: TalentPodConfig;
  matchScore?: number; // 0-100 Match Score
  onUpdate: (updates: Partial<TalentPodConfig>) => void;
  onRemove: () => void;
  isExpanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export function TalentCardFUT({
  talent,
  config,
  matchScore = 85,
  onUpdate,
  onRemove,
  isExpanded = false,
  onExpand,
  onCollapse = () => {},
}: TalentCardFUTProps) {
  const totalRate = calculateTalentRate(config);
  const primaryRole = talent.roles[0] || "Creator";

  // Get archetype based on role
  const getArchetype = (role: string): string => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes("ugc")) return "Performance UGC";
    if (roleLower.includes("videographer")) return "Visual Storyteller";
    if (roleLower.includes("photographer")) return "Brand Photographer";
    if (roleLower.includes("copywriter")) return "Brand Storyteller";
    if (roleLower.includes("strategist")) return "Strategic Lead";
    return "Content Creator";
  };

  const archetype = getArchetype(primaryRole);

  if (isExpanded) {
    return (
      <TalentCardFUTExpanded
        talent={talent}
        config={config}
        matchScore={matchScore}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onCollapse={onCollapse}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotateY: -5 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.92, rotateY: 5 }}
      whileHover={{ 
        y: -10, 
        scale: 1.03,
        rotateX: 2,
        rotateY: -2,
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
      }}
      className={cn(
        "group relative w-[300px] h-[200px] rounded-2xl",
        "bg-gradient-to-br from-[#0a0d14] via-[#0f141a] to-[#0a0d14]",
        "border-2 border-emerald-500/30",
        "shadow-2xl shadow-emerald-500/20",
        "cursor-pointer",
        "overflow-hidden",
        "backdrop-blur-sm",
        "transition-all duration-300",
        "perspective-1000"
      )}
      onClick={() => {
        onExpand?.();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onExpand?.();
        }
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Animated border glow on hover - emerald */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          background: `linear-gradient(135deg, ${emeraldTheme.accent.glow} 0%, rgba(5, 150, 105, 0.2) 100%)`,
          filter: "blur(12px)",
        }}
      />

      {/* Foil texture layer - diagonal sheen */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-30"
        style={{
          background: `linear-gradient(135deg, transparent 0%, ${emeraldTheme.accent.foil} 50%, transparent 100%)`,
          backgroundSize: "200% 200%",
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-20"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          background: `linear-gradient(135deg, transparent 0%, ${emeraldTheme.accent.foil} 50%, transparent 100%)`,
          backgroundSize: "200% 200%",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-radial from-transparent via-transparent to-black/20 pointer-events-none" />

      {/* Top accent bar - emerald */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

      {/* Match Score badge (top-left, FIFA-style OVR) */}
      <div className="absolute top-3 left-3 z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg blur-sm opacity-60" />
          <div className="relative bg-gradient-to-br from-emerald-600 to-teal-600 px-3 py-1.5 rounded-lg border border-emerald-400/40 shadow-lg">
            <div className="text-[10px] font-black text-white/90 uppercase tracking-wider leading-none mb-0.5">
              MATCH
            </div>
            <div className="text-lg font-black text-white leading-none">{matchScore}</div>
          </div>
        </div>
      </div>

      {/* Role badge top right */}
      <div className="absolute top-3 right-3 z-10">
        <div className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/20">
          <div className="text-[9px] font-black text-white/90 uppercase tracking-wider">
            {primaryRole.split(" ")[0]}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative h-full p-4 pt-12 flex flex-col">
        {/* Avatar + Name section */}
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar with emerald glow */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl blur-md opacity-50" />
            <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-xl ring-2 ring-emerald-400/40">
              {talent.name.charAt(0)}
            </div>
          </div>

          {/* Name + Archetype */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-black text-white truncate leading-tight mb-0.5">
              {talent.name}
            </div>
            <div className="text-[10px] text-white/60 font-medium">
              {archetype}
            </div>
          </div>
        </div>

        {/* Stats grid (FIFA-style) */}
        <TalentCardStats talent={talent} baseRate={config.baseDayRate} />

        {/* Bottom bar: Engagement + Total */}
        <div className="mt-auto pt-2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              config.engagementType === "per-project" ? "bg-emerald-400" :
              config.engagementType === "short-term" ? "bg-yellow-400" : "bg-blue-400"
            )} />
            <span className="text-[9px] font-medium text-white/70 uppercase tracking-wider">
              {config.engagementType === "per-project" ? "Project" : 
               config.engagementType === "short-term" ? "Short" : "Long"}
            </span>
          </div>
          
          {/* Total cost badge - emerald */}
          <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 backdrop-blur-sm">
            <div className="text-xs font-black text-white leading-none">
              {formatCurrency(totalRate)}
            </div>
          </div>
        </div>
      </div>

      {/* Inner highlight sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
    </motion.div>
  );
}
