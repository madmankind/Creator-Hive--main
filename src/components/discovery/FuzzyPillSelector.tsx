"use client";

import { useState, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface FuzzyPillSelectorProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxSelect?: number;
  allowCustom?: boolean; // show "Other" input
  size?: "sm" | "md";
  label?: string;
  hint?: string;
}

export function FuzzyPillSelector({
  options,
  selected,
  onChange,
  placeholder = "Search…",
  maxSelect,
  allowCustom = false,
  size = "md",
  label,
  hint,
}: FuzzyPillSelectorProps) {
  const [query, setQuery] = useState("");
  const [customInput, setCustomInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [query, options]);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      if (maxSelect && selected.length >= maxSelect) return;
      onChange([...selected, opt]);
    }
  };

  const addCustom = () => {
    const val = customInput.trim();
    if (!val || selected.includes(val)) { setCustomInput(""); return; }
    if (maxSelect && selected.length >= maxSelect) return;
    onChange([...selected, val]);
    setCustomInput("");
  };

  const pxLabel = size === "sm" ? "text-[10px]" : "text-[11px]";
  const pxPill  = size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3.5 py-2 text-[12px]";

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-baseline gap-2">
          <span className={cn("uppercase tracking-[0.12em] font-semibold text-white/28", pxLabel)}>{label}</span>
          {hint && <span className={cn("text-white/22", pxLabel)}>{hint}</span>}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] pl-7 pr-3 py-2 text-[12px] text-white/80 placeholder:text-white/25 outline-none focus:ring-white/20 transition"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50">
            <X size={11} />
          </button>
        )}
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
        {/* Selected first */}
        {selected.map((s) => (
          <button key={s} type="button" onClick={() => toggle(s)}
            className={cn("rounded-full transition-all duration-150 flex items-center gap-1", pxPill,
              "bg-white text-black font-medium"
            )}>
            {s} <X size={9} className="opacity-60" />
          </button>
        ))}
        {/* Unselected filtered */}
        {filtered.filter((o) => !selected.includes(o)).map((opt) => {
          const maxed = maxSelect ? selected.length >= maxSelect : false;
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)} disabled={maxed}
              className={cn("rounded-full transition-all duration-150", pxPill,
                maxed
                  ? "bg-white/[0.02] text-white/20 cursor-not-allowed opacity-40 ring-1 ring-white/[0.04]"
                  : "bg-white/[0.04] text-white/40 ring-1 ring-white/[0.06] hover:bg-white/[0.08]"
              )}>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Custom "Other" input */}
      {allowCustom && (
        <div className="flex gap-2 mt-1">
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
            placeholder="Add your own role… press Enter"
            className="flex-1 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] px-3 py-2 text-[12px] text-white/80 placeholder:text-white/22 outline-none focus:ring-white/18 transition"
          />
          {customInput.trim() && (
            <button type="button" onClick={addCustom}
              className="px-3 py-2 rounded-xl bg-white/[0.08] text-white/60 text-[12px] hover:bg-white/[0.12] transition">
              Add
            </button>
          )}
        </div>
      )}
    </div>
  );
}
