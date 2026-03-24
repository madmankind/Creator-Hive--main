"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Campaign } from "@/contexts/CampaignContext";

interface LocalCampaignState {
  campaigns: Campaign[];
  addCampaign: (c: Campaign) => void;
  removeCampaign: (id: string) => void;
  clearAll: () => void;
}

export const useLocalCampaignStore = create<LocalCampaignState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      addCampaign: (c) => {
        if (get().campaigns.some((x) => x.id === c.id)) return;
        set({ campaigns: [...get().campaigns, c] });
      },
      removeCampaign: (id) => set({ campaigns: get().campaigns.filter((c) => c.id !== id) }),
      clearAll: () => set({ campaigns: [] }),
    }),
    { name: "creator-hive-local-campaigns" }
  )
);
