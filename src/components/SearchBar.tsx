// src/components/SearchBar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DEFAULT_ROLES } from "@/lib/roles";

type Props = {
  className?: string;
  onResults?: (payload: unknown) => void;
  onQueryChange?: (query: string) => void;
  onRolesChange?: (roles: string[]) => void;
  onDiscover?: () => void;
};

const MAX_COLLAPSED = 14; // show this many chips before expand

export default function SearchBar({ className, onResults, onQueryChange, onRolesChange, onDiscover }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const roles = DEFAULT_ROLES;

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

  const toggleSelect = (role: string) => {
    setSelected((prev) => {
      const newSelected = prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role];
      onRolesChange?.(newSelected);
      return newSelected;
    });
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
    
    // Note: We don't clear loading state here because:
    // 1. router.push() is asynchronous and navigation happens after this function returns
    // 2. The component will unmount when navigation completes, so the state naturally resets
    // 3. Keeping loading=true ensures the indicator stays visible during navigation
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
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
            {/* Selected chips with removable "×" */}
            {selected.length > 0 && (
              <div className="mb-1 -mt-1 flex flex-wrap gap-1">
                {selected.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-2 text-xs rounded-full bg-white/10 border border-white/10 px-2 py-0.5 text-slate-200"
                  >
                    {r}
                    <button
                      type="button"
                      aria-label={`Remove ${r}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(prev => prev.filter(x => x !== r));
                      }}
                      className="grid place-items-center size-4 rounded-full bg-white/10 hover:bg-white/15 text-slate-200/90 leading-none"
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
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
              placeholder="Short description of your campaign brief & talent"
              className="w-full bg-transparent outline-none text-slate-200 placeholder:text-slate-400/40 text-[15px] leading-8"
            />
          </div>

          {/* Horizontal dropdown; width equals input wrapper */}
          {open && (
            <div
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-white/10 bg-[rgba(9,12,16,0.96)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md"
            >
              <div className="p-3">
                <div className="flex flex-wrap gap-2">
                  {visibleRoles.map((role) => {
                    const active = selected.includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => toggleSelect(role)}
                        className={[
                          "px-3 py-1 rounded-full text-sm transition",
                          active
                            ? "bg-white/10 text-slate-100 border border-white/20"
                            : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10",
                        ].join(" ")}
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

        {/* Circle logo 'Go' button */}
        <button
          onClick={onSubmit}
          className="relative inline-grid place-items-center h-11 w-11 rounded-full bg-[#0F141A] ring-1 ring-white/10 hover:ring-white/20 transition"
          aria-label="Search"
        >
          {/* Loading ring */}
          {loading && (
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-white/15 border-t-white/50"></span>
          )}
          <Image
            src="/logo.svg"
            alt="Go"
            width={22}
            height={22}
            className={`transition ${loading ? "opacity-60" : "opacity-90"}`}
            priority
          />
        </button>

        {/* Discover CTA */}
        <button
          onClick={() => {
            if (onDiscover) {
              onSubmit();
            } else {
              router.push('/discovery');
            }
          }}
          className="rounded-full bg-white/5 border border-white/10 px-4 h-11 text-[14px] text-slate-200 hover:bg-white/10 transition"
        >
          Discover
        </button>
      </div>
    </div>
  );
}
