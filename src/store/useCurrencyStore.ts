"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "AED" | "USD";

const AED_PER_USD = 3.6725;

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggle: () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: "AED",
      setCurrency: (currency) => set({ currency }),
      toggle: () => set({ currency: get().currency === "AED" ? "USD" : "AED" }),
    }),
    { name: "ch-currency" }
  )
);

/** Format an AED amount for display in the selected currency. */
export function formatPrice(aed: number, currency: Currency): string {
  if (currency === "USD") {
    const usd = Math.round(aed / AED_PER_USD);
    if (usd >= 1000) return `$${(usd / 1000).toFixed(usd % 1000 === 0 ? 0 : 1)}K`;
    return `$${usd.toLocaleString()}`;
  }
  if (aed >= 1000) return `AED ${(aed / 1000).toFixed(aed % 1000 === 0 ? 0 : 1)}K`;
  return `AED ${aed.toLocaleString()}`;
}

/** Format a per-month rate in selected currency */
export function formatPricePerUnit(aed: number, unit: "monthly" | "project", currency: Currency): string {
  const label = unit === "monthly" ? "/mo" : "/project";
  return `${formatPrice(aed, currency)}${label}`;
}
