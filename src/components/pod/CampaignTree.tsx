"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Talent } from "@/store/useCampaignPodStore";
import type { TalentPodConfig } from "@/lib/podRates";
import { PodTalentCard } from "./PodTalentCard";

interface CampaignTreeProps {
  selectedTalents: Talent[];
  talentConfigs: Map<string, TalentPodConfig>;
  onUpdateTalentConfig: (talentId: string, updates: Partial<TalentPodConfig>) => void;
  onRemoveTalent: (talentId: string) => void;
}

// Universal campaign roles hierarchy
const CAMPAIGN_ROLES = [
  { id: "campaign-lead", label: "Campaign Lead / Project Manager", level: 0 },
  { id: "account-manager", label: "Account Manager", level: 1 },
  { id: "strategy-creative", label: "Strategy / Creative Lead", level: 2 },
  { id: "production-lead", label: "Production Lead", level: 3 },
  { id: "creators", label: "Creators", level: 4, multiple: true },
  { id: "editors", label: "Editors / Post-production", level: 5 },
  { id: "paid-media", label: "Paid / Performance / Media Buyers", level: 6 },
];

// Map talent roles to campaign tree roles
const mapTalentToRole = (talent: Talent): string => {
  const primaryRole = talent.roles[0]?.toLowerCase() || "";
  
  if (primaryRole.includes("project manager") || primaryRole.includes("campaign")) {
    return "campaign-lead";
  }
  if (primaryRole.includes("account")) {
    return "account-manager";
  }
  if (primaryRole.includes("strategy") || primaryRole.includes("creative")) {
    return "strategy-creative";
  }
  if (primaryRole.includes("production")) {
    return "production-lead";
  }
  if (primaryRole.includes("editor") || primaryRole.includes("post")) {
    return "editors";
  }
  if (primaryRole.includes("paid") || primaryRole.includes("media") || primaryRole.includes("performance")) {
    return "paid-media";
  }
  // Default to creators
  return "creators";
};

export function CampaignTree({
  selectedTalents,
  talentConfigs,
  onUpdateTalentConfig,
  onRemoveTalent,
}: CampaignTreeProps) {
  // Group talents by their role in the campaign tree
  const talentsByRole = new Map<string, Talent[]>();
  
  selectedTalents.forEach((talent) => {
    const roleId = mapTalentToRole(talent);
    const existing = talentsByRole.get(roleId) || [];
    talentsByRole.set(roleId, [...existing, talent]);
  });

  return (
    <div className="relative min-h-[600px] py-8">
      {/* Tree Structure */}
      <div className="relative space-y-6">
        {CAMPAIGN_ROLES.map((role, index) => {
          const talentsInRole = talentsByRole.get(role.id) || [];
          const hasTalents = talentsInRole.length > 0;
          const isMultiple = role.multiple === true;

          return (
            <div key={role.id} className="relative">
              {/* Role Label */}
              <div className="mb-4">
                <h3
                  className={cn(
                    "text-sm font-medium transition",
                    hasTalents
                      ? "text-white/90"
                      : "text-white/30"
                  )}
                >
                  {role.label}
                </h3>
                {!hasTalents && (
                  <p className="text-xs text-white/20 mt-1">Not assigned</p>
                )}
              </div>

              {/* Talent Cards */}
              {hasTalents ? (
                <div className={cn(
                  "grid gap-4",
                  isMultiple ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                  {talentsInRole.map((talent) => {
                    const config = talentConfigs.get(talent.id);
                    if (!config) return null;
                    
                    return (
                      <PodTalentCard
                        key={talent.id}
                        talent={talent}
                        config={config}
                        onUpdate={(updates) => onUpdateTalentConfig(talent.id, updates)}
                        onRemove={() => onRemoveTalent(talent.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-white/10 bg-white/2 p-8 text-center">
                  <p className="text-xs text-white/30">
                    {isMultiple ? "No creators assigned" : "Not assigned"}
                  </p>
                </div>
              )}

              {/* Connector Line (except last) */}
              {index < CAMPAIGN_ROLES.length - 1 && (
                <div className="flex justify-center my-6">
                  <div
                    className={cn(
                      "h-8 w-px transition",
                      hasTalents
                        ? "bg-white/20"
                        : "bg-white/5 border-dashed"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

