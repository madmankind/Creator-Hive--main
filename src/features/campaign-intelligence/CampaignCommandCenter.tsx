"use client";

import { useSearchParams } from "next/navigation";
import { feyTokens } from "@/lib/fey-design-tokens";
import { TrackScreen } from "./TrackScreen";
import { ManageScreen } from "./ManageScreen";
import { PayScreen } from "./PayScreen";
import { DiscoverScreen } from "./DiscoverScreen";
export type DashboardMode = "track" | "manage" | "pay" | "discover";

interface CampaignCommandCenterProps {
  initialMode?: DashboardMode;
  selectedCampaignIds: string[];
  onCampaignChange?: (ids: string[]) => void;
}

export function CampaignCommandCenter({
  initialMode = "track",
  selectedCampaignIds,
  onCampaignChange,
}: CampaignCommandCenterProps) {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") || initialMode) as DashboardMode;

  // Route to appropriate screen based on mode
  switch (mode) {
    case "track":
      return <TrackScreen selectedCampaignIds={selectedCampaignIds} onCampaignChange={onCampaignChange} />;
    case "manage":
      return <ManageScreen selectedCampaignIds={selectedCampaignIds} />;
    case "pay":
      return <PayScreen selectedCampaignIds={selectedCampaignIds} />;
    case "discover":
      return <DiscoverScreen selectedCampaignIds={selectedCampaignIds} />;
    default:
      return <TrackScreen selectedCampaignIds={selectedCampaignIds} />;
  }
}
