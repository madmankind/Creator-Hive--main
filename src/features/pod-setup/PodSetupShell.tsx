"use client";

import { useState } from "react";
import { PodTreeCanvas } from "./PodTreeCanvas";
import { BudgetSidePanel } from "./BudgetSidePanel";
import { QuotationPreview } from "./QuotationPreview";
import type { Talent } from "@/store/useCampaignPodStore";
import type { TalentPodConfig } from "@/types/pod";

interface PodSetupShellProps {
  talents: Talent[];
  talentConfigs: Map<string, TalentPodConfig>;
  campaignBrief: string;
  campaignDuration: { start: Date | null; end: Date | null };
  onUpdateTalentConfig: (talentId: string, updates: Partial<TalentPodConfig>) => void;
  onRemoveTalent: (talentId: string) => void;
  onUpdateBrief: (brief: string) => void;
  onUpdateDuration: (start: Date | null, end: Date | null) => void;
}

export function PodSetupShell({
  talents,
  talentConfigs,
  campaignBrief,
  campaignDuration,
  onUpdateTalentConfig,
  onRemoveTalent,
  onUpdateBrief,
  onUpdateDuration,
}: PodSetupShellProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [showQuotation, setShowQuotation] = useState(false);

  return (
    <div className="flex gap-8 h-full">
      {/* Left: Pod Tree Canvas (~70%) */}
      <div className="flex-[0.7] overflow-y-auto px-8 py-8">
        <PodTreeCanvas
          talents={talents}
          talentConfigs={talentConfigs}
          expandedCardId={expandedCardId}
          onUpdateTalentConfig={onUpdateTalentConfig}
          onRemoveTalent={onRemoveTalent}
          onExpandCard={(id) => setExpandedCardId(id)}
          onCollapseCard={() => setExpandedCardId(null)}
        />
      </div>

      {/* Right: Budget Panel (~30%) */}
      <div className="flex-[0.3] border-l border-white/10 p-6 overflow-y-auto">
        <BudgetSidePanel
          campaignBrief={campaignBrief}
          campaignDuration={campaignDuration}
          talents={talents}
          talentConfigs={talentConfigs}
          onUpdateBrief={onUpdateBrief}
          onUpdateDuration={onUpdateDuration}
          onConfirmPod={() => setShowQuotation(true)}
        />
      </div>

      {/* Quotation Preview */}
      <QuotationPreview
        open={showQuotation}
        onClose={() => setShowQuotation(false)}
        campaignBrief={campaignBrief}
        campaignDuration={campaignDuration}
        talents={talents}
        talentConfigs={talentConfigs}
      />
    </div>
  );
}

