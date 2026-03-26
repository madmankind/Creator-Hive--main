"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

const INDUSTRY_COLORS: Record<string, string> = {
  "F&B":                   "rgba(251,146,60,",
  "Beauty":                "rgba(244,114,182,",
  "Fashion":               "rgba(167,139,250,",
  "Hospitality":           "rgba(251,191,36,",
  "Real estate":           "rgba(96,165,250,",
  "Consumer & retail":     "rgba(52,211,153,",
  "Tech":                  "rgba(34,211,238,",
  "Health & wellness":     "rgba(74,222,128,",
  "Automotive":            "rgba(148,163,184,",
  "Entertainment":         "rgba(232,121,249,",
  "Finance":               "rgba(99,102,241,",
  "Gaming":                "rgba(124,92,255,",
  "Sports":                "rgba(251,113,133,",
  "Education":             "rgba(45,212,191,",
  "Travel & tourism":      "rgba(56,189,248,",
  "Sustainability":        "rgba(134,239,172,",
  "Media & publishing":    "rgba(249,168,212,",
  "Social media":          "rgba(155,127,255,",
  "Creator economy":       "rgba(251,176,36,",
  "Influencer marketing":  "rgba(196,174,255,",
  "Digital marketing":     "rgba(103,232,249,",
  "Advertising":           "rgba(248,113,113,",
  "E-commerce":            "rgba(52,211,153,",
  "Government":            "rgba(148,163,184,",
  "NGO / Non-profit":      "rgba(134,239,172,",
  "Other":                 "rgba(255,255,255,",
};

export const ALL_INDUSTRIES = Object.keys(INDUSTRY_COLORS);

interface IndustrySelectorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function IndustrySelector({ value, onChange, placeholder = "Select industry" }: IndustrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_INDUSTRIES;
    const q = query.toLowerCase();
    return ALL_INDUSTRIES.filter((i) => i.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const color = value ? INDUSTRY_COLORS[value] ?? "rgba(255,255,255," : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] transition-all"
        style={{
          background: color ? `${color}0.08)` : "rgba(255,255,255,0.04)",
          border: `1px solid ${color ? `${color}0.30)` : "rgba(255,255,255,0.09)"}`,
          color: color ? `${color}0.90)` : "rgba(255,255,255,0.45)",
        }}
      >
        <span>{value || placeholder}</span>
        <div className="flex items-center gap-1.5">
          {value && (
            <span onClick={(e) => { e.stopPropagation(); onChange(""); setQuery(""); }}
              className="hover:opacity-70 transition">
              <X size={11} />
            </span>
          )}
          <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-xl overflow-hidden shadow-2xl"
          style={{ background: "rgba(14,14,22,0.98)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(20px)" }}>
          {/* Search */}
          <div className="p-2 border-b border-white/[0.07]">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search industries…"
                className="w-full bg-white/[0.04] rounded-lg pl-7 pr-3 py-1.5 text-[12px] text-white/75 placeholder:text-white/22 outline-none"
              />
            </div>
          </div>
          {/* Options */}
          <div className="overflow-y-auto max-h-52 p-1.5">
            {filtered.map((ind) => {
              const c = INDUSTRY_COLORS[ind] ?? "rgba(255,255,255,";
              const active = value === ind;
              return (
                <button key={ind} type="button"
                  onClick={() => { onChange(ind); setOpen(false); setQuery(""); }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all"
                  style={{
                    background: active ? `${c}0.12)` : "transparent",
                    color: active ? `${c}0.90)` : "rgba(255,255,255,0.55)",
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = `${c}0.07)`; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: `${c}0.70)` }} />
                  {ind}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-[12px] text-white/25">No match — try a different term</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
