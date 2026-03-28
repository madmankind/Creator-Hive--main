"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Fuse from "fuse.js";
import { TALENT_ROLE_CATALOG } from "@/lib/talentRoleCatalog";
import { cn } from "@/lib/utils";

const fuse = new Fuse(TALENT_ROLE_CATALOG, {
  threshold: 0.38,
  includeScore: true,
  ignoreLocation: true,
});

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
  min?: number;
  /** Show 1. 2. 3. on pills (ordered picks) */
  ordered?: boolean;
  quickChips?: readonly string[];
  placeholder?: string;
};

export function RoleFuzzyMultiPicker({
  value,
  onChange,
  max,
  min: _min = 1,
  ordered = false,
  quickChips = [],
  placeholder = "Search roles or type a custom title…",
}: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const t = q.trim();
    if (t.length < 1) return TALENT_ROLE_CATALOG.slice(0, 12);
    return fuse.search(t, { limit: 10 }).map((r) => r.item);
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const addRole = useCallback(
    (raw: string) => {
      const label = raw.trim();
      if (!label) return;
      const exists = value.some((v) => v.toLowerCase() === label.toLowerCase());
      if (exists) return;
      if (value.length >= max) return;
      onChange([...value, label]);
      setQ("");
      setOpen(false);
    },
    [value, max, onChange],
  );

  const removeAt = (i: number) => {
    onChange(value.filter((_, j) => j !== i));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const t = q.trim();
      if (t) addRole(t);
    }
  };

  return (
    <div ref={rootRef} className="space-y-2 w-full">
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((role, i) => (
            <button
              key={`${role}-${i}`}
              type="button"
              onClick={() => removeAt(i)}
              className="rounded-full px-2.5 py-1 text-[10px] transition text-left"
              style={{
                background: "rgba(124,92,255,0.22)",
                border: "1px solid rgba(167,139,250,0.4)",
                color: "rgba(235,230,255,0.95)",
              }}
              title="Tap to remove"
            >
              {ordered ? `${i + 1}. ` : ""}
              {role}
              <span className="ml-1 opacity-50">×</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={!ordered && value.length >= max}
          className="w-full bg-transparent outline-none text-[13px] text-white/80 placeholder:text-white/22 border border-white/[0.1] rounded-xl px-3 py-2"
        />
        {open && suggestions.length > 0 && q.trim().length >= 0 && (
          <ul
            className={cn(
              "absolute z-20 mt-1 max-h-40 overflow-y-auto rounded-xl py-1 w-full",
              "bg-[#0c0c14] border border-white/[0.12] shadow-xl",
            )}
          >
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.06] hover:text-white/90"
                  onClick={() => addRole(s)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {quickChips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {quickChips.map((chip) => {
            const on = value.some((v) => v.toLowerCase() === chip.toLowerCase());
            return (
              <button
                key={chip}
                type="button"
                disabled={!on && value.length >= max && !ordered}
                onClick={() => (on ? removeAt(value.findIndex((v) => v.toLowerCase() === chip.toLowerCase())) : addRole(chip))}
                className="rounded-full px-2.5 py-1 text-[10px] transition disabled:opacity-25"
                style={{
                  background: on ? "rgba(124,92,255,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${on ? "rgba(167,139,250,0.35)" : "rgba(255,255,255,0.09)"}`,
                  color: on ? "rgba(220,210,255,0.9)" : "rgba(255,255,255,0.42)",
                }}
              >
                {chip}
              </button>
            );
          })}
        </div>
      ) : null}

      <p className="text-[10px] text-white/28">
        {ordered
          ? `Pick up to ${max} in order (${value.length}/${max}) — search the full catalog or add your own.`
          : `Select up to ${max} — search the full catalog or add your own.`}
      </p>
    </div>
  );
}
