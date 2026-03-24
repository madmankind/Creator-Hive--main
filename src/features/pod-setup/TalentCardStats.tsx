"use client";

import type { Talent } from "@/store/useCampaignPodStore";

interface TalentCardStatsProps {
  talent: Talent;
  baseRate: number;
}

export function TalentCardStats({ talent, baseRate }: TalentCardStatsProps) {
  // Calculate creator-relevant metrics (FIFA-style stats)
  
  // IG (Instagram followers/views) - mock based on talent data
  const getIG = (): number => {
    // Would come from actual talent data
    if (talent.platforms.includes("Instagram")) {
      return Math.floor(Math.random() * 20) + 80; // 80-100
    }
    return Math.floor(Math.random() * 30) + 60; // 60-90
  };

  // TT (TikTok followers/views)
  const getTT = (): number => {
    if (talent.platforms.includes("TikTok")) {
      return Math.floor(Math.random() * 20) + 80;
    }
    return Math.floor(Math.random() * 30) + 60;
  };

  // SLA (Delivery speed / turnaround tier)
  const getSLA = (): number => {
    // Based on role - videographers/editors might be slower
    const roleLower = talent.roles[0]?.toLowerCase() || "";
    if (roleLower.includes("editor") || roleLower.includes("videographer")) {
      return Math.floor(Math.random() * 15) + 75; // 75-90
    }
    return Math.floor(Math.random() * 10) + 85; // 85-95
  };

  // REL (Reliability score / on-time delivery)
  const getREL = (): number => {
    // Mock reliability - would come from historical data
    return Math.floor(Math.random() * 10) + 88; // 88-98
  };

  const ig = getIG();
  const tt = getTT();
  const sla = getSLA();
  const rel = getREL();

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {/* IG (Instagram) */}
      <div className="text-center">
        <div className="text-[8px] text-white/50 uppercase tracking-wider mb-0.5 font-bold">
          IG
        </div>
        <div className="text-xs font-black text-white leading-none">
          {ig}
        </div>
      </div>

      {/* TT (TikTok) */}
      <div className="text-center">
        <div className="text-[8px] text-white/50 uppercase tracking-wider mb-0.5 font-bold">
          TT
        </div>
        <div className="text-xs font-black text-white leading-none">
          {tt}
        </div>
      </div>

      {/* SLA (Delivery Speed) */}
      <div className="text-center">
        <div className="text-[8px] text-white/50 uppercase tracking-wider mb-0.5 font-bold">
          SLA
        </div>
        <div className="text-xs font-black text-white leading-none">
          {sla}
        </div>
      </div>

      {/* REL (Reliability) */}
      <div className="text-center">
        <div className="text-[8px] text-white/50 uppercase tracking-wider mb-0.5 font-bold">
          REL
        </div>
        <div className="text-xs font-black text-white leading-none">
          {rel}
        </div>
      </div>
    </div>
  );
}
