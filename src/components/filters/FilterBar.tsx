"use client";
import { useFilters, Role } from "@/store/useFilters";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const ROLES: Role[] = ["Photographer", "Motion Designer", "UGC Creator", "Art Director"];

export function FilterBar() {
  const { query, roles, minRate, maxRate, availability, setQuery, toggleRole, setAvailability, clear } = useFilters();
  const count = useMemo(() => roles.length + (minRate || maxRate ? 1 : 0) + (availability ? 1 : 0) + (query ? 1 : 0), [roles, minRate, maxRate, availability, query]);

  return (
    <div className={cn("sticky top-16 z-40 glass border-b border-[color:var(--color-border)]")}> {/* under header */}
      <div className="container py-3 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators, skills, tools..."
          className="w-full md:w-72 h-9 px-3 rounded-md bg-[color:var(--muted)] border border-[color:var(--color-border)] focus-ring"
        />
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => toggleRole(r)}
              className={cn(
                "px-3 h-8 rounded-full text-sm transition-colors",
                roles.includes(r) ? "bg-[color:var(--color-accent)]/20 text-[color:var(--color-accent)]" : "bg-[color:var(--muted)] text-[color:var(--text-secondary)]"
              )}
              aria-pressed={roles.includes(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select value={availability || ""} onChange={(e) => setAvailability((e.target.value || undefined) as "Open" | "Limited" | "Booked" | undefined)} className="h-9 px-2 rounded-md bg-[color:var(--muted)] border border-[color:var(--color-border)]">
            <option value="">Availability</option>
            <option>Open</option>
            <option>Limited</option>
            <option>Booked</option>
          </select>
          <button onClick={clear} className="h-9 px-3 rounded-md bg-[color:var(--muted)] text-[color:var(--text-secondary)]">
            Clear {count ? `(${count})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

