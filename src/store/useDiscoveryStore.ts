"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DiscoveryState {
  // Step 1 — up to 3 ranked objectives
  primaryObjective: string;       // kept for backward compat (= rankedObjectives[0])
  rankedObjectives: string[];     // [first, second, third] in priority order
  requestedRoles: string[];
  // Step 2
  startTiming: string;
  budgetRange: string;
  companyName: string;
  industry: string;
  // Step 3
  notes: string;
  /** Workflow-fit mirror of talent PRISM dimensions — used for matching / AI search. */
  clientFitProfile: Record<string, unknown> | null;
  advisorRequested: boolean;
  // Flow state
  currentStep: number;
  completed: boolean;
  briefId: string | null;
}

interface DiscoveryActions {
  setField: <K extends keyof DiscoveryState>(key: K, value: DiscoveryState[K]) => void;
  setStep: (step: number) => void;
  complete: () => void;
  reset: () => void;
  hydrate: (data: Partial<DiscoveryState>) => void;
  toggleObjective: (id: string) => void;
}

const INITIAL: DiscoveryState = {
  primaryObjective: "",
  rankedObjectives: [],
  requestedRoles: [],
  startTiming: "",
  budgetRange: "",
  companyName: "",
  industry: "",
  notes: "",
  clientFitProfile: null,
  advisorRequested: false,
  currentStep: 0,
  completed: false,
  briefId: null,
};

export const useDiscoveryStore = create<DiscoveryState & DiscoveryActions>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      setField: (key, value) => set({ [key]: value }),
      setStep: (step) => set({ currentStep: step }),
      complete: () => set({ completed: true, currentStep: 3 }),
      reset: () => set(INITIAL),
      hydrate: (data) => set(data),
      toggleObjective: (id: string) => {
        const ranked = get().rankedObjectives;
        let next: string[];
        if (ranked.includes(id)) {
          next = ranked.filter((r) => r !== id);
        } else if (ranked.length < 3) {
          next = [...ranked, id];
        } else {
          return; // max 3
        }
        set({ rankedObjectives: next, primaryObjective: next[0] ?? "" });
      },
    }),
    { name: "ch-discovery" },
  ),
);
