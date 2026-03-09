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
  };
}

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } finally {
      setLoading(false);
    }
  }, []);

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
