"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useLocalCampaignStore } from "@/store/useLocalCampaignStore";

export interface Campaign {
  id: string;
  name: string;
  objective: "awareness" | "engagement" | "traffic" | "conversions";
  budget: number;
  spend: number;
  status?: string;
  clientName?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  // Enriched from booking flow
  talentIds?: string[];
  talentNames?: string[];
  bookingType?: "campaign" | "retainer";
  paymentSchedule?: "milestone_50_50" | "upfront_100" | "monthly";
  notes?: string;
  objectives?: string[];
}

interface CampaignContextType {
  activeCampaign: Campaign | null;
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  setActiveCampaign: (campaign: Campaign | null) => void;
  refreshCampaigns: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

function mapApiCampaign(c: {
  id: string;
  name?: string;
  title?: string;
  status?: string;
  budget?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  talentNames?: string[];
  talentIds?: string[];
}): Campaign {
  return {
    id: c.id,
    name: c.name || c.title || "Untitled Campaign",
    objective: "awareness",
    budget: c.budget ?? 0,
    spend: 0,
    status: c.status,
    startDate: c.startDate ?? undefined,
    endDate: c.dueDate ?? undefined,
    talentNames: c.talentNames,
    talentIds: c.talentIds,
  };
}

export function CampaignProvider({ children }: { children: ReactNode }) {
  // Immediately hydrate from local store so booking-flow campaigns are available on first render
  const localCampaignsInit = useLocalCampaignStore((state) => state.campaigns);
  const [campaigns, setCampaigns] = useState<Campaign[]>(localCampaignsInit);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(localCampaignsInit[0] ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to local store so booking-flow campaigns appear immediately
  const localCampaigns = useLocalCampaignStore((state) => state.campaigns);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error(`Failed to load campaigns: ${res.status}`);
      const data = await res.json();
      const mapped: Campaign[] = (data.campaigns ?? []).map(mapApiCampaign);
      // Merge with locally-persisted campaigns from booking flow
      const local = useLocalCampaignStore.getState().campaigns;
      const merged = [...mapped];
      for (const lc of local) {
        if (!merged.some((c) => c.id === lc.id)) merged.push(lc);
      }
      setCampaigns(merged);
      setActiveCampaign((prev) => {
        if (prev) {
          const still = merged.find((c) => c.id === prev.id);
          return still ?? merged[0] ?? null;
        }
        return merged[0] ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // Still load local campaigns on API failure
      const local = useLocalCampaignStore.getState().campaigns;
      if (local.length > 0) {
        setCampaigns(local);
        setActiveCampaign((prev) => prev ?? local[0] ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync local campaigns into context whenever localCampaignStore changes
  useEffect(() => {
    if (localCampaigns.length === 0) return;
    setCampaigns((prev) => {
      const merged = [...prev];
      let changed = false;
      for (const lc of localCampaigns) {
        if (!merged.some((c) => c.id === lc.id)) {
          merged.push(lc);
          changed = true;
        }
      }
      return changed ? merged : prev;
    });
    setActiveCampaign((prev) => {
      if (prev) return prev;
      return localCampaigns[0] ?? null;
    });
  }, [localCampaigns]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <CampaignContext.Provider
      value={{
        activeCampaign,
        campaigns,
        loading,
        error,
        setActiveCampaign,
        refreshCampaigns: fetchCampaigns,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error("useCampaign must be used within a CampaignProvider");
  }
  return context;
}
