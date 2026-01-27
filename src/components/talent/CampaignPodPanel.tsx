"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaignPodStore, type Talent as PodTalent } from "@/store/useCampaignPodStore";
import { X } from "lucide-react";
import { curatedTalent } from "@/lib/curatedTalent";
import { cn } from "@/lib/utils";

type Props = {
  onOpenBrief: () => void;
  onOpenProfile?: (id: string) => void;
  // Landing mode props (when provided, skip API/store, use curatedTalent lookup)
  selectedPodIds?: string[];
  onRemove?: (id: string) => void;
  onClear?: () => void;
};

const curatedLookup = new Map(curatedTalent.map((talent) => [talent.id, talent]));

function toPodTalent(id: string): PodTalent | null {
  const talent = curatedLookup.get(id);
  if (!talent) return null;
  return {
    id: talent.id,
    name: talent.name,
    headline: talent.displayTitle,
    avatarUrl: talent.avatarUrl,
    roles: talent.roleTags,
    platforms: talent.platformTags,
    availabilityTags: talent.availability,
    bio: talent.shortBio,
  };
}

export function CampaignPodPanel({ onOpenBrief, onOpenProfile, selectedPodIds, onRemove, onClear }: Props) {
  const { selectedTalents, removeFromPod, clearPod, setTalents } = useCampaignPodStore();
  const [syncing, setSyncing] = useState(false);
  const hydrated = useRef(false);

  // Landing mode: use selectedPodIds prop, skip API/store
  const isLandingMode = selectedPodIds !== undefined;
  const displayTalents = isLandingMode
    ? selectedPodIds.map((id) => toPodTalent(id)).filter(Boolean) as PodTalent[]
    : selectedTalents;

  const handleRemove = isLandingMode && onRemove ? onRemove : removeFromPod;
  const handleClear = isLandingMode && onClear ? onClear : clearPod;

  // Only sync to API if NOT in landing mode
  useEffect(() => {
    if (isLandingMode) return; // Skip API calls in landing mode
    
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/pods", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled || !json?.data?.talentIds) return;
        const talents = json.data.talentIds
          .map((id: string) => toPodTalent(id))
          .filter(Boolean) as PodTalent[];
        setTalents(talents);
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [setTalents, isLandingMode]);

  useEffect(() => {
    if (isLandingMode) return; // Skip API sync in landing mode
    
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    setSyncing(true);
    const controller = new AbortController();
    fetch("/api/pods", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ talentIds: selectedTalents.map((talent) => talent.id) }),
      signal: controller.signal,
    })
      .catch(() => null)
      .finally(() => setSyncing(false));
    return () => controller.abort();
  }, [selectedTalents, isLandingMode]);

  return (
    <AnimatePresence>
      {displayTalents.length > 0 && (
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
                You&apos;ve added {displayTalents.length}{" "}
                {displayTalents.length === 1 ? "talent" : "talents"}. Refine
                your team, then share your brief.
              </p>
              {syncing && !isLandingMode && (
                <p className="text-[10px] text-white/40 mt-1">Syncing pod…</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full px-3 py-1.5 text-[11px] text-white/60 hover:bg-white/5"
              >
                Clear pod
              </button>
              <button
                type="button"
                onClick={onOpenBrief}
                disabled={displayTalents.length === 0}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[11px] font-semibold transition",
                  displayTalents.length === 0
                    ? "bg-white/20 text-white/40 cursor-not-allowed"
                    : "bg-white text-black hover:bg-white/90"
                )}
              >
                Set up pod
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {displayTalents.map((t) => (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenProfile?.(t.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenProfile?.(t.id);
                  }
                }}
                className="group relative flex min-w-[160px] items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-left ring-1 ring-white/10 hover:bg-white/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
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
                    handleRemove(t.id);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}


