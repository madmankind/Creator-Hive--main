"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { X } from "lucide-react";
import { useCampaignPodStore } from "@/store/useCampaignPodStore";
import { usePodConfigStore } from "@/store/usePodConfigStore";
import { CampaignTree } from "./CampaignTree";
import { BudgetPanel } from "./BudgetPanel";

export function PodVisualization() {
  const { selectedTalents, removeFromPod } = useCampaignPodStore();
  const {
    isPodSetupOpen,
    podConfig,
    closePodSetup,
    updateTalentConfig,
    updateCampaignBrief,
    updateCampaignDuration,
  } = usePodConfigStore();

  // Prevent body scroll when open
  useEffect(() => {
    if (isPodSetupOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPodSetupOpen]);

  if (!isPodSetupOpen || !podConfig) return null;

  return (
    <AnimatePresence>
      {isPodSetupOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={closePodSetup}
          />

          {/* Main Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-7xl h-[90vh] rounded-3xl bg-[#0F141A] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-semibold text-white/90">
                    Set up your campaign pod
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Configure your team structure and budget
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePodSetup}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden flex">
                {/* Left: Campaign Tree */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <CampaignTree
                    selectedTalents={selectedTalents}
                    talentConfigs={podConfig.talentConfigs}
                    onUpdateTalentConfig={updateTalentConfig}
                    onRemoveTalent={removeFromPod}
                  />
                </div>

                {/* Right: Budget Panel */}
                <div className="w-80 border-l border-white/10 p-6 overflow-y-auto">
                  <BudgetPanel
                    campaignBrief={podConfig.campaignBrief}
                    campaignDuration={podConfig.campaignDuration}
                    talents={selectedTalents}
                    talentConfigs={podConfig.talentConfigs}
                    onUpdateBrief={updateCampaignBrief}
                    onUpdateDuration={updateCampaignDuration}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

