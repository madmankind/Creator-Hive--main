"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowUp, Loader2, Plus, X, Sparkles } from "lucide-react";
import { curatedTalent } from "@/lib/curatedTalent";
import { useDiscoveryStore } from "@/store/useDiscoveryStore";

interface HeroBarProps {
  mode: "client" | "talent";
  onQueryChange?: (q: string) => void;
  onRolesChange?: (roles: string[]) => void;
  onDiscover?: () => void;
  showClear?: boolean;
  onClear?: () => void;
  onAIResults?: (ids: string[], summary: string) => void;
  onOpenBriefBuilder?: () => void;
}

const BIZ_TYPES = ["Brand / In-house", "Agency", "Startup / Founder", "Media / Publisher"];

const QUESTIONS = [
  {
    id: "objective",
    prompt: "What are you trying to achieve?",
    chips: ["Campaign launch", "Social growth", "UGC content", "Brand awareness", "Influencer activation"],
  },
  {
    id: "timeline",
    prompt: "When do you need to start?",
    chips: ["ASAP", "Within 2 weeks", "This month", "Next month"],
  },
  {
    id: "budget",
    prompt: "What's your monthly budget range?",
    chips: ["Under AED 15K", "AED 15–25K", "AED 25–45K", "AED 45K+"],
  },
  {
    id: "roles",
    prompt: "What type of talent do you need?",
    chips: ["Videographer", "Content Creator", "Social Media Manager", "Photographer", "Full team"],
  },
];

// ── Talent context for Grok ──────────────────────────────────────────────────
function buildTalentContext(): string {
  return curatedTalent.map((t) => {
    const roles = [t.primaryRole, ...(t.roleTags ?? []).filter(r => r !== t.primaryRole)].join(", ");
    const brands = t.brandPartners?.join(", ") ?? "";
    const er = t.engagementRate ? `${(t.engagementRate * 100).toFixed(1)}% ER` : "";
    const followers = t.followers ? `${(t.followers / 1000).toFixed(0)}K followers` : "";
    const stats = [followers, er].filter(Boolean).join(" · ");
    const showreel = t.featuredVideoUrl ? ` | Showreel: ${t.featuredVideoUrl}` : "";
    const langs = t.languages?.length ? ` | Languages: ${t.languages.join(", ")}` : "";
    return `[${t.id}] ${t.displayName ?? t.name} | ${roles} | ${t.location ?? "UAE"} | ${t.shortBio} | ${t.nicheSummary} | Brands: ${brands} | ${stats} | Archetype: ${t.prismArchetype}${langs}${showreel}`;
  }).join("\n");
}

const TALENT_CONTEXT = buildTalentContext();

function buildSystemPrompt(profile: Record<string, string>): string {
  const summary = Object.entries(profile)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" | ");
  return `You are the Creator Hive media strategist. Creator Hive is a UAE-based premium creative talent marketplace.

CLIENT PROFILE: ${summary}

TALENT ROSTER (${curatedTalent.length} vetted creators):
${TALENT_CONTEXT}

YOUR ROLE: Senior media strategist. You know every creator on this roster. Help brands find the right talent, build campaign strategy, and navigate UAE/GCC content marketing.

STYLE: Conversational and sharp. Reference creators by name. Keep responses to 2–3 sentences unless asked for detail.

TRIGGER TALENT SEARCH: When you have enough context to recommend creators, end your message with this exact JSON (no markdown, nothing after):
{"action":"search","query":"<descriptive search query>","summary":"<one sentence team rationale>"}

NEVER DISCUSS: Internal pricing, margins, fees, competitor platforms, or pending contracts. If asked: "I'm here to find you the right team — let's stay focused on your brief."`;
}

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  talentIds?: string[];
  isLoading?: boolean;
}

// ── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 22) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setOut(""); setDone(false);
    if (!text) { setDone(true); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { out, done };
}

// ── Inline intake bar (questions inside the bar) ─────────────────────────────
function IntakeBar({
  onComplete,
  onSkipToGrok,
  resumeLabel,
}: {
  onComplete: (answers: Record<string, string>, bizType: string) => void;
  onSkipToGrok?: () => void;
  resumeLabel?: string;
}) {
  // phase: "biz" | 0 | 1 | 2 | 3
  const [phase, setPhase] = useState<"biz" | number>("biz");
  const [bizType, setBizType] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQ = typeof phase === "number" ? QUESTIONS[phase] : null;
  const promptText = phase === "biz"
    ? "What type of business are you?"
    : currentQ?.prompt ?? "";
  const chips = phase === "biz" ? BIZ_TYPES : (currentQ?.chips ?? []);
  const { out: typedPrompt, done: promptDone } = useTypewriter(promptText, 20);

  // focus input when prompt finishes
  useEffect(() => {
    if (promptDone) setTimeout(() => inputRef.current?.focus(), 80);
  }, [promptDone, phase]);

  const advance = useCallback((val: string) => {
    if (!val.trim()) return;
    if (phase === "biz") {
      setBizType(val);
      setInputVal("");
      setPhase(0);
      return;
    }
    const q = QUESTIONS[phase as number];
    const next = { ...answers, [q.id]: val };
    setAnswers(next);
    setInputVal("");
    if ((phase as number) < QUESTIONS.length - 1) {
      setPhase((p) => (p as number) + 1);
    } else {
      onComplete(next, bizType);
    }
  }, [phase, answers, bizType, onComplete]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputVal.trim()) { e.preventDefault(); advance(inputVal.trim()); }
  };

  const progress = phase === "biz" ? 0 : ((phase as number) + 1) / QUESTIONS.length;

  return (
    <div className="w-full rounded-2xl transition-all duration-300 overflow-hidden"
      style={{
        background: "rgba(10,10,18,0.92)",
        border: "1px solid rgba(124,92,255,0.30)",
        boxShadow: "0 0 40px rgba(124,92,255,0.12), 0 0 0 1px rgba(124,92,255,0.08)",
      }}>

      {/* Progress bar — top edge */}
      <div className="h-[2px] w-full" style={{ background: "rgba(255,255,255,0.05)" }}>
        <motion.div className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, rgba(124,92,255,0.8), rgba(93,208,255,0.7))" }}
          animate={{ width: `${Math.max(progress * 100, phase === "biz" ? 4 : 8)}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }} />
      </div>

      <div className="px-5 pt-4 pb-3 space-y-3">
        {/* Glowing question — typewriter, inside the bar */}
        <AnimatePresence mode="wait">
          <motion.div key={String(phase)}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-start gap-2">
              <Sparkles size={12} className="text-purple-400/70 mt-1 shrink-0" />
              <p className="text-[15px] font-semibold leading-snug"
                style={{
                  color: "rgba(255,255,255,0.92)",
                  textShadow: "0 0 20px rgba(167,139,250,0.60)",
                  letterSpacing: "-0.01em",
                }}>
                {typedPrompt}
                {!promptDone && (
                  <span className="inline-block w-[2px] h-[14px] bg-purple-400/80 animate-pulse ml-0.5 align-middle rounded-full" />
                )}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Input field — appears after prompt finishes */}
        <AnimatePresence>
          {promptDone && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type your answer or pick below…"
                  className="flex-1 bg-transparent outline-none text-[14px] text-white/80 placeholder:text-white/20"
                />
                {inputVal.trim() && (
                  <button type="button" onClick={() => advance(inputVal.trim())}
                    className="flex items-center justify-center w-7 h-7 rounded-xl bg-white text-black shrink-0 transition hover:bg-white/90">
                    <ArrowUp size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick-pick chips — inside bar, small */}
        <AnimatePresence>
          {promptDone && chips.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <button key={chip} type="button" onClick={() => advance(chip)}
                  className="rounded-full px-3 py-1 text-[11px] transition-all duration-100"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(124,92,255,0.15)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,92,255,0.35)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(196,174,255,0.90)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                  }}>
                  {chip}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: skip option for returning users */}
      {resumeLabel && (
        <div className="border-t px-5 py-2.5 flex items-center justify-between"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <span className="text-[11px] text-white/25">Already have a brief?</span>
          <button type="button" onClick={onSkipToGrok}
            className="text-[11px] text-purple-400/60 hover:text-purple-300/80 transition">
            {resumeLabel} →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Grok advisor chat ────────────────────────────────────────────────────────
function AdvisorChat({
  systemPrompt, welcomeMsg, onAIResults, onDiscover, onReset, autoQuery,
}: {
  systemPrompt: string;
  welcomeMsg: string;
  onAIResults?: (ids: string[], summary: string) => void;
  onDiscover?: () => void;
  onReset?: () => void;
  autoQuery?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: welcomeMsg },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const didAutoSearch = useRef(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  const triggerSearch = useCallback(async (query: string, summary: string) => {
    onDiscover?.();
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setMessages(p => [...p, { id: Date.now().toString(), role: "assistant",
          content: data.message ?? "Daily AI search limit reached. Resets at midnight." }]);
        return;
      }
      if (res.ok && data.talentIds?.length) {
        if (data.rateLimit?.remaining !== undefined) setRemaining(data.rateLimit.remaining);
        onAIResults?.(data.talentIds, data.teamSummary ?? summary);
        setMessages(p => [...p, {
          id: Date.now().toString(), role: "assistant",
          content: `Matched ${data.talentIds.length} creators to your brief ↓\n\n${data.teamSummary ?? summary}`,
          talentIds: data.talentIds,
        }]);
      }
    } catch { /* silent */ }
  }, [onDiscover, onAIResults]);

  // Auto-trigger search on load if we have enough context
  useEffect(() => {
    if (!autoQuery || didAutoSearch.current) return;
    didAutoSearch.current = true;
    setTimeout(() => triggerSearch(autoQuery, ""), 900);
  }, [autoQuery, triggerSearch]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(p => [...p,
      { id: Date.now().toString(), role: "user", content: text },
      { id: "loading", role: "assistant", content: "", isLoading: true },
    ]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.filter(m => !m.isLoading).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content: text }], systemPrompt }),
      });
      const data = await res.json();
      const reply: string = data.content ?? "Try again in a moment.";

      // Check for search trigger
      const trimmed = reply.trim();
      if (trimmed.startsWith("{") && trimmed.includes('"action":"search"')) {
        try {
          const parsed = JSON.parse(trimmed) as { action: string; query: string; summary: string };
          if (parsed.action === "search") {
            setMessages(p => p.filter(m => m.id !== "loading"));
            setLoading(false);
            await triggerSearch(parsed.query, parsed.summary);
            return;
          }
        } catch { /* not valid JSON */ }
      }

      if (data.rateLimit?.remaining !== undefined) setRemaining(data.rateLimit.remaining);
      setMessages(p => [
        ...p.filter(m => m.id !== "loading"),
        { id: Date.now().toString(), role: "assistant", content: reply },
      ]);
    } catch {
      setMessages(p => [
        ...p.filter(m => m.id !== "loading"),
        { id: Date.now().toString(), role: "assistant", content: "Connection error — try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, systemPrompt, triggerSearch]);

  return (
    <div className="w-full flex flex-col">
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(10,10,18,0.92)", border: "1px solid rgba(124,92,255,0.22)", boxShadow: "0 0 40px rgba(124,92,255,0.10)" }}>

        {/* Messages */}
        <div className="max-h-64 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.isLoading ? (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
                  style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.15)" }}>
                  <Loader2 size={12} className="animate-spin text-purple-400" />
                  <span className="text-[12px] text-white/35">Thinking…</span>
                </div>
              ) : (
                <div className={cn("max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap",
                  msg.role === "user" ? "bg-white/[0.08] text-white/82" : "text-white/72")}
                  style={msg.role === "assistant" ? {
                    background: "rgba(124,92,255,0.08)",
                    border: "1px solid rgba(124,92,255,0.14)",
                    boxShadow: "0 0 16px rgba(124,92,255,0.07)",
                  } : {}}>
                  {msg.role === "assistant" && <Sparkles size={10} className="inline mr-1.5 text-purple-400/60 mb-0.5" />}
                  {msg.content}
                  {msg.talentIds && <p className="mt-1 text-[10px] text-purple-300/45">{msg.talentIds.length} creators matched ↓</p>}
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t px-4 py-3 flex items-end gap-2" style={{ borderColor: "rgba(124,92,255,0.14)" }}>
          <textarea ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask anything about strategy, talent, or your campaign…"
            rows={1}
            className="flex-1 bg-transparent outline-none text-[13px] text-white/78 placeholder:text-white/20 resize-none leading-relaxed"
            style={{ minHeight: "24px", maxHeight: "100px" }} />
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="cursor-pointer p-1.5 rounded-lg text-white/18 hover:text-white/40 transition" title="Attach brief">
              <Plus size={13} />
              <input type="file" className="hidden" accept=".pdf,.pptx,.docx,.png,.jpg"
                onChange={e => { const f = e.target.files?.[0]; if (f) setInput(p => p ? `${p} [${f.name}]` : `Brief: ${f.name}`); }} />
            </label>
            <button type="button" onClick={send} disabled={!input.trim() || loading}
              className={cn("flex items-center justify-center w-7 h-7 rounded-xl transition-all",
                input.trim() && !loading ? "bg-white text-black" : "bg-white/[0.05] text-white/18 cursor-not-allowed")}>
              {loading ? <Loader2 size={12} className="animate-spin" /> : <ArrowUp size={12} />}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 px-1">
        {remaining !== null ? (
          <p className="text-[10px] text-white/18 tabular-nums">
            {remaining > 0 ? `${remaining} queries left today` : "Daily limit reached"}
          </p>
        ) : <span />}
        <button type="button" onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-white/22 hover:text-white/45 transition">
          <X size={10} /> New brief
        </button>
      </div>
    </div>
  );
}

// ── Main HeroBar ─────────────────────────────────────────────────────────────
export function HeroBar({
  mode, onQueryChange, onDiscover, showClear, onClear, onAIResults,
}: HeroBarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const store = useDiscoveryStore();

  // track: "intake" | "returning-new" | "returning-resume" | "activated"
  type Track = "intake" | "returning-new" | "returning-resume" | "activated";
  const [track, setTrack] = useState<Track | null>(null);
  const [profile, setProfile] = useState<Record<string, string>>({});

  // Determine track on mount once session is known
  useEffect(() => {
    if (!session?.user) return;
    if (track !== null) return;

    if (!store.completed) {
      // Brand new user — full intake
      setTrack("intake");
    } else {
      // Returning user — check if they have a previous brief
      const hasBrief = store.primaryObjective || store.requestedRoles.length > 0;
      setTrack(hasBrief ? "returning-resume" : "returning-new");
    }
  }, [session, store, track]);

  // For non-logged-in: show intake
  useEffect(() => {
    if (!session?.user && track === null) setTrack("intake");
  }, [session, track]);

  const handleIntakeComplete = useCallback((answers: Record<string, string>, bizType: string) => {
    const fullProfile: Record<string, string> = {
      businessType: bizType,
      objective: answers.objective ?? "",
      timeline: answers.timeline ?? "",
      budget: answers.budget ?? "",
      roles: answers.roles ?? "",
    };
    setProfile(fullProfile);
    // Save to discovery store
    fetch("/api/discovery/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primaryObjective: answers.objective ?? "",
        requestedRoles: answers.roles ? [answers.roles] : [],
        startTiming: answers.timeline ?? "",
        budgetRange: answers.budget ?? "",
        currentStep: 3, completed: true,
      }),
    }).catch(() => {});
    setTrack("activated");
  }, []);

  const handleReset = useCallback(() => {
    setTrack("intake");
    setProfile({});
    onAIResults?.([], "");
    onQueryChange?.("");
    onClear?.();
  }, [onAIResults, onQueryChange, onClear]);

  const buildReturningProfile = useCallback((): Record<string, string> => ({
    businessType: "",
    objective: store.primaryObjective,
    timeline: store.startTiming,
    budget: store.budgetRange,
    roles: store.requestedRoles.join(", "),
    company: store.companyName,
    industry: store.industry,
  }), [store]);

  if (mode === "talent") {
    return (
      <div className="flex flex-1 items-center gap-3">
        <div className="rounded-full bg-[#0D0D14] ring-1 ring-white/10 p-2 pl-5 pr-3 flex-1">
          <span className={cn("block text-[15px] leading-8", session?.user ? "text-slate-200" : "text-slate-400/40")}>
            {session?.user ? "Welcome back" : "Apply to join as a creator or talent"}
          </span>
        </div>
        <button type="button"
          onClick={() => session?.user ? router.push("/dashboard/creator") : onDiscover?.()}
          className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition">
          {session?.user ? "Dashboard" : "Continue"}
        </button>
      </div>
    );
  }

  // Not yet determined
  if (track === null) return (
    <div className="w-full h-14 rounded-2xl animate-pulse"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }} />
  );

  return (
    <AnimatePresence mode="wait">
      {/* TRACK A — New user: full intake inside the bar */}
      {track === "intake" && (
        <motion.div key="intake" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }} className="w-full">
          <IntakeBar
            onComplete={handleIntakeComplete}
            onSkipToGrok={store.completed ? () => { setProfile(buildReturningProfile()); setTrack("activated"); } : undefined}
            resumeLabel={store.completed ? "Skip to advisor" : undefined}
          />
        </motion.div>
      )}

      {/* TRACK B — Returning, new campaign: single warm prompt */}
      {track === "returning-new" && (
        <motion.div key="returning-new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full">
          <IntakeBar
            onComplete={handleIntakeComplete}
            onSkipToGrok={() => { setProfile(buildReturningProfile()); setTrack("activated"); }}
            resumeLabel="Skip questions"
          />
        </motion.div>
      )}

      {/* TRACK C — Returning, resume last brief */}
      {track === "returning-resume" && (
        <motion.div key="returning-resume" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full">
          <div className="rounded-2xl px-5 py-4 space-y-3"
            style={{ background: "rgba(10,10,18,0.92)", border: "1px solid rgba(124,92,255,0.22)", boxShadow: "0 0 40px rgba(124,92,255,0.10)" }}>
            <div className="flex items-start gap-2">
              <Sparkles size={12} className="text-purple-400/70 mt-0.5 shrink-0" />
              <p className="text-[15px] font-semibold leading-snug"
                style={{ color: "rgba(255,255,255,0.90)", textShadow: "0 0 20px rgba(167,139,250,0.55)" }}>
                Last time you were looking for{" "}
                <span style={{ color: "rgba(196,174,255,0.90)" }}>
                  {store.requestedRoles.slice(0, 2).join(" & ") || store.primaryObjective || "creative talent"}
                </span>
                {" "}— picking up from there, or something new?
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => { setProfile(buildReturningProfile()); setTrack("activated"); }}
                className="rounded-full px-4 py-2 text-[12px] font-medium transition-all"
                style={{ background: "rgba(124,92,255,0.18)", border: "1px solid rgba(124,92,255,0.35)", color: "rgba(196,174,255,0.90)" }}>
                Continue last brief
              </button>
              <button type="button"
                onClick={() => setTrack("intake")}
                className="rounded-full px-4 py-2 text-[12px] transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.45)" }}>
                Start fresh
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ACTIVATED — Grok advisor */}
      {track === "activated" && (
        <motion.div key="activated" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full">
          <AdvisorChat
            systemPrompt={buildSystemPrompt(profile)}
            welcomeMsg={
              profile.objective
                ? `Got it — ${profile.businessType ? profile.businessType + ", " : ""}${profile.objective}, ${profile.timeline ? profile.timeline + ", " : ""}${profile.budget || ""}. Let me find your team.`
                : `Welcome back. Your last brief is loaded — what would you like to explore?`
            }
            autoQuery={[profile.roles, profile.objective].filter(Boolean).join(" ")}
            onAIResults={onAIResults}
            onDiscover={onDiscover}
            onReset={handleReset}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
