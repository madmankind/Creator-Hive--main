"use client";

import { feyTokens } from "@/lib/fey-design-tokens";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { QuickBookPanel } from "@/components/campaigns/QuickBookPanel";
import { ArrowUpRight } from "lucide-react";

interface DiscoverScreenProps {
  selectedCampaignIds: string[];
}

export function DiscoverScreen({ selectedCampaignIds: _ }: DiscoverScreenProps) {

  const headerLeft = (
    <span className="text-[14px] font-medium" style={{ color: feyTokens.colors.text.primary }}>
      Discover
    </span>
  );

  return (
    <DashboardShell headerLeft={headerLeft}>
      {/* Quick Book */}
      <div className="mb-10">
        <div className="mb-6">
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-1"
            style={{ color: feyTokens.colors.text.label }}
          >
            Quick Book
          </p>
          <h2
            className="text-[24px] font-light tracking-[-0.02em]"
            style={{ color: feyTokens.colors.text.primary }}
          >
            Book a New Campaign
          </h2>
        </div>
        <QuickBookPanel />
      </div>

      {/* Browse Talent CTA — returns to landing booking flow */}
      <div
        className="flex items-center justify-between rounded-2xl p-6 cursor-pointer group transition-all"
        style={{
          background: "rgba(124,92,255,0.07)",
          border: "1px solid rgba(124,92,255,0.18)",
        }}
        onClick={() => { window.location.href = "/"; }}
      >
        <div>
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-1"
            style={{ color: "rgba(167,139,250,0.6)" }}
          >
            Browse Talent
          </p>
          <h3
            className="text-[22px] font-light tracking-[-0.02em]"
            style={{ color: feyTokens.colors.text.primary }}
          >
            Discover Creators
          </h3>
          <p className="text-[14px] mt-1" style={{ color: feyTokens.colors.text.muted }}>
            Search, filter, and add vetted creators to your next campaign
          </p>
        </div>
        <div
          className="flex items-center justify-center rounded-full transition-all group-hover:scale-105"
          style={{
            width: "48px", height: "48px",
            background: "rgba(124,92,255,0.15)",
            border: "1px solid rgba(124,92,255,0.3)",
            color: "rgba(167,139,250,0.9)",
          }}
        >
          <ArrowUpRight size={20} />
        </div>
      </div>
    </DashboardShell>
  );
}
