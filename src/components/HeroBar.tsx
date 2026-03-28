"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowUp, Loader2, Plus, X, Sparkles } from "lucide-react";
import { curatedTalent } from "@/lib/curatedTalent";
import { useDiscoveryStore } from "@/store/useDiscoveryStore";

import {
  TALENT_COACH_SEQUENTIAL_STEPS,
  TALENT_CREATOR_TYPES,
  TALENT_INTAKE_NAME_QUESTIONS,
  TALENT_INTAKE_QUESTIONS,
  draftToProfileBody,
} from "@/lib/heroTalentIntake";
import { TALENT_ROLE_CATALOG } from "@/lib/talentRoleCatalog";
import {
  ARCHETYPE_PUBLIC_BLURB,
  type CreatorHiveArchetypeLabel,
} from "@/lib/talent-onboarding/prismPlaybook";

interface HeroBarProps {
  mode: "client" | "talent";
  onQueryChange?: (q: string) => void;
  onRolesChange?: (roles: string[]) => void;
  onDiscover?: () => void;
  showClear?: boolean;
  onClear?: () => void;
  onAIResults?: (ids: string[], summary: string) => void;
  onOpenBriefBuilder?: () => void;
  /** After profile save from hero talent flow */
  onTalentProfileSaved?: () => void;
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
    if (speed <= 0) {
      setOut(text);
      setDone(true);
      return;
    }
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

function openAdvisorBookingLink(): void {
  const url = (process.env.NEXT_PUBLIC_ADVISOR_BOOKING_URL ?? "").trim();
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  window.location.href =
    "mailto:ajil@creatorhive.ae?subject=" +
    encodeURIComponent("Schedule a call — Creator Hive") +
    "&body=" +
    encodeURIComponent("Hi Ajil — I'd like to schedule a short call to discuss a campaign.\n\n");
}

// ── Inline intake bar (questions inside the bar) ─────────────────────────────
function IntakeBar({
  onComplete,
  showSkipQuestions,
  onSkipToGrok,
  onScheduleAdvisor,
  onBriefFile,
  uploadBusy,
  uploadError,
}: {
  onComplete: (answers: Record<string, string>, bizType: string) => void;
  showSkipQuestions?: boolean;
  onSkipToGrok?: () => void;
  onScheduleAdvisor?: () => void;
  onBriefFile?: (file: File) => void;
  uploadBusy?: boolean;
  uploadError?: string | null;
}) {
  // phase: "biz" | 0 | 1 | 2 | 3
  const [phase, setPhase] = useState<"biz" | number>("biz");
  const [bizType, setBizType] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const briefFileRef = useRef<HTMLInputElement>(null);

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

      {/* Bottom: brief upload + schedule + optional skip to chat */}
      <div
        className="border-t px-5 py-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <input
            ref={briefFileRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f && onBriefFile) onBriefFile(f);
            }}
          />
          {onBriefFile ? (
            <button
              type="button"
              disabled={uploadBusy}
              onClick={() => briefFileRef.current?.click()}
              className="text-[11px] text-purple-400/60 hover:text-purple-300/80 transition disabled:opacity-40 text-left"
            >
              {uploadBusy ? "Reading your brief…" : "Upload brief →"}
            </button>
          ) : null}
          {uploadError ? (
            <span className="text-[10px] text-rose-300/85 max-w-[200px] leading-snug">{uploadError}</span>
          ) : (
            onBriefFile && (
              <span className="text-[10px] text-white/22 hidden sm:inline">PDF, DOCX, or TXT</span>
            )
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onScheduleAdvisor ? (
            <button
              type="button"
              onClick={onScheduleAdvisor}
              className="text-[11px] text-white/38 hover:text-white/62 transition"
            >
              Schedule with advisor →
            </button>
          ) : null}
          {showSkipQuestions && onSkipToGrok ? (
            <button
              type="button"
              onClick={onSkipToGrok}
              className="text-[11px] text-purple-400/60 hover:text-purple-300/80 transition"
            >
              Skip questions →
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Grok advisor chat ────────────────────────────────────────────────────────
function AdvisorChat({
  systemPrompt,
  welcomeMsg,
  onAIResults,
  onDiscover,
  onReset,
  autoQuery,
  onBriefFile,
}: {
  systemPrompt: string;
  welcomeMsg: string;
  onAIResults?: (ids: string[], summary: string) => void;
  onDiscover?: () => void;
  onReset?: () => void;
  autoQuery?: string;
  onBriefFile?: (file: File) => void;
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
            <label className="cursor-pointer p-1.5 rounded-lg text-white/18 hover:text-white/40 transition" title="Upload brief file">
              <Plus size={13} />
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  if (onBriefFile) onBriefFile(f);
                  else setInput((p) => (p ? `${p} [${f.name}]` : `Brief: ${f.name}`));
                }}
              />
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

// ── Talent intake (same shell as IntakeBar, talent prompts) ─────────────────
type TalentIntakePhase = number | "ct";

function talentProgressIndex(phase: TalentIntakePhase): number {
  if (phase === "ct") return 3;
  if (typeof phase === "number") {
    if (phase < 3) return phase;
    return 4 + (phase - 3);
  }
  return 0;
}

const TALENT_INTAKE_TOTAL_STEPS = 3 + 1 + TALENT_INTAKE_QUESTIONS.length;

function TalentIntakeBar({ onComplete }: { onComplete: (draft: Record<string, string>) => void }) {
  const [phase, setPhase] = useState<TalentIntakePhase>(0);
  const [creatorType, setCreatorType] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputVal, setInputVal] = useState("");
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const roleFuse = useMemo(
    () =>
      new Fuse(TALENT_ROLE_CATALOG, {
        threshold: 0.34,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [],
  );

  const roleSuggestions = useMemo(() => {
    const q = inputVal.trim();
    if (q.length < 1) return [];
    return roleFuse.search(q).slice(0, 8).map((r) => r.item);
  }, [inputVal, roleFuse]);

  const nameQ =
    typeof phase === "number" && phase < 3 ? TALENT_INTAKE_NAME_QUESTIONS[phase] : null;
  const tailQ =
    typeof phase === "number" && phase >= 3 ? TALENT_INTAKE_QUESTIONS[phase - 3] : null;

  const promptText =
    phase === "ct"
      ? "How do you usually work?"
      : nameQ?.prompt ?? tailQ?.prompt ?? "";
  const chips: string[] =
    phase === "ct"
      ? [...TALENT_CREATOR_TYPES]
      : tailQ && !tailQ.rolePicker
        ? [...tailQ.chips]
        : [];

  const isRolePicker = Boolean(tailQ?.rolePicker);
  const isMultiStep = Boolean(tailQ?.multiSelect);
  const multiMax = tailQ?.multiSelect?.max ?? 2;

  const { out: typedPrompt, done: promptDone } = useTypewriter(promptText, 20);

  useEffect(() => {
    if (promptDone && !isMultiStep) setTimeout(() => inputRef.current?.focus(), 80);
  }, [promptDone, phase, isMultiStep]);

  useEffect(() => {
    if (typeof phase === "number" && phase >= 3) {
      const q = TALENT_INTAKE_QUESTIONS[phase - 3];
      if (q?.multiSelect) setMultiSelected([]);
    }
  }, [phase]);

  const progressFrac =
    (talentProgressIndex(phase) + 1) / TALENT_INTAKE_TOTAL_STEPS;

  const addRoleFromInput = useCallback(() => {
    const t = inputVal.trim();
    if (!t) return;
    const exact = TALENT_ROLE_CATALOG.find((r) => r.toLowerCase() === t.toLowerCase());
    const fuzzy = roleFuse.search(t);
    const best =
      exact ??
      (fuzzy[0]?.score !== undefined && fuzzy[0].score < 0.28 ? fuzzy[0].item : t.trim());
    setMultiSelected((prev) => {
      if (prev.includes(best)) return prev;
      if (prev.length >= multiMax) return prev;
      return [...prev, best];
    });
    setInputVal("");
  }, [inputVal, multiMax, roleFuse]);

  const advance = useCallback(
    (val: string) => {
      const t = val.trim();
      if (!t) return;

      if (typeof phase === "number" && phase < 3 && nameQ) {
        if (nameQ.id === "displayName" && t.length < 2) return;
        if ((nameQ.id === "firstName" || nameQ.id === "lastName") && t.length < 1) return;
        const next = { ...answers, [nameQ.id]: t };
        setAnswers(next);
        setInputVal("");
        if (phase === 2) setPhase("ct");
        else setPhase((phase as number) + 1);
        return;
      }

      if (phase === "ct") {
        setCreatorType(t);
        setInputVal("");
        setPhase(3);
        return;
      }

      if (typeof phase === "number" && tailQ) {
        if (tailQ.multiSelect || tailQ.rolePicker) return;
        if (tailQ.id === "instagram" && t.length < 2) return;
        const next = { ...answers, [tailQ.id]: t };
        setAnswers(next);
        setInputVal("");
        const idx = phase - 3;
        if (idx < TALENT_INTAKE_QUESTIONS.length - 1) {
          setPhase(phase + 1);
        } else {
          onComplete({ ...next, creatorType });
        }
      }
    },
    [phase, answers, creatorType, nameQ, tailQ, onComplete],
  );

  const advanceMultiContinue = useCallback(() => {
    if (typeof phase !== "number" || phase < 3) return;
    const q = TALENT_INTAKE_QUESTIONS[phase - 3];
    if (!q?.multiSelect) return;
    const next = { ...answers, [q.id]: JSON.stringify(multiSelected) };
    setAnswers(next);
    setInputVal("");
    const idx = phase - 3;
    if (idx < TALENT_INTAKE_QUESTIONS.length - 1) {
      setPhase(phase + 1);
    } else {
      onComplete({ ...next, creatorType });
    }
  }, [phase, answers, creatorType, multiSelected, onComplete]);

  const toggleMultiChip = useCallback(
    (chip: string) => {
      setMultiSelected((prev) => {
        if (prev.includes(chip)) return prev.filter((c) => c !== chip);
        if (prev.length >= multiMax) return prev;
        return [...prev, chip];
      });
    },
    [multiMax],
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (isRolePicker) {
      addRoleFromInput();
      return;
    }
    if (isMultiStep) return;
    if (inputVal.trim()) advance(inputVal.trim());
  };

  const placeholder = (() => {
    if (isRolePicker) return "Search roles or type your own…";
    if (tailQ?.id === "instagram") return "e.g. @yourhandle";
    return "Type your answer or pick below…";
  })();

  return (
    <div
      className="w-full rounded-2xl transition-all duration-300 overflow-hidden"
      style={{
        background: "rgba(10,10,18,0.92)",
        border: "1px solid rgba(124,92,255,0.30)",
        boxShadow: "0 0 40px rgba(124,92,255,0.12), 0 0 0 1px rgba(124,92,255,0.08)",
      }}
    >
      <div className="h-[2px] w-full" style={{ background: "rgba(255,255,255,0.05)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, rgba(124,92,255,0.8), rgba(93,208,255,0.7))",
          }}
          animate={{ width: `${Math.max(progressFrac * 100, 6)}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="px-5 pt-4 pb-3 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={String(phase)}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-start gap-2">
              <Sparkles size={12} className="text-purple-400/70 mt-1 shrink-0" />
              <p
                className="text-[15px] font-semibold leading-snug"
                style={{
                  color: "rgba(255,255,255,0.92)",
                  textShadow: "0 0 20px rgba(167,139,250,0.60)",
                  letterSpacing: "-0.01em",
                }}
              >
                {typedPrompt}
                {!promptDone && (
                  <span className="inline-block w-[2px] h-[14px] bg-purple-400/80 animate-pulse ml-0.5 align-middle rounded-full" />
                )}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {promptDone && (!isMultiStep || isRolePicker) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent outline-none text-[14px] text-white/80 placeholder:text-white/20"
                />
                {isRolePicker && inputVal.trim() ? (
                  <button
                    type="button"
                    onClick={addRoleFromInput}
                    className="flex items-center justify-center w-7 h-7 rounded-xl bg-white text-black shrink-0 transition hover:bg-white/90"
                    title="Add role"
                  >
                    <ArrowUp size={13} />
                  </button>
                ) : !isRolePicker && inputVal.trim() ? (
                  <button
                    type="button"
                    onClick={() => advance(inputVal.trim())}
                    className="flex items-center justify-center w-7 h-7 rounded-xl bg-white text-black shrink-0 transition hover:bg-white/90"
                  >
                    <ArrowUp size={13} />
                  </button>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {promptDone && isRolePicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {multiSelected.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {multiSelected.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleMultiChip(r)}
                      className="rounded-full px-2.5 py-0.5 text-[10px]"
                      style={{
                        background: "rgba(124,92,255,0.22)",
                        border: "1px solid rgba(167,139,250,0.45)",
                        color: "rgba(220,210,255,0.92)",
                      }}
                    >
                      {r} ×
                    </button>
                  ))}
                </div>
              ) : null}
              {roleSuggestions.length > 0 ? (
                <div
                  className="rounded-xl border border-white/[0.08] max-h-32 overflow-y-auto divide-y divide-white/[0.06]"
                  style={{ background: "rgba(0,0,0,0.25)" }}
                >
                  {roleSuggestions.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleMultiChip(r)}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.06] transition"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              ) : inputVal.trim().length >= 2 ? (
                <p className="text-[10px] text-white/30">No close match — tap ↑ to add what you typed.</p>
              ) : null}
              <p className="text-[11px] text-white/38">
                Up to {multiMax} roles. Pick from suggestions or add a custom title.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {promptDone && isMultiStep && !isRolePicker && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-white/38"
            >
              Tap up to {multiMax} roles (or continue with none).
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {promptDone && chips.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-1.5"
            >
              {chips.map((chip) => {
                const selected = isMultiStep && multiSelected.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => (isMultiStep ? toggleMultiChip(chip) : advance(chip))}
                    className="rounded-full px-3 py-1 text-[11px] transition-all duration-100"
                    style={{
                      background: selected ? "rgba(124,92,255,0.22)" : "rgba(255,255,255,0.05)",
                      border: selected
                        ? "1px solid rgba(167,139,250,0.45)"
                        : "1px solid rgba(255,255,255,0.09)",
                      color: selected ? "rgba(220,210,255,0.92)" : "rgba(255,255,255,0.45)",
                    }}
                    onMouseEnter={(e) => {
                      if (selected) return;
                      (e.currentTarget as HTMLElement).style.background = "rgba(124,92,255,0.15)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,92,255,0.35)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(196,174,255,0.90)";
                    }}
                    onMouseLeave={(e) => {
                      if (selected) return;
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                    }}
                  >
                    {chip}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {promptDone && isMultiStep && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <button
                type="button"
                onClick={advanceMultiContinue}
                className="mt-1 rounded-full px-4 py-1.5 text-[11px] font-semibold bg-white text-black hover:bg-white/90 transition"
              >
                Continue
                {multiSelected.length > 0 ? ` (${multiSelected.length}/${multiMax})` : ""}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Grok finalize only — PRISM / portfolio / extra are sequential like TalentIntakeBar */
function normalizeHttpUrl(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "https:" && u.protocol !== "http:") return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}

function archetypeWithArticle(label: string): string {
  const short = label.replace(/^The\s+/i, "").trim() || label;
  const article = /^[aeiou]/i.test(short) ? "an" : "a";
  return `${article} ${short}`;
}

function buildCoachTranscript(
  welcomeText: string,
  steps: typeof TALENT_COACH_SEQUENTIAL_STEPS,
  stepAnswers: Record<string, string>,
): { role: "user" | "assistant"; content: string }[] {
  const transcript: { role: "user" | "assistant"; content: string }[] = [];
  const w = welcomeText.trim();
  if (w) transcript.push({ role: "assistant", content: w });
  transcript.push({ role: "user", content: "Continue" });
  for (const s of steps) {
    if (s.inputKind === "portfolio") {
      const link = stepAnswers.portfolio_link?.trim() ?? "";
      const file = stepAnswers.portfolio_file?.trim() ?? "";
      if (!link && !file) continue;
      const parts: string[] = [];
      if (link) parts.push(`Link: ${link}`);
      if (file) parts.push(`Upload: ${file}`);
      transcript.push({ role: "user", content: `${s.prompt}\n${parts.join("\n")}` });
      continue;
    }
    const ans = stepAnswers[s.id]?.trim();
    if (!ans) continue;
    transcript.push({ role: "user", content: `${s.prompt}\n${ans}` });
  }
  return transcript;
}

function TalentCoachChat({
  draft,
  userName,
  onDone,
  onBack,
}: {
  draft: Record<string, string>;
  userName: string;
  onDone: (assessment: {
    prismArchetype: string;
    prismArchetypeSecondary?: string | null;
    celebrationLine?: string;
  }) => void;
  onBack: () => void;
}) {
  const steps = TALENT_COACH_SEQUENTIAL_STEPS;
  const totalSteps = 1 + steps.length;
  /** -1 welcome, 0..steps.length-1 questions, steps.length = ready to save */
  const [phase, setPhase] = useState(-1);
  const [welcomeText, setWelcomeText] = useState("");
  const [welcomeReady, setWelcomeReady] = useState(false);
  const [stepAnswers, setStepAnswers] = useState<Record<string, string>>({});
  const [inputVal, setInputVal] = useState("");
  const [uploadedAssetUrl, setUploadedAssetUrl] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadHint, setUploadHint] = useState("");
  const [finalizing, setFinalizing] = useState(false);
  const [err, setErr] = useState("");
  const [celebration, setCelebration] = useState<{
    primary: string;
    secondary: string | null;
    prefLine: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const flowComplete = phase >= steps.length;
  const currentStep = phase >= 0 && phase < steps.length ? steps[phase] : null;

  useEffect(() => {
    const fn = draft.firstName?.trim() || userName.split(/\s+/)[0] || "there";
    setWelcomeText(
      `Hi ${fn}, welcome to Creator Hive! Few more questions to assess best fit and your working persona.`,
    );
    setWelcomeReady(true);
  }, [draft.firstName, userName]);

  useEffect(() => {
    if (currentStep?.id === "portfolio") {
      setUploadedAssetUrl(null);
      setUploadHint("");
    }
  }, [phase, currentStep?.id]);

  const promptText =
    phase === -1
      ? welcomeReady
        ? welcomeText
        : "Welcome — loading…"
      : flowComplete
        ? "All set — save your profile when you're ready."
        : (currentStep?.prompt ?? "");

  const typeSpeed = flowComplete ? 0 : 20;
  const { out: typedPrompt, done: promptDone } = useTypewriter(promptText, typeSpeed);

  useEffect(() => {
    if (promptDone && phase >= 0 && phase < steps.length) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [promptDone, phase, steps.length]);

  const progressFrac =
    phase === -1 ? 1 / totalSteps : flowComplete ? 1 : (1 + phase + 1) / totalSteps;

  const linkCandidate = inputVal.trim();
  const hasPortfolioLink = Boolean(normalizeHttpUrl(linkCandidate));
  const hasPortfolioPayload = Boolean(uploadedAssetUrl) || hasPortfolioLink;

  const chips: string[] =
    phase === -1
      ? ["Continue"]
      : flowComplete || !currentStep
        ? []
        : [
            ...currentStep.chips,
            ...(currentStep.inputKind === "portfolio" && hasPortfolioPayload ? (["Continue"] as const) : []),
          ];

  const isPortfolioStep = currentStep?.inputKind === "portfolio";
  const showTextLine = phase >= 0 && phase < steps.length;

  const goNext = useCallback(() => {
    setPhase((p) => p + 1);
    setInputVal("");
  }, []);

  const advance = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const isSkip = raw.startsWith("Skip");

      if (phase === -1) {
        if (raw === "Continue" && welcomeReady) {
          setPhase(0);
          setInputVal("");
        }
        return;
      }

      if (flowComplete || !currentStep) return;

      if (currentStep.inputKind === "portfolio") {
        if (isSkip) {
          setStepAnswers((a) => ({ ...a, portfolio_link: "", portfolio_file: "" }));
          setInputVal("");
          goNext();
          return;
        }
        if (raw === "Continue") {
          const url = normalizeHttpUrl(linkCandidate);
          const linkStored = url ?? (linkCandidate ? linkCandidate : "");
          const fileStored = uploadedAssetUrl ?? "";
          setStepAnswers((a) => ({
            ...a,
            portfolio_link: linkStored,
            portfolio_file: fileStored,
          }));
          setInputVal("");
          goNext();
          return;
        }
        return;
      }

      if (isSkip) {
        setStepAnswers((a) => ({ ...a, [currentStep.id]: "" }));
        goNext();
        return;
      }
      if (!trimmed) return;
      setStepAnswers((a) => ({ ...a, [currentStep.id]: trimmed }));
      goNext();
    },
    [phase, welcomeReady, flowComplete, currentStep, uploadedAssetUrl, goNext, linkCandidate],
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (currentStep?.inputKind === "portfolio") {
      if (inputVal.trim() || uploadedAssetUrl) advance("Continue");
      return;
    }
    if (inputVal.trim()) advance(inputVal.trim());
  };

  const placeholder =
    currentStep?.inputKind === "portfolio"
      ? "Portfolio URL (optional)…"
      : "Type your answer or pick below…";

  const finalize = useCallback(async () => {
    setFinalizing(true);
    setErr("");
    try {
      const transcript = buildCoachTranscript(welcomeText, steps, stepAnswers);
      const finRes = await fetch("/api/onboarding/creator/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finalize",
          draft,
          transcript,
        }),
      });
      const finText = await finRes.text();
      let fin: Record<string, unknown> = {};
      try {
        fin = finText ? (JSON.parse(finText) as Record<string, unknown>) : {};
      } catch {
        setErr("Could not read AI response — try again.");
        setFinalizing(false);
        return;
      }
      if (!finRes.ok) {
        setErr(typeof fin.error === "string" ? fin.error : "Save failed");
        setFinalizing(false);
        return;
      }

      const tagsRaw = fin.generatedMatchTags;
      const generatedMatchTags = Array.isArray(tagsRaw)
        ? tagsRaw.map((t) => String(t).trim()).filter(Boolean).slice(0, 24)
        : [];

      const base = draftToProfileBody(draft, userName);
      const linkRaw = stepAnswers.portfolio_link?.trim() ?? "";
      const linkUrl = normalizeHttpUrl(linkRaw) ?? (linkRaw ? linkRaw : undefined);
      const fileUrl = stepAnswers.portfolio_file?.trim() || null;
      const portfolioUrl = linkUrl ?? (fileUrl ? normalizeHttpUrl(fileUrl) ?? fileUrl : undefined);

      const primary =
        typeof fin.prismArchetype === "string" && fin.prismArchetype.trim()
          ? fin.prismArchetype.trim()
          : "The Translator";
      const secondaryRaw =
        typeof fin.prismArchetypeSecondary === "string" && fin.prismArchetypeSecondary.trim()
          ? fin.prismArchetypeSecondary.trim()
          : null;
      const secondary = secondaryRaw && secondaryRaw !== primary ? secondaryRaw : null;

      const celebrationLineRaw =
        typeof fin.celebrationPreferences === "string" && fin.celebrationPreferences.trim()
          ? fin.celebrationPreferences.trim()
          : typeof fin.workEnvironmentFit === "string" && fin.workEnvironmentFit.trim()
            ? fin.workEnvironmentFit.trim()
            : "";

      const putBody = {
        ...base,
        prismArchetype: primary,
        ...(secondary ? { prismArchetypeSecondary: secondary } : {}),
        generatedMatchTags,
        workEnvironmentFit: typeof fin.workEnvironmentFit === "string" ? fin.workEnvironmentFit : undefined,
        onboardingAiSummary: typeof fin.onboardingAiSummary === "string" ? fin.onboardingAiSummary : undefined,
        onboardingTranscriptJson: transcript,
        onboardingComplete: true,
        ...(portfolioUrl ? { portfolioUrl } : {}),
      };

      const putRes = await fetch("/api/onboarding/creator/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(putBody),
      });
      const putText = await putRes.text();
      let putData: unknown = null;
      try {
        putData = putText ? JSON.parse(putText) : null;
      } catch {
        setErr(putText ? putText.slice(0, 200) : "Invalid server response");
        setFinalizing(false);
        return;
      }
      if (!putRes.ok) {
        const msg =
          typeof putData === "object" && putData !== null
            ? [
                (putData as { error?: unknown }).error,
                (putData as { message?: unknown }).message,
              ].find((x) => typeof x === "string" && x.trim()) ?? null
            : null;
        setErr(typeof msg === "string" ? msg : "Profile save failed");
        setFinalizing(false);
        return;
      }

      if (fileUrl) {
        const mediaType = /\.(mp4|mov|webm)(\?|$)/i.test(fileUrl) ? "video" : "image";
        await fetch("/api/creator/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaUrl: fileUrl,
            mediaType,
            title: "Showcase",
            position: 0,
          }),
        }).catch(() => {});
      }

      const prefLine =
        celebrationLineRaw ||
        "settings that match how you described your pace, collaboration, and creative instincts";

      setCelebration({
        primary,
        secondary,
        prefLine,
      });
    } catch {
      setErr("Something went wrong — try again.");
    } finally {
      setFinalizing(false);
    }
  }, [draft, userName, welcomeText, steps, stepAnswers]);

  if (celebration) {
    const line = `Congrats! Your Hive archetype is ${archetypeWithArticle(celebration.primary)}. You prefer to work in ${celebration.prefLine}.`;
    return (
      <div className="w-full flex flex-col">
        <div
          className="w-full rounded-2xl px-5 py-5 space-y-4"
          style={{
            background: "rgba(10,10,18,0.92)",
            border: "1px solid rgba(124,92,255,0.32)",
            boxShadow: "0 0 40px rgba(124,92,255,0.14)",
          }}
        >
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-purple-400/90 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-200/50">
                You&apos;re in
              </p>
              <p className="text-[15px] font-semibold text-white/92 leading-relaxed">{line}</p>
              {celebration.secondary ? (
                <p className="text-[12px] text-white/45">Secondary pattern: {celebration.secondary}</p>
              ) : null}
              {celebration.primary in ARCHETYPE_PUBLIC_BLURB ? (
                <p className="text-[12px] text-white/55 leading-relaxed pt-1 border-t border-white/[0.08]">
                  {ARCHETYPE_PUBLIC_BLURB[celebration.primary as CreatorHiveArchetypeLabel]}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onDone({
                prismArchetype: celebration.primary,
                prismArchetypeSecondary: celebration.secondary,
                celebrationLine: line,
              })
            }
            className="w-full rounded-full bg-white py-2.5 text-xs font-semibold text-black hover:bg-white/90 transition"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div
        className="w-full rounded-2xl transition-all duration-300 overflow-hidden"
        style={{
          background: "rgba(10,10,18,0.92)",
          border: "1px solid rgba(124,92,255,0.30)",
          boxShadow: "0 0 40px rgba(124,92,255,0.12), 0 0 0 1px rgba(124,92,255,0.08)",
        }}
      >
        <div className="h-[2px] w-full" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, rgba(124,92,255,0.8), rgba(93,208,255,0.7))",
            }}
            animate={{ width: `${Math.max(progressFrac * 100, 6)}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="px-5 pt-4 pb-3 space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={String(phase)}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              <div className="flex items-start gap-2">
                <Sparkles size={12} className="text-purple-400/70 mt-1 shrink-0" />
                <p
                  className="text-[15px] font-semibold leading-snug"
                  style={{
                    color: "rgba(255,255,255,0.92)",
                    textShadow: "0 0 20px rgba(167,139,250,0.60)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {typedPrompt}
                  {!promptDone && (
                    <span className="inline-block w-[2px] h-[14px] bg-purple-400/80 animate-pulse ml-0.5 align-middle rounded-full" />
                  )}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {promptDone && showTextLine && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none text-[14px] text-white/80 placeholder:text-white/20"
                  />
                  {isPortfolioStep && hasPortfolioPayload ? (
                    <button
                      type="button"
                      onClick={() => advance("Continue")}
                      className="flex items-center justify-center w-7 h-7 rounded-xl bg-white text-black shrink-0 transition hover:bg-white/90"
                    >
                      <ArrowUp size={13} />
                    </button>
                  ) : !isPortfolioStep && inputVal.trim() ? (
                    <button
                      type="button"
                      onClick={() => advance(inputVal.trim())}
                      className="flex items-center justify-center w-7 h-7 rounded-xl bg-white text-black shrink-0 transition hover:bg-white/90"
                    >
                      <ArrowUp size={13} />
                    </button>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {promptDone && isPortfolioStep && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="flex flex-wrap items-center gap-2 pt-0.5"
              >
                <label
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] cursor-pointer transition border",
                    uploadBusy
                      ? "border-white/10 text-white/25 cursor-wait"
                      : "border-purple-400/25 text-purple-200/80 hover:bg-purple-500/10",
                  )}
                >
                  <Plus size={12} />
                  {uploadBusy ? "Uploading…" : "Choose file"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                    disabled={uploadBusy}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      setUploadHint("");
                      setUploadBusy(true);
                      try {
                        const fd = new FormData();
                        fd.set("file", f);
                        const res = await fetch("/api/onboarding/creator/portfolio-upload", {
                          method: "POST",
                          body: fd,
                        });
                        const data = (await res.json()) as { url?: string; error?: string };
                        if (!res.ok || !data.url) {
                          setUploadHint(data.error ?? "Upload failed");
                          return;
                        }
                        setUploadedAssetUrl(data.url);
                        setUploadHint("Link and/or file ready — tap Continue or the arrow.");
                      } catch {
                        setUploadHint("Upload failed — try again or skip.");
                      } finally {
                        setUploadBusy(false);
                      }
                    }}
                  />
                </label>
                {uploadedAssetUrl ? (
                  <span className="text-[10px] text-emerald-300/70">File attached</span>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          {uploadHint ? <p className="text-[10px] text-white/35">{uploadHint}</p> : null}

          <AnimatePresence>
            {promptDone && chips.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08 }}
                className="flex flex-wrap gap-1.5"
              >
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    disabled={phase === -1 && !welcomeReady}
                    onClick={() => advance(chip)}
                    className="rounded-full px-3 py-1 text-[11px] transition-all duration-100 disabled:opacity-35 disabled:pointer-events-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      color: "rgba(255,255,255,0.45)",
                    }}
                    onMouseEnter={(e) => {
                      if (phase === -1 && !welcomeReady) return;
                      (e.currentTarget as HTMLElement).style.background = "rgba(124,92,255,0.15)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,92,255,0.35)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(196,174,255,0.90)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 px-1 gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] text-white/22 hover:text-white/45 transition shrink-0"
        >
          ← Edit answers
        </button>
        <button
          type="button"
          onClick={() => void finalize()}
          disabled={finalizing || !flowComplete || !welcomeReady}
          className={cn(
            "rounded-full px-4 py-1.5 text-[11px] font-semibold transition",
            finalizing || !flowComplete || !welcomeReady
              ? "bg-white/10 text-white/25 cursor-not-allowed"
              : "bg-white text-black hover:bg-white/90",
          )}
        >
          {finalizing ? "Saving…" : "Finish & save profile"}
        </button>
      </div>
      {err ? <p className="text-[11px] text-rose-300/90 mt-1.5 px-1">{err}</p> : null}
    </div>
  );
}

// ── Main HeroBar ─────────────────────────────────────────────────────────────
export function HeroBar({
  mode,
  onQueryChange,
  onDiscover,
  showClear,
  onClear,
  onAIResults,
  onTalentProfileSaved,
}: HeroBarProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const store = useDiscoveryStore();
  const hydrate = useDiscoveryStore((s) => s.hydrate);

  // track: "intake" | "returning-new" | "returning-resume" | "activated"
  type Track = "intake" | "returning-new" | "returning-resume" | "activated";
  const [track, setTrack] = useState<Track | null>(null);
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [welcomeOverride, setWelcomeOverride] = useState<string | null>(null);
  const [autoQueryOverride, setAutoQueryOverride] = useState<string | null>(null);
  const [advisorChatKey, setAdvisorChatKey] = useState(0);
  const [briefUploadBusy, setBriefUploadBusy] = useState(false);
  const [briefUploadErr, setBriefUploadErr] = useState<string | null>(null);
  const [discoveryRehydrated, setDiscoveryRehydrated] = useState(() =>
    Boolean(useDiscoveryStore.persist?.hasHydrated?.()),
  );

  useEffect(() => {
    if (discoveryRehydrated) return;
    if (useDiscoveryStore.persist.hasHydrated()) {
      setDiscoveryRehydrated(true);
      return;
    }
    const unsub = useDiscoveryStore.persist.onFinishHydration(() => setDiscoveryRehydrated(true));
    return unsub;
  }, [discoveryRehydrated]);

  // Client hero: pick track only after persisted discovery store has rehydrated (avoids wrong "intake" before completed loads)
  useEffect(() => {
    if (mode !== "client") return;
    if (!discoveryRehydrated) return;
    if (track !== null) return;
    if (session?.user) {
      if (!store.completed) setTrack("intake");
      else {
        const hasBrief = store.primaryObjective || store.requestedRoles.length > 0;
        setTrack(hasBrief ? "returning-resume" : "returning-new");
      }
    } else {
      setTrack("intake");
    }
  }, [
    mode,
    session?.user,
    discoveryRehydrated,
    store.completed,
    store.primaryObjective,
    store.requestedRoles.length,
    track,
  ]);

  const handleBriefFile = useCallback(
    async (file: File) => {
      if (!session?.user) {
        onDiscover?.();
        setBriefUploadErr("Sign in to upload your brief");
        return;
      }
      setBriefUploadBusy(true);
      setBriefUploadErr(null);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/discovery/parse-brief", { method: "POST", body: fd });
        const data = (await res.json()) as {
          error?: string;
          assistantFallback?: string;
          savePayload?: {
            primaryObjective: string;
            requestedRoles: string[];
            startTiming: string;
            budgetRange: string;
            companyName: string;
            industry: string;
            notes: string;
            currentStep: number;
            completed: boolean;
          };
          assistantMessage?: string;
        };
        if (!res.ok) {
          setBriefUploadErr(data.error ?? "Could not read this brief");
          if (data.assistantFallback) {
            setWelcomeOverride(data.assistantFallback);
            setAutoQueryOverride("");
            setProfile({
              businessType: "",
              objective: "",
              timeline: "",
              budget: "",
              roles: "",
              company: "",
              industry: "",
            });
            setAdvisorChatKey((k) => k + 1);
            setTrack("activated");
          }
          return;
        }
        const sp = data.savePayload;
        if (!sp) {
          setBriefUploadErr("Unexpected response");
          return;
        }
        hydrate({
          primaryObjective: sp.primaryObjective,
          rankedObjectives: sp.primaryObjective ? [sp.primaryObjective] : [],
          requestedRoles: sp.requestedRoles,
          startTiming: sp.startTiming,
          budgetRange: sp.budgetRange,
          companyName: sp.companyName,
          industry: sp.industry,
          notes: sp.notes,
          currentStep: sp.currentStep,
          completed: true,
        });
        fetch("/api/discovery/brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            primaryObjective: sp.primaryObjective,
            requestedRoles: sp.requestedRoles,
            startTiming: sp.startTiming,
            budgetRange: sp.budgetRange,
            companyName: sp.companyName,
            industry: sp.industry,
            notes: sp.notes,
            currentStep: 3,
            completed: true,
          }),
        }).catch(() => {});
        setProfile({
          businessType: "",
          objective: sp.primaryObjective,
          timeline: sp.startTiming,
          budget: sp.budgetRange,
          roles: sp.requestedRoles.join(", "),
          company: sp.companyName,
          industry: sp.industry,
        });
        setWelcomeOverride(
          data.assistantMessage ??
            "I’ve pulled the key points from your brief — tell me if anything should change before we match talent.",
        );
        setAutoQueryOverride(
          [sp.requestedRoles.join(" "), sp.primaryObjective].filter(Boolean).join(" ").trim(),
        );
        setAdvisorChatKey((k) => k + 1);
        setTrack("activated");
      } catch {
        setBriefUploadErr("Something went wrong — try again");
      } finally {
        setBriefUploadBusy(false);
      }
    },
    [session?.user, onDiscover, hydrate],
  );

  const handleIntakeComplete = useCallback((answers: Record<string, string>, bizType: string) => {
    setWelcomeOverride(null);
    setAutoQueryOverride(null);
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
    setWelcomeOverride(null);
    setAutoQueryOverride(null);
    setBriefUploadErr(null);
    setAdvisorChatKey((k) => k + 1);
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

  const advisorWelcomeMsg = useMemo(() => {
    if (welcomeOverride) return welcomeOverride;
    if (profile.objective) {
      return `Got it — ${profile.businessType ? profile.businessType + ", " : ""}${profile.objective}, ${profile.timeline ? profile.timeline + ", " : ""}${profile.budget || ""}. Let me find your team.`;
    }
    return `Welcome back. Your last brief is loaded — what would you like to explore?`;
  }, [welcomeOverride, profile]);

  const advisorAutoQuery =
    autoQueryOverride !== null
      ? autoQueryOverride.trim() || undefined
      : [profile.roles, profile.objective].filter(Boolean).join(" ").trim() || undefined;

  type TalentGate = "loading" | "anon" | "needs_onboarding" | "coach" | "pending_review" | "done";
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const [talentGate, setTalentGate] = useState<TalentGate>("loading");
  const [talentDraft, setTalentDraft] = useState<Record<string, string>>({});
  const [talentArchetype, setTalentArchetype] = useState<{
    prismArchetype: string;
    prismArchetypeSecondary?: string | null;
    celebrationLine?: string;
  } | null>(null);

  useEffect(() => {
    if (mode !== "talent") return;
    if (!session?.user) {
      setTalentGate("anon");
      return;
    }
    if (userRole !== "CREATOR") {
      setTalentGate("done");
      return;
    }
    let cancelled = false;
    setTalentGate("loading");
    fetch("/api/onboarding/creator/profile")
      .then((r) => r.json())
      .then((data: { profile?: { onboardingCompletedAt?: string | null } | null }) => {
        if (cancelled) return;
        if (data.profile?.onboardingCompletedAt) setTalentGate("done");
        else setTalentGate("needs_onboarding");
      })
      .catch(() => {
        if (!cancelled) setTalentGate("needs_onboarding");
      });
    return () => {
      cancelled = true;
    };
  }, [mode, session?.user, userRole]);

  if (mode === "talent") {
    const displayName =
      session?.user?.name?.trim() ||
      session?.user?.email?.split("@")[0] ||
      "Creator";

    if (sessionStatus === "loading") {
      return (
        <div
          className="w-full h-14 rounded-2xl animate-pulse"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        />
      );
    }

    // Logged-out talent auth lives in page.tsx (email / OTP) — no second "Continue" bar here
    if (!session?.user || talentGate === "anon") {
      return null;
    }

    if (talentGate === "loading") {
      return (
        <div
          className="w-full h-14 rounded-2xl animate-pulse"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        />
      );
    }

    if (talentGate === "done") {
      return (
        <div className="flex flex-1 items-center gap-3">
          <div className="rounded-full bg-[#0D0D14] ring-1 ring-white/10 p-2 pl-5 pr-3 flex-1">
            <span className="block text-[15px] leading-8 text-slate-200">Welcome back</span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/creator")}
            className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition"
          >
            Dashboard
          </button>
        </div>
      );
    }

    if (talentGate === "pending_review") {
      const archLabel = talentArchetype?.prismArchetype;
      const archBlurb =
        archLabel && archLabel in ARCHETYPE_PUBLIC_BLURB
          ? ARCHETYPE_PUBLIC_BLURB[archLabel as CreatorHiveArchetypeLabel]
          : null;
      const archSecondary = talentArchetype?.prismArchetypeSecondary;

      return (
        <motion.div
          key="talent-pending-review"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full rounded-2xl px-5 py-5 space-y-3"
          style={{
            background: "rgba(10,10,18,0.92)",
            border: "1px solid rgba(124,92,255,0.28)",
            boxShadow: "0 0 40px rgba(124,92,255,0.12)",
          }}
        >
          {talentArchetype?.celebrationLine ? (
            <p className="text-[13px] text-white/72 leading-relaxed">{talentArchetype.celebrationLine}</p>
          ) : archLabel && archBlurb ? (
            <div
              className="rounded-xl px-4 py-3 space-y-1.5 mb-1"
              style={{
                background: "linear-gradient(135deg, rgba(124,92,255,0.14), rgba(93,208,255,0.08))",
                border: "1px solid rgba(167,139,250,0.28)",
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-200/55">
                Your fit archetype
              </p>
              <p className="text-[17px] font-bold text-white/95 leading-tight">{archLabel}</p>
              <p className="text-[12px] text-white/60 leading-relaxed">{archBlurb}</p>
              {archSecondary ? (
                <p className="text-[11px] text-purple-200/45 pt-0.5">Also: {archSecondary}</p>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-purple-400/80 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-[16px] font-semibold text-white/92 leading-snug">Your profile is under review</p>
              <p className="text-[13px] text-white/55 leading-relaxed">
                Creator Hive vets every talent before matching you with brands. We&apos;ll email you when your profile
                is approved — usually within a few business days.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setTalentGate("done")}
              className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition"
            >
              Got it
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/creator")}
              className="rounded-full px-5 py-2 text-xs font-medium transition"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Open dashboard
            </button>
          </div>
        </motion.div>
      );
    }

    if (talentGate === "coach") {
      return (
        <motion.div
          key="talent-coach"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <TalentCoachChat
            draft={talentDraft}
            userName={displayName}
            onBack={() => {
              setTalentArchetype(null);
              setTalentGate("needs_onboarding");
            }}
            onDone={(assessment) => {
              setTalentArchetype(assessment);
              onTalentProfileSaved?.();
              setTalentGate("pending_review");
            }}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="talent-intake"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <TalentIntakeBar
          onComplete={(draft) => {
            setTalentArchetype(null);
            setTalentDraft(draft);
            setTalentGate("coach");
          }}
        />
      </motion.div>
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
            showSkipQuestions={false}
            onScheduleAdvisor={openAdvisorBookingLink}
            onBriefFile={handleBriefFile}
            uploadBusy={briefUploadBusy}
            uploadError={briefUploadErr}
          />
        </motion.div>
      )}

      {/* TRACK B — Returning, new campaign: single warm prompt */}
      {track === "returning-new" && (
        <motion.div key="returning-new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full">
          <IntakeBar
            onComplete={handleIntakeComplete}
            showSkipQuestions
            onSkipToGrok={() => {
              setWelcomeOverride(null);
              setAutoQueryOverride(null);
              setProfile(buildReturningProfile());
              setTrack("activated");
            }}
            onScheduleAdvisor={openAdvisorBookingLink}
            onBriefFile={handleBriefFile}
            uploadBusy={briefUploadBusy}
            uploadError={briefUploadErr}
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
                onClick={() => {
                  setWelcomeOverride(null);
                  setAutoQueryOverride(null);
                  setProfile(buildReturningProfile());
                  setTrack("activated");
                }}
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
            key={advisorChatKey}
            systemPrompt={buildSystemPrompt(profile)}
            welcomeMsg={advisorWelcomeMsg}
            autoQuery={advisorAutoQuery}
            onBriefFile={handleBriefFile}
            onAIResults={onAIResults}
            onDiscover={onDiscover}
            onReset={handleReset}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
