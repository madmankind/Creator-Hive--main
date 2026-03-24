"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { TalentCostBreakdown } from "./TalentCostBreakdown";
import { BriefUpload } from "./BriefUpload";
import type { Talent } from "@/store/useCampaignPodStore";
import type { TalentPodConfig } from "@/types/pod";

interface BudgetSidePanelProps {
  campaignBrief: string;
  campaignDuration: { start: Date | null; end: Date | null };
  talents: Talent[];
  talentConfigs: Map<string, TalentPodConfig>;
  onUpdateBrief: (brief: string) => void;
  onUpdateDuration: (start: Date | null, end: Date | null) => void;
  onConfirmPod?: () => void;
}

export function BudgetSidePanel({
  campaignBrief,
  campaignDuration,
  talents,
  talentConfigs,
  onUpdateBrief,
  onUpdateDuration,
  onConfirmPod,
}: BudgetSidePanelProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const campaignDays = useMemo(() => {
    if (!campaignDuration.start || !campaignDuration.end) return null;
    const diff = campaignDuration.end.getTime() - campaignDuration.start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [campaignDuration]);

  return (
    <div className="sticky top-6 h-fit">
      <GlassPanel className="p-6 space-y-6 border-white/10">
        {/* Header - FIFA-style */}
        <div className="border-b border-white/10 pb-4">
          <h3 className="text-base font-black text-white/90 mb-1 uppercase tracking-wider">Budget Summary</h3>
          <div className="text-[10px] text-white/50 uppercase tracking-wider font-medium">Real-time calculations</div>
        </div>

        {/* Campaign Brief */}
        <div>
          <label className="block text-[10px] font-bold text-white/80 uppercase tracking-wider mb-2">
            Campaign Brief
          </label>
          
          {/* File Upload */}
          <div className="mb-2">
            <BriefUpload
              selectedFile={uploadedFile}
              onFileSelect={(file) => {
                setUploadedFile(file);
                // TODO: Extract text from file
              }}
              onFileRemove={() => setUploadedFile(null)}
            />
          </div>
          
          {/* Textarea */}
          <textarea
            value={campaignBrief}
            onChange={(e) => onUpdateBrief(e.target.value)}
            placeholder="Or paste your campaign brief here..."
            rows={4}
            className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-xs text-white/90 placeholder:text-white/30 border border-white/10 focus:border-emerald-500/50 focus:outline-none resize-none transition-colors"
          />
        </div>

        {/* Campaign Duration */}
        <div>
          <label className="block text-[10px] font-bold text-white/80 uppercase tracking-wider mb-2">
            Campaign Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={campaignDuration.start ? campaignDuration.start.toISOString().split('T')[0] : ''}
              onChange={(e) => onUpdateDuration(
                e.target.value ? new Date(e.target.value) : null,
                campaignDuration.end
              )}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/90 border border-white/10 focus:border-emerald-500/50 focus:outline-none"
            />
            <input
              type="date"
              value={campaignDuration.end ? campaignDuration.end.toISOString().split('T')[0] : ''}
              onChange={(e) => onUpdateDuration(
                campaignDuration.start,
                e.target.value ? new Date(e.target.value) : null
              )}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/90 border border-white/10 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
          {campaignDays !== null && (
            <div className="text-xs text-white/50 mt-2 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {campaignDays} {campaignDays === 1 ? "day" : "days"}
            </div>
          )}
        </div>

        {/* Talent Cost Breakdown */}
        <TalentCostBreakdown talents={talents} talentConfigs={talentConfigs} />

        {/* CTA - Premium emerald style */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onConfirmPod}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-black text-white hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
        >
          Confirm Pod
        </motion.button>
      </GlassPanel>
    </div>
  );
}

