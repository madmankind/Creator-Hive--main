"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCampaignPodStore } from "@/store/useCampaignPodStore";
import { X } from "lucide-react";

type Props = {
  onOpenBrief: () => void;
  onOpenProfile?: (id: string) => void;
};

export function CampaignPodPanel({ onOpenBrief, onOpenProfile }: Props) {
  const { selectedTalents, removeFromPod, clearPod } = useCampaignPodStore();

  return (
    <AnimatePresence>
      {selectedTalents.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-6 z-30 mx-auto max-w-5xl rounded-3xl bg-[#0F141A]/95 px-5 py-4 ring-1 ring-white/10 backdrop-blur"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white/90">
                Set up your campaign pod
              </h3>
              <p className="text-[11px] text-white/60">
                You&apos;ve added {selectedTalents.length}{" "}
                {selectedTalents.length === 1 ? "talent" : "talents"}. Refine
                your team, then share your brief.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearPod}
                className="rounded-full px-3 py-1.5 text-[11px] text-white/60 hover:bg-white/5"
              >
                Clear pod
              </button>
              <button
                type="button"
                onClick={onOpenBrief}
                className="rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-black hover:bg-white/90"
              >
                Continue to brief
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {selectedTalents.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onOpenProfile?.(t.id)}
                className="group relative flex min-w-[160px] items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-left ring-1 ring-white/10 hover:bg-white/8"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/80">
                  {t.name.charAt(0)}
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-xs font-medium text-white/85">
                    {t.name}
                  </span>
                  {t.roles[0] && (
                    <span className="text-[10px] text-white/60">
                      {t.roles[0]}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromPod(t.id);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}




