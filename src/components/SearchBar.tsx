// src/components/SearchBar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Fuse from "fuse.js";
import { DEFAULT_ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  onResults?: (payload: unknown) => void;
  onQueryChange?: (query: string) => void;
  onRolesChange?: (roles: string[]) => void;
  onDiscover?: () => void;
  onOpenBriefBuilder?: () => void;
};

const MAX_COLLAPSED = 14; // show this many chips before expand

// Configure Fuse.js for fuzzy search
const fuse = new Fuse(DEFAULT_ROLES, {
  threshold: 0.3, // Lower = more strict matching
  includeScore: true,
});

export default function SearchBar({ 
  className, 
  onResults, 
  onQueryChange, 
  onRolesChange, 
  onDiscover,
  onOpenBriefBuilder,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const roles = DEFAULT_ROLES;

  // Fuzzy search suggestions based on query
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const results = fuse.search(query.trim());
    return results.slice(0, 5).map((result) => result.item);
  }, [query]);

  const visibleRoles = useMemo(() => {
    if (expanded) return roles;
    return roles.slice(0, MAX_COLLAPSED);
  }, [roles, expanded]);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleRoleClick = (role: string) => {
    setSelected((prev) => {
      const exists = prev.includes(role);
      const next = exists ? prev.filter((r) => r !== role) : [...prev, role];
      onRolesChange?.(next);
      return next;
    });
  };

  const handleClearAll = () => {
    setSelected([]);
    setQuery("");
    onRolesChange?.([]);
    onQueryChange?.("");
  };

  const onSubmit = async () => {
    if (loading) return;
    
    // Check if we have either a query or selected roles
    if (!query.trim() && selected.length === 0) {
      alert("Please enter a campaign brief or select talent roles to search.");
      return;
    }
    
    setLoading(true);
    setOpen(false);
    
    // If onDiscover callback is provided, use it (for talent gallery)
    if (onDiscover) {
      onDiscover();
      setLoading(false);
      return;
    }
    
    // Otherwise, navigate to results page with search params
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selected.length > 0) params.set("roles", selected.join(","));
    
    // Navigate - loading state will persist until component unmounts on navigation
    router.push(`/results?${params.toString()}`);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

  const handlePlusClick = () => {
    // Open brief builder instead of adding role
    onOpenBriefBuilder?.();
  };

  return (
    <div
      ref={wrapperRef}
      className={`w-full ${className ?? ""}`}
    >
      <div className="relative flex items-center gap-3">
        {/* Input */}
        <div className="relative flex-1">
          <div
            className="rounded-full bg-[#0F141A] ring-1 ring-white/10 hover:ring-white/20 transition p-2 pl-5 pr-14"
          >
            {/* Selected chips - click to toggle off */}
            {selected.length > 0 && (
              <div className="mb-1 -mt-1 flex flex-wrap gap-1">
                {selected.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleClick(r);
                    }}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1 text-[11px]",
                      selected.includes(r)
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/70"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onQueryChange?.(e.target.value);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKey}
              placeholder="Search for talent type (e.g., UGC creator, growth strategist)"
              className="w-full bg-transparent outline-none text-slate-200 placeholder:text-slate-400/40 text-[15px] leading-8"
            />
          </div>

          {/* Suggestions dropdown */}
          {open && (suggestions.length > 0 || visibleRoles.length > 0) && (
            <div
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-white/10 bg-[rgba(9,12,16,0.96)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md"
            >
              <div className="p-3">
                {/* Fuzzy search suggestions */}
                {suggestions.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-white/50 mb-2 px-1">Suggestions</div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((role) => {
                        const active = selected.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              handleRoleClick(role);
                              setQuery("");
                            }}
                            className={cn(
                              "flex items-center gap-1 rounded-full px-3 py-1 text-[11px]",
                              active
                                ? "bg-white text-black"
                                : "bg-white/5 text-white/70"
                            )}
                          >
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All roles */}
                <div className="flex flex-wrap gap-2">
                  {visibleRoles.map((role) => {
                    const active = selected.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleClick(role)}
                        className={cn(
                          "flex items-center gap-1 rounded-full px-3 py-1 text-[11px]",
                          active
                            ? "bg-white text-black"
                            : "bg-white/5 text-white/70"
                        )}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer row with expand/collapse chevron */}
              <div className="flex items-center justify-end px-3 pb-3">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="group flex items-center gap-2 text-xs text-slate-300/80 hover:text-slate-100 transition"
                  aria-label={expanded ? "Collapse" : "Expand"}
                >
                  {expanded ? "Show less" : "Show more"}
                  <span
                    className={[
                      "inline-block transition-transform",
                      expanded ? "rotate-180" : "",
                    ].join(" ")}
                  >
                    ▾
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-white/45 hover:text-white/70 transition"
            >
              Clear all
            </button>
          )}

          {/* Plus opens brief builder */}
          <button
            type="button"
            onClick={handlePlusClick}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 transition"
            aria-label="Help me pick talent"
          >
            <span className="text-white/80 text-lg leading-none">+</span>
          </button>

          {/* Discover CTA */}
          <button
            type="button"
            onClick={() => {
              if (onDiscover) {
                onSubmit();
              } else {
                router.push('/discovery');
              }
            }}
            className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition"
          >
            Discover
          </button>
        </div>
      </div>
    </div>
  );
}
