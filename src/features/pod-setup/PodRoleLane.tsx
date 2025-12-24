"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CampaignRole } from "@/types/pod";
import type { Talent } from "@/store/useCampaignPodStore";
import type { TalentPodConfig } from "@/types/pod";
import { TalentCardFUT } from "./TalentCardFUT";
import { PodSlot } from "./PodSlot";

interface PodRoleLaneProps {
  role: CampaignRole;
  talents: Talent[];
  talentConfigs: Map<string, TalentPodConfig>;
  expandedCardId: string | null;
  onUpdateTalentConfig: (talentId: string, updates: Partial<TalentPodConfig>) => void;
  onRemoveTalent: (talentId: string) => void;
  onExpandCard: (talentId: string) => void;
  onCollapseCard: () => void;
}

export function PodRoleLane({
  role,
  talents,
  talentConfigs,
  expandedCardId,
  onUpdateTalentConfig,
  onRemoveTalent,
  onExpandCard,
  onCollapseCard,
}: PodRoleLaneProps) {
  const hasTalents = talents.length > 0;
  const laneHeight = role.multiple ? 220 : 200;

  return (
    <div className="relative" style={{ minHeight: `${laneHeight}px` }}>
      {/* Lane Header - FIFA-style */}
      <div className="mb-4 flex items-center gap-3">
        <div className={cn(
          "h-px flex-1 transition-all",
          hasTalents ? "bg-gradient-to-r from-transparent via-white/20 to-transparent" : "bg-white/5"
        )} />
        <h3
          className={cn(
            "text-sm font-black uppercase tracking-wider transition-colors px-3",
            hasTalents ? "text-white/90" : "text-white/20"
          )}
        >
          {role.label}
        </h3>
        <div className={cn(
          "h-px flex-1 transition-all",
          hasTalents ? "bg-gradient-to-r from-transparent via-white/20 to-transparent" : "bg-white/5"
        )} />
        {!hasTalents && (
          <div className="absolute left-1/2 -translate-x-1/2 top-8 text-[10px] text-white/10 uppercase tracking-wider font-medium">
            Not assigned
          </div>
        )}
      </div>

      {/* Cards Container - Horizontal FIFA-style layout */}
      <div className="flex items-start gap-5 flex-wrap justify-center">
        {talents
          .filter((talent) => {
            const config = talentConfigs.get(talent.id);
            return config !== undefined;
          })
          .map((talent, index) => {
            const config = talentConfigs.get(talent.id)!; // Safe because we filtered
            const isExpanded = expandedCardId === talent.id;
            const isDimmed = expandedCardId !== null && !isExpanded;

            return (
              <motion.div
                key={talent.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{
                  opacity: isDimmed ? 0.4 : 1,
                  scale: isExpanded ? 1.02 : 1,
                }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{
                  duration: isDimmed ? 0.16 : 0.2,
                  delay: isDimmed ? 0 : index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <TalentCardFUT
                  talent={talent}
                  config={config}
                  matchScore={85} // TODO: Calculate from campaign needs
                  onUpdate={(updates) => onUpdateTalentConfig(talent.id, updates)}
                  onRemove={() => onRemoveTalent(talent.id)}
                  isExpanded={isExpanded}
                  onExpand={() => onExpandCard(talent.id)}
                  onCollapse={onCollapseCard}
                />
              </motion.div>
            );
          })}

        {/* Empty slots for multiple roles */}
        {role.multiple && talents.length < 3 && (
          <PodSlot isEmpty={true} />
        )}
      </div>
    </div>
  );
}

