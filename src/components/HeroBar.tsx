"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { DEFAULT_ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

interface HeroBarProps {
  mode: "client" | "talent";
  onQueryChange?: (q: string) => void;
  onRolesChange?: (roles: string[]) => void;
  onDiscover?: () => void;
  onOpenBriefBuilder?: () => void;
  showClear?: boolean;
  onClear?: () => void;
  /** Called when AI search returns talent IDs to highlight */
  onAIResults?: (ids: string[], summary: string) => void;
}

const MAX_COLLAPSED = 14;
const fuse = new Fuse(DEFAULT_ROLES, {
  threshold: 0.3,
  includeScore: true,
});

export function HeroBar({
  mode,
  onQueryChange,
  onRolesChange,
  onDiscover,
  onOpenBriefBuilder,
  showClear,
  onClear,
  onAIResults,
}: HeroBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { data: session } = useSession();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // AI search state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiActive, setAiActive] = useState(false); // true when AI results are showing

  const suggestions = useMemo(() => {
    if (!query.trim() || mode !== "client") return [];
    const results = fuse.search(query.trim());
    return results.slice(0, 5).map((r) => r.item);
  }, [query, mode]);

  const visibleRoles = useMemo(() => {
    if (mode !== "client" || expanded) return DEFAULT_ROLES;
    return DEFAULT_ROLES.slice(0, MAX_COLLAPSED);
  }, [expanded, mode]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleRoleClick = (role: string) => {
    const next = selected.includes(role)
      ? selected.filter((r) => r !== role)
      : [...selected, role];
    setSelected(next);
    onRolesChange?.(next);
  };

  const handleClientSubmit = () => {
    if (onDiscover) {
      onDiscover();
    }
  };

  const handleAISearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setAiLoading(true);
    setAiError(null);
    setAiSummary(null);
    // Open the gallery first so results appear immediately
    onDiscover?.();
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Fall back to fuzzy search — pass query to carousel
        setAiError(data?.detail ?? "AI search unavailable — showing keyword results");
        onQueryChange?.(q);
        setAiActive(false);
      } else {
        setAiSummary(data.teamSummary ?? null);
        setAiActive(true);
        onAIResults?.(data.talentIds ?? [], data.teamSummary ?? "");
        // Also pass query so carousel text filter still applies as secondary
        onQueryChange?.("");
      }
    } catch {
      setAiError("AI search unavailable — showing keyword results");
      onQueryChange?.(q);
      setAiActive(false);
    } finally {
      setAiLoading(false);
    }
  }, [query, onDiscover, onQueryChange, onAIResults]);

  const handleClearAI = useCallback(() => {
    setAiActive(false);
    setAiSummary(null);
    setAiError(null);
    onAIResults?.([], "");
    onQueryChange?.("");
  }, [onAIResults, onQueryChange]);



  return (
    <motion.div
      layout
      ref={wrapperRef}
      className="flex w-full items-center justify-between"
    >
      <AnimatePresence mode="wait">
        {mode === "client" ? (
          <motion.div
            key="client"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col flex-1 gap-0"
          >
            <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <div
                className="rounded-full bg-[#0D0D14] ring-1 ring-white/10 hover:ring-white/15 transition p-2 pl-5 pr-14"
              >
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
                          "bg-white text-black"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    // Only propagate to fuzzy filter when AI is not active
                    if (!aiActive) onQueryChange?.(e.target.value);
                  }}
                  onFocus={() => setOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAISearch();
                  }}
                  placeholder="Describe your campaign — AI will build your team"
                  className="w-full bg-transparent outline-none text-slate-200 placeholder:text-slate-400/40 text-[15px] leading-8"
                />
              </div>

              {open && (suggestions.length > 0 || visibleRoles.length > 0) && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-white/10 bg-[rgba(9,12,16,0.96)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md">
                  <div className="p-3">
                    {suggestions.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-white/50 mb-2 px-1">Suggestions</div>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => {
                                handleRoleClick(role);
                                setQuery("");
                              }}
                              className={cn(
                                "flex items-center gap-1 rounded-full px-3 py-1 text-[11px]",
                                selected.includes(role)
                                  ? "bg-white text-black"
                                  : "bg-white/5 text-white/70"
                              )}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {visibleRoles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleRoleClick(role)}
                          className={cn(
                            "flex items-center gap-1 rounded-full px-3 py-1 text-[11px]",
                            selected.includes(role)
                              ? "bg-white text-black"
                              : "bg-white/5 text-white/70"
                          )}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-end px-3 pb-3">
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="text-xs text-slate-300/80 hover:text-slate-100 transition"
                    >
                      {expanded ? "Show less" : "Show more"} ▾
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {(showClear || aiActive) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelected([]);
                    setQuery("");
                    onRolesChange?.([]);
                    handleClearAI();
                    onClear?.();
                  }}
                  className="flex items-center gap-1 text-[11px] text-white/45 hover:text-white/70 transition px-2 py-1 rounded-full hover:bg-white/5"
                >
                  <span style={{ fontSize: "10px" }}>✕</span> Clear
                </button>
              ) : selected.length > 0 || query ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelected([]);
                    setQuery("");
                    onRolesChange?.([]);
                    onQueryChange?.("");
                  }}
                  className="text-[11px] text-white/45 hover:text-white/70 transition"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleAISearch}
                disabled={aiLoading}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold transition",
                  aiLoading
                    ? "bg-white/20 text-white/50 cursor-not-allowed"
                    : "bg-white text-black hover:bg-white/90"
                )}
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {aiLoading ? "Searching…" : "Discover"}
              </button>
            </div>
            </div>

          {/* AI summary / error strip — shown below the bar */}
          <AnimatePresence>
            {(aiSummary || aiError) && (
              <motion.div
                key="ai-strip"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "mt-2 flex items-start gap-2 px-4 py-2.5 rounded-2xl text-[12px]",
                  aiSummary
                    ? "bg-purple-500/10 ring-1 ring-purple-400/20 text-purple-200"
                    : "bg-white/[0.04] ring-1 ring-white/[0.08] text-white/45"
                )}
              >
                {aiSummary && <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-400" />}
                <span>{aiSummary ?? aiError}</span>
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="talent"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="flex flex-1 items-center gap-3"
          >
            <div className="rounded-full bg-[#0D0D14] ring-1 ring-white/10 hover:ring-white/15 transition p-2 pl-5 pr-3 flex-1">
              <span className={"w-full block text-[15px] leading-8 " + (session?.user ? "text-slate-200" : "text-slate-400/40")}>
                {session?.user ? "Welcome back" : "Apply to join as a creator or talent"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => session?.user ? router.push("/dashboard/creator") : onDiscover?.()}
              className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition"
            >
              {session?.user ? "Dashboard" : "Continue"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
