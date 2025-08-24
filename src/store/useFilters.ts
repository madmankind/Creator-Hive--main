"use client";
import { create } from "zustand";

export type Role = "Photographer" | "Motion Designer" | "UGC Creator" | "Art Director";

interface FiltersState {
  query: string;
  roles: Role[];
  minRate?: number;
  maxRate?: number;
  availability?: "Open" | "Limited" | "Booked";
  setQuery: (q: string) => void;
  toggleRole: (r: Role) => void;
  setRate: (min?: number, max?: number) => void;
  setAvailability: (a?: FiltersState["availability"]) => void;
  clear: () => void;
}

export const useFilters = create<FiltersState>((set, get) => ({
  query: "",
  roles: [],
  minRate: undefined,
  maxRate: undefined,
  availability: undefined,
  setQuery: (q) => set({ query: q }),
  toggleRole: (r) => {
    const roles = new Set(get().roles);
    roles.has(r) ? roles.delete(r) : roles.add(r);
    set({ roles: Array.from(roles) });
  },
  setRate: (min, max) => set({ minRate: min, maxRate: max }),
  setAvailability: (a) => set({ availability: a }),
  clear: () => set({ query: "", roles: [], minRate: undefined, maxRate: undefined, availability: undefined }),
}));

