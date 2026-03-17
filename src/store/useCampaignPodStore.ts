"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Talent = {
  id: string;
  name: string;
  headline?: string;
  avatarUrl?: string;
  roles: string[];
  platforms: string[];
  availabilityTags?: string[];
  bio?: string;
  bookedRole?: string; // which role they were booked under
};

type PodEntry = {
  talent: Talent;
  bookedRole: string; // the specific role this slot was booked as
  slotId: string;     // id+role composite so same talent can fill multiple roles
};

type CampaignPodState = {
  selectedTalents: Talent[];       // backward-compat flat list
  podEntries: PodEntry[];          // new: role-aware entries
  addToPod: (talent: Talent, role?: string) => void;
  removeFromPod: (id: string, role?: string) => void;
  toggleInPod: (talent: Talent, role?: string) => void;
  isInPod: (id: string, role?: string) => boolean;
  clearPod: () => void;
  setTalents: (talents: Talent[]) => void;
};

export const useCampaignPodStore = create<CampaignPodState>()(
  persist(
    (set, get) => ({
      selectedTalents: [],
      podEntries: [],

      isInPod: (id, role) => {
        const { podEntries } = get();
        if (role) return podEntries.some(e => e.talent.id === id && e.bookedRole === role);
        return podEntries.some(e => e.talent.id === id);
      },

      addToPod: (talent, role) => {
        const bookedRole = role ?? talent.roles[0] ?? "Creator";
        const slotId = `${talent.id}::${bookedRole}`;
        const { podEntries } = get();
        // Don't add same talent+role combo twice
        if (podEntries.some(e => e.slotId === slotId)) return;
        const enriched = { ...talent, bookedRole };
        const newEntry: PodEntry = { talent: enriched, bookedRole, slotId };
        const newEntries = [...podEntries, newEntry];
        set({
          podEntries: newEntries,
          selectedTalents: newEntries.map(e => e.talent),
        });
      },

      removeFromPod: (id, role) => {
        const { podEntries } = get();
        const filtered = role
          ? podEntries.filter(e => !(e.talent.id === id && e.bookedRole === role))
          : podEntries.filter(e => e.talent.id !== id);
        set({ podEntries: filtered, selectedTalents: filtered.map(e => e.talent) });
      },

      toggleInPod: (talent, role) => {
        const { isInPod, addToPod, removeFromPod } = get();
        if (isInPod(talent.id, role)) {
          removeFromPod(talent.id, role);
        } else {
          addToPod(talent, role);
        }
      },

      clearPod: () => set({ selectedTalents: [], podEntries: [] }),

      setTalents: (talents) => {
        const entries: PodEntry[] = talents.map(t => ({
          talent: t,
          bookedRole: t.bookedRole ?? t.roles[0] ?? "Creator",
          slotId: `${t.id}::${t.bookedRole ?? t.roles[0] ?? "Creator"}`,
        }));
        set({ selectedTalents: talents, podEntries: entries });
      },
    }),
    { name: "creator-hive-campaign-pod" }
  )
);
