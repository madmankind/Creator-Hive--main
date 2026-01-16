"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CampaignCommandCenter } from "@/features/campaign-intelligence/CampaignCommandCenter";
import { CampaignProvider } from "@/contexts/CampaignContext";

function CampaignsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") || "track") as "track" | "manage" | "pay";
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

  // Sync selection from URL
  useEffect(() => {
    const campaignId = searchParams.get("campaignId");
    if (campaignId) {
      setSelectedCampaignIds((prev) => (prev.length === 1 && prev[0] === campaignId ? prev : [campaignId]));
    } else if (selectedCampaignIds.length) {
      setSelectedCampaignIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleCampaignChange = (ids: string[]) => {
    setSelectedCampaignIds(ids);
    const params = new URLSearchParams(searchParams.toString());
    if (ids.length === 1) {
      params.set("campaignId", ids[0]);
    } else {
      params.delete("campaignId");
    }
    if (!params.get("mode")) {
      params.set("mode", mode);
    }
    const qs = params.toString();
    router.replace(`/dashboard/campaigns${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  // All campaign modes use full-width layout with bottom dock navigation only
  // No side navigation - the bottom dock is the ONLY page switcher
  return (
    <CampaignProvider>
      <CampaignCommandCenter
        initialMode={mode}
        selectedCampaignIds={selectedCampaignIds}
        onCampaignChange={handleCampaignChange}
      />
    </CampaignProvider>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center" style={{ background: "#07070A" }}>
          <div className="text-white/40 text-sm">Loading campaign intelligence...</div>
        </div>
      }
    >
      <CampaignsContent />
    </Suspense>
  );
}
