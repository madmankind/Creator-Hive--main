"use client";

import { useCurrencyStore } from "@/store/useCurrencyStore";

export function CurrencyToggle({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <div
      className="flex items-center rounded-full p-0.5 flex-shrink-0"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {(["AED", "USD"] as const).map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className="rounded-full transition-all font-medium"
          style={{
            padding: compact ? "4px 8px" : "5px 10px",
            fontSize: compact ? "10px" : "11px",
            background: currency === c ? "rgba(255,255,255,0.10)" : "transparent",
            color: currency === c ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.35)",
            fontWeight: currency === c ? 600 : 400,
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
