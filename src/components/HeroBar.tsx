"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { DEFAULT_ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface HeroBarProps {
  mode: "client" | "talent";
  onQueryChange?: (q: string) => void;
  onRolesChange?: (roles: string[]) => void;
  onDiscover?: () => void;
  onOpenBriefBuilder?: () => void;
}

const MAX_COLLAPSED = 14;
const fuse = new Fuse(DEFAULT_ROLES, {
  threshold: 0.3,
  includeScore: true,
});

const freeEmailDomains = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "icloud.com", "protonmail.com", "mail.com", "gmx.com", "yandex.com"
];

export function HeroBar({
  mode,
  onQueryChange,
  onRolesChange,
  onDiscover,
  onOpenBriefBuilder,
}: HeroBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { data: session } = useSession();
  
  // Talent mode state
  const [talentStep, setTalentStep] = useState<"idle" | "email" | "submitting" | "success">("idle");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const validateEmail = (email: string): string | null => {
    const domain = email.split("@")[1];
    if (!domain) return "Invalid email format";
    if (freeEmailDomains.includes(domain.toLowerCase())) {
      return "Please use your work email";
    }
    return null;
  };

  const handleTalentSubmit = async () => {
    setError("");
    if (!contact.trim()) {
      setError("Please enter your email");
      return;
    }
    const err = validateEmail(contact.trim());
    if (err) {
      setError(err);
      return;
    }
    setSubmitting(true);
    setTalentStep("submitting");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: contact.trim(),
        userType: "talent",
      });
      if (result?.error) {
        setError(result.error);
        setTalentStep("email");
        setSubmitting(false);
        return;
      }
      setTalentStep("success");
      setSubmitting(false);
      setTimeout(() => {
        router.push("/onboarding/step-1");
      }, 650);
    } catch (error) {
      console.error("Talent apply error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      layout
      ref={wrapperRef}
      className="flex w-full items-center justify-between rounded-full bg-neutral-900/60 px-3 py-2 shadow-lg shadow-black/40 backdrop-blur"
    >
      <AnimatePresence mode="wait">
        {mode === "client" ? (
          <motion.div
            key="client"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="flex flex-1 items-center gap-3"
          >
            <div className="relative flex-1">
              <div
                className="rounded-full bg-[#0F141A] ring-1 ring-white/10 hover:ring-white/20 transition p-2 pl-5 pr-14"
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
                    onQueryChange?.(e.target.value);
                  }}
                  onFocus={() => setOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleClientSubmit();
                  }}
                  placeholder="Search for talent type (e.g., UGC creator, growth strategist)"
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
              {selected.length > 0 && (
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
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={onOpenBriefBuilder}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 transition"
              >
                <span className="text-white/80 text-lg leading-none">+</span>
              </button>
              <button
                type="button"
                onClick={handleClientSubmit}
                className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition"
              >
                Discover
              </button>
            </div>
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
            <AnimatePresence mode="wait">
              {talentStep === "idle" && (
                <motion.div
                  key="talent-idle"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex w-full items-center justify-between rounded-full bg-[rgba(255,255,255,0.06)] border border-white/10 px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-white">Apply to join</div>
                    <div className="text-[12px] text-white/60">Stay in-flow. No popups.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (session?.user) {
                        setTalentStep("success");
                        setTimeout(() => router.push("/onboarding/step-1"), 400);
                        return;
                      }
                      setTalentStep("email");
                      requestAnimationFrame(() => emailInputRef.current?.focus());
                    }}
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90 transition"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {talentStep === "email" && (
                <motion.div
                  key="talent-email"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex w-full flex-col gap-2"
                >
                  <div className="flex items-center gap-3 rounded-full bg-[rgba(255,255,255,0.06)] border border-white/10 px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                    <div className="text-[12px] text-white/60 flex-shrink-0">Account email</div>
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTalentSubmit();
                        if (e.key === "Escape") setTalentStep("idle");
                      }}
                      placeholder="work@company.com"
                      className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleTalentSubmit}
                      disabled={!contact.trim() || submitting}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition disabled:opacity-50"
                    >
                      →
                    </button>
                  </div>
                  {error && <div className="text-[11px] text-red-400 px-1">{error}</div>}
                  <div className="text-[12px] text-white/50 px-1">
                    <button
                      type="button"
                      className="underline decoration-dashed decoration-white/40 text-white/70 cursor-not-allowed"
                      title="Google login coming soon"
                    >
                      Sign up with Google (coming soon)
                    </button>
                  </div>
                </motion.div>
              )}

              {talentStep === "submitting" && (
                <motion.div
                  key="talent-submitting"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex w-full items-center justify-between rounded-full bg-[rgba(255,255,255,0.06)] border border-white/10 px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                >
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-white">Signing you in…</div>
                    <div className="text-[12px] text-white/60 truncate">Please wait while we prepare your workspace.</div>
                  </div>
                  <div className="h-3 w-3 animate-pulse rounded-full bg-white/70" />
                </motion.div>
              )}

              {talentStep === "success" && (
                <motion.div
                  key="talent-success"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex w-full items-center justify-between rounded-full bg-[rgba(255,255,255,0.06)] border border-white/10 px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                >
                  <div className="text-[14px] font-semibold text-white">You&apos;re in.</div>
                  <button
                    type="button"
                    onClick={() => router.push("/onboarding/step-1")}
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90 transition"
                  >
                    Continue application
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
