"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Talent = {
  id: string;
  name: string;
  headline?: string; // "UGC Creator · Content Creator"
  avatarUrl?: string;
  roles: string[]; // ["UGC Creator", "Photographer"]
  platforms: string[]; // ["Instagram", "TikTok"]
  availabilityTags?: string[]; // ["Hourly", "Monthly"]
  bio?: string; // Short bio for display
};

type CampaignPodState = {
  selectedTalents: Talent[];
  addToPod: (talent: Talent) => void;
  removeFromPod: (id: string) => void;
  clearPod: () => void;
};

export const useCampaignPodStore = create<CampaignPodState>()(
  persist(
    (set, get) => ({
      selectedTalents: [],
      addToPod: (talent) => {
        const current = get().selectedTalents;
        if (current.some((t) => t.id === talent.id)) return;
        set({ selectedTalents: [...current, talent] });
      },
      removeFromPod: (id) => {
        set({
          selectedTalents: get().selectedTalents.filter((t) => t.id !== id),
        });
      },
      clearPod: () => set({ selectedTalents: [] }),
    }),
    {
      name: "creator-hive-campaign-pod",
    },
  ),
);

