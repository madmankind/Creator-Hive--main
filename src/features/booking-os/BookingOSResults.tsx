"use client";

import { useMemo } from "react";
import { TalentCarousel } from "@/components/marketing/TalentCarousel";
import { curatedTalent } from "@/lib/curatedTalent";
import { computeFitScore } from "@/lib/matching/fitScore";
import type { BriefDraft } from "./types";

type BookingOSResultsProps = {
  briefDraft: BriefDraft | null;
  selectedPodIds: string[];
  onAddToPod: (talentId: string) => void;
  onRemoveFromPod?: (talentId: string) => void;
};

export function BookingOSResults({
  briefDraft,
  selectedPodIds,
  onAddToPod,
  onRemoveFromPod,
}: BookingOSResultsProps) {
  const sortedTalents = useMemo(() => {
    const draft = briefDraft ?? {
      roles: [],
      outputs: [],
      platforms: [],
      industry: null,
      market: null,
      language: null,
    };
    return [...curatedTalent].sort((a, b) => {
      const sa = computeFitScore(a, draft).score;
      const sb = computeFitScore(b, draft).score;
      return sb - sa;
    });
  }, [briefDraft]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] blur-3xl opacity-100 bg-[radial-gradient(60%_55%_at_50%_0%,rgba(139,92,246,0.22),transparent_70%)]" aria-hidden />
      <div className="relative z-10 w-full max-w-[1348px] mx-auto px-6 md:px-12">
        <TalentCarousel
          talents={sortedTalents}
          selectedPodIds={selectedPodIds}
          onAddToPod={onAddToPod}
        />
      </div>
    </div>
  );
}
