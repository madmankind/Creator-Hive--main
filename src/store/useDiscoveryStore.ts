"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DiscoveryState {
  // Step 1
  primaryObjective: string;
  requestedRoles: string[];
  // Step 2
  startTiming: string;
  budgetRange: string;
  companyName: string;
  industry: string;
  // Step 3
  notes: string;
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
}

const INITIAL: DiscoveryState = {
  primaryObjective: "",
  requestedRoles: [],
  startTiming: "",
  budgetRange: "",
  companyName: "",
  industry: "",
  notes: "",
  advisorRequested: false,
  currentStep: 0,
  completed: false,
  briefId: null,
};

export const useDiscoveryStore = create<DiscoveryState & DiscoveryActions>()(
  persist(
    (set) => ({
      ...INITIAL,
      setField: (key, value) => set({ [key]: value }),
      setStep: (step) => set({ currentStep: step }),
      complete: () => set({ completed: true, currentStep: 3 }),
      reset: () => set(INITIAL),
      hydrate: (data) => set(data),
    }),
    { name: "ch-discovery" },
  ),
);
