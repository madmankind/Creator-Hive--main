"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CAMPAIGN_ROLES, mapTalentToRole } from "@/lib/podTreeModel";
import type { Talent } from "@/store/useCampaignPodStore";
import type { TalentPodConfig } from "@/types/pod";
import { PodRoleLane } from "./PodRoleLane";

interface PodTreeCanvasProps {
  talents: Talent[];
  talentConfigs: Map<string, TalentPodConfig>;
  expandedCardId: string | null;
  onUpdateTalentConfig: (talentId: string, updates: Partial<TalentPodConfig>) => void;
  onRemoveTalent: (talentId: string) => void;
  onExpandCard: (talentId: string) => void;
  onCollapseCard: () => void;
}

export function PodTreeCanvas({
  talents,
  talentConfigs,
  expandedCardId,
  onUpdateTalentConfig,
  onRemoveTalent,
  onExpandCard,
  onCollapseCard,
}: PodTreeCanvasProps) {
  // Group talents by role
  const talentsByRole = new Map<string, Talent[]>();
  
  talents.forEach((talent) => {
    const roleId = mapTalentToRole(talent.roles[0] || "Creator");
    const existing = talentsByRole.get(roleId) || [];
    talentsByRole.set(roleId, [...existing, talent]);
  });

  return (
    <motion.div
      className="relative py-8"
      animate={{
        scale: expandedCardId ? 1.02 : 1,
      }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Radial gradient background - emerald */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />

      {/* Tree Lanes - Formation style */}
      <div className="space-y-10">
        {CAMPAIGN_ROLES.map((role, index) => {
          const talentsInRole = talentsByRole.get(role.id) || [];
          const hasTalents = talentsInRole.length > 0;

          return (
            <div key={role.id} className="relative">
              {/* Connector Line (except first) - Enhanced */}
              {index > 0 && (
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: hasTalents ? 1 : 0.3 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 top-0 w-0.5 h-10 -translate-y-10",
                    hasTalents 
                      ? "bg-gradient-to-b from-emerald-500/40 via-white/30 to-transparent" 
                      : "bg-white/5 border-dashed"
                  )}
                  style={{ 
                    filter: hasTalents ? "none" : "blur(2px)",
                    boxShadow: hasTalents ? "0 0 8px rgba(16, 185, 129, 0.3)" : "none"
                  }}
                />
              )}

              {/* Role Lane */}
              <PodRoleLane
                role={role}
                talents={talentsInRole}
                talentConfigs={talentConfigs}
                expandedCardId={expandedCardId}
                onUpdateTalentConfig={onUpdateTalentConfig}
                onRemoveTalent={onRemoveTalent}
                onExpandCard={onExpandCard}
                onCollapseCard={onCollapseCard}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

