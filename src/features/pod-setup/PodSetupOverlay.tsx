"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Easing } from "framer-motion";
import { X } from "lucide-react";
import { useCampaignPodStore } from "@/store/useCampaignPodStore";
import { usePodConfigStore } from "@/store/usePodConfigStore";
import { PodSetupShell } from "./PodSetupShell";

// Motion timing constants
const EASING_STANDARD: Easing = [0.22, 1, 0.36, 1];
const EASING_SOFT: Easing = [0.2, 0.8, 0.2, 1];
const EASING_QUICK: Easing = [0.33, 1, 0.68, 1];

export function PodSetupOverlay() {
  const { selectedTalents, removeFromPod } = useCampaignPodStore();
  const {
    isPodSetupOpen,
    podConfig,
    closePodSetup,
    updateTalentConfig,
    updateCampaignBrief,
    updateCampaignDuration,
  } = usePodConfigStore();

  const [isExpanding, setIsExpanding] = useState(false);

  // Prevent body scroll
  useEffect(() => {
    if (isPodSetupOpen) {
      document.body.style.overflow = "hidden";
      setIsExpanding(true);
    } else {
      document.body.style.overflow = "";
      setIsExpanding(false);
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
            transition={{ duration: 0.18, ease: EASING_SOFT }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-[20px]"
            onClick={closePodSetup}
          />

          {/* Radial gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 pointer-events-none bg-[radial-gradient(60%_55%_at_50%_50%,rgba(16,185,129,0.15),transparent_70%)]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.24, ease: EASING_STANDARD }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-[1240px] h-[88vh] min-h-[760px] rounded-3xl bg-[#0F141A]/95 border border-white/10 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
                    Set up your campaign pod
                  </h2>
                  <div className="text-xs text-white/50 mt-0.5">
                    Configure your team structure and budget
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closePodSetup}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <PodSetupShell
                  talents={selectedTalents}
                  talentConfigs={podConfig.talentConfigs}
                  campaignBrief={podConfig.campaignBrief}
                  campaignDuration={podConfig.campaignDuration}
                  onUpdateTalentConfig={updateTalentConfig}
                  onRemoveTalent={removeFromPod}
                  onUpdateBrief={updateCampaignBrief}
                  onUpdateDuration={updateCampaignDuration}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
