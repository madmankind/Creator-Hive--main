"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUp, Loader2, Plus, X, Sparkles, Check } from "lucide-react";
import { curatedTalent } from "@/lib/curatedTalent";

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

// ── Business types ──────────────────────────────────────────────────────────
const BUSINESS_TYPES = [
  { id: "brand",   label: "Brand / In-house",  icon: "🏢", sub: "We manage our own marketing" },
  { id: "agency",  label: "Agency",             icon: "🎯", sub: "We work on behalf of clients" },
  { id: "startup", label: "Startup / Founder",  icon: "🚀", sub: "Building from the ground up" },
  { id: "media",   label: "Media / Publisher",  icon: "📱", sub: "Content production at scale" },
];

// ── Qualifying questions (no API, pure local) ────────────────────────────────
const QUESTIONS = [
  {
    id: "objective",
    text: "What are you trying to achieve?",
    sub: "Pick your primary goal",
    options: [
      "Grow social media presence",
      "Launch a campaign or product",
      "Create UGC / short-form content",
      "Build brand awareness",
      "Drive traffic or conversions",
      "Influencer / creator activation",
      "Ongoing content retainer",
      "Not sure yet",
    ],
    multi: false,
  },
  {
    id: "timeline",
    text: "When do you need to start?",
    sub: "We'll match available talent accordingly",
    options: ["ASAP", "Within 2 weeks", "This month", "Next month", "Just exploring"],
    multi: false,
  },
  {
    id: "budget",
    text: "What's your monthly budget comfort?",
    sub: "This helps us filter to the right tier",
    options: ["Under AED 15K", "AED 15K – 25K", "AED 25K – 45K", "AED 45K+", "Need guidance first"],
    multi: false,
  },
  {
    id: "roles",
    text: "What type of talent do you need?",
    sub: "Select all that apply",
    options: [
      "Videographer / Filmmaker",
      "Content Creator / UGC",
      "Social Media Manager",
      "Photographer",
      "Creative Director",
      "Copywriter / Strategist",
      "Motion Designer",
      "Full team",
    ],
    multi: true,
  },
];

// ── Build talent system context for Grok ────────────────────────────────────
function buildTalentContext(): string {
  return curatedTalent.map((t) => {
    const roles = [t.primaryRole, ...(t.roleTags ?? []).filter(r => r !== t.primaryRole)].join(", ");
    const brands = t.brandPartners?.join(", ") ?? "";
    const er = t.engagementRate ? `${(t.engagementRate * 100).toFixed(1)}% ER` : "";
    const followers = t.followers ? `${(t.followers / 1000).toFixed(0)}K followers` : "";
    const stats = [followers, er].filter(Boolean).join(" · ");
    return `[${t.id}] ${t.displayName ?? t.name} | ${roles} | ${t.location ?? "UAE"} | ${t.shortBio} | ${t.nicheSummary} | Brands: ${brands} | ${stats} | Archetype: ${t.prismArchetype}`;
  }).join("\n");
}

const TALENT_CONTEXT = buildTalentContext();

function buildGrokSystemPrompt(answers: Record<string, string | string[]>): string {
  const answerSummary = Object.entries(answers)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join("\n");

  return `You are the Creator Hive media strategist and talent advisor. Creator Hive is a UAE-based premium creative talent marketplace.

CLIENT BRIEF ALREADY COLLECTED:
${answerSummary}

CREATOR HIVE TALENT ROSTER (${curatedTalent.length} vetted creators):
${TALENT_CONTEXT}

YOUR ROLE:
You are a senior media strategist helping brands find and work with the best creative talent. You know every creator on this roster deeply. You can:
- Recommend specific talent by ID and explain why they fit
- Advise on campaign strategy, content formats, and platform approach
- Suggest team compositions for different objectives
- Give guidance on budgets, timelines, deliverables
- Answer any question about working with creators in the UAE/GCC market

RESPONSE STYLE:
- Conversational, sharp, no corporate fluff
- Reference specific talent by name when recommending
- When you have enough to recommend a team, end your message with a JSON block (no markdown):
{"action":"search","query":"<search query>","summary":"<team summary>"}

WHAT YOU NEVER DISCUSS:
- Internal Creator Hive pricing, margins, or commission structures
- Competitor platforms
- Pending contracts or legal matters

You already know what the client needs from their brief above. Jump straight into being helpful.`;
}

// ── Chat message type ────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  talentIds?: string[];
  isLoading?: boolean;
}

// ── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 18, active = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setDisplayed(text); setDone(true); return; }
    setDisplayed(""); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);
  return { displayed, done };
}

// ── Business type screen ─────────────────────────────────────────────────────
function BusinessTypeScreen({ onSelect }: { onSelect: (type: string) => void }) {
  return (
    <motion.div
      key="biz-type"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-4"
    >
      <div className="text-center space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/25">Before we begin</p>
        <h2 className="text-[22px] font-medium tracking-[-0.02em] text-white">What type of business are you?</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {BUSINESS_TYPES.map((b, i) => (
          <motion.button
            key={b.id}
            type="button"
            onClick={() => onSelect(b.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex flex-col items-start gap-1.5 rounded-2xl px-4 py-3.5 text-left transition-all duration-150 group"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(124,92,255,0.10)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,92,255,0.30)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <span className="text-[20px]">{b.icon}</span>
            <div>
              <p className="text-[13px] font-medium text-white/85">{b.label}</p>
              <p className="text-[11px] text-white/35 mt-0.5">{b.sub}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Single qualifying question ────────────────────────────────────────────────
function QuestionScreen({
  question, qIndex, total, onAnswer, prevAnswer,
}: {
  question: typeof QUESTIONS[0];
  qIndex: number;
  total: number;
  onAnswer: (answer: string | string[]) => void;
  prevAnswer?: string | string[];
}) {
  const [selected, setSelected] = useState<string[]>(
    prevAnswer ? (Array.isArray(prevAnswer) ? prevAnswer : [prevAnswer]) : []
  );
  const { displayed, done } = useTypewriter(question.text, 22, true);

  const toggle = (opt: string) => {
    if (!question.multi) {
      onAnswer(opt);
      return;
    }
    setSelected(prev =>
      prev.includes(opt) ? prev.filter(s => s !== opt) : [...prev, opt]
    );
  };

  return (
    <motion.div
      key={`q-${qIndex}`}
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full space-y-4"
    >
      {/* Progress */}
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="h-0.5 rounded-full flex-1 transition-all duration-500"
            style={{ background: i <= qIndex ? "rgba(255,255,255,0.60)" : "rgba(255,255,255,0.10)" }} />
        ))}
      </div>

      {/* Question with glow */}
      <div className="rounded-2xl px-4 py-3.5 relative overflow-hidden"
        style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.20)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,92,255,0.15) 0%, transparent 70%)" }} />
        <Sparkles size={12} className="text-purple-400/60 mb-1.5" />
        <p className="text-[15px] font-medium text-white/90 leading-snug relative z-10">
          {displayed}
          {!done && <span className="inline-block w-0.5 h-4 bg-purple-400/70 animate-pulse ml-0.5 align-middle" />}
        </p>
        {done && question.sub && (
          <p className="text-[11px] text-white/35 mt-1 relative z-10">{question.sub}</p>
        )}
      </div>

      {/* Options */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="flex flex-wrap gap-2"
          >
            {question.options.map((opt) => {
              const active = selected.includes(opt);
              return (
                <button key={opt} type="button" onClick={() => toggle(opt)}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[12px] font-medium transition-all duration-150 flex items-center gap-1.5",
                    active
                      ? "bg-white text-black"
                      : "bg-white/[0.05] text-white/50 ring-1 ring-white/[0.08] hover:bg-white/[0.09] hover:text-white/75"
                  )}>
                  {active && <Check size={11} strokeWidth={2.5} />}
                  {opt}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue for multi-select */}
      {question.multi && selected.length > 0 && done && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          type="button" onClick={() => onAnswer(selected)}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-all"
          style={{ background: "rgba(255,255,255,0.93)", color: "#07070B" }}>
          Continue <ArrowRight size={14} />
        </motion.button>
      )}
    </motion.div>
  );
}

// ── Activated chat (Grok mode) ───────────────────────────────────────────────
function AdvisorChat({
  answers, businessType, onAIResults, onDiscover, onClear,
}: {
  answers: Record<string, string | string[]>;
  businessType: string;
  onAIResults?: (ids: string[], summary: string) => void;
  onDiscover?: () => void;
  onClear?: () => void;
}) {
  const fullAnswers = { businessType, ...answers };
  const systemPrompt = buildGrokSystemPrompt(fullAnswers);
  const answerLines = Object.entries(fullAnswers).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`);

  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: `Perfect. Based on your brief, I've got a good picture of what you need.\n\n${answerLines.join(" · ")}\n\nLet me find your team — or ask me anything about strategy, creators, or how to approach this campaign.`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-trigger initial search after welcome
  useEffect(() => {
    const query = [
      Array.isArray(answers.roles) ? answers.roles.join(" ") : answers.roles,
      answers.objective,
    ].filter(Boolean).join(" ");
    if (query) {
      setTimeout(() => triggerSearch(query, ""), 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (res.ok && data.talentIds?.length) {
        if (data.rateLimit?.remaining !== undefined) setRemaining(data.rateLimit.remaining);
        onAIResults?.(data.talentIds, data.teamSummary ?? summary);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: `I've matched ${data.talentIds.length} creators to your brief ↓\n\n${data.teamSummary ?? summary}`,
          talentIds: data.talentIds,
        }]);
      }
    } catch { /* silent */ }
  }, [onDiscover, onAIResults]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const loadingMsg: Message = { id: "loading", role: "assistant", content: "", isLoading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter(m => !m.isLoading)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: text }],
          systemPrompt,
        }),
      });
      const data = await res.json();
      const reply: string = data.content ?? "Try again in a moment.";

      // Check for search action
      const trimmed = reply.trim();
      if (trimmed.startsWith("{") && trimmed.includes('"action":"search"')) {
        try {
          const parsed = JSON.parse(trimmed) as { action: string; query: string; summary: string };
          if (parsed.action === "search") {
            setMessages(prev => prev.filter(m => m.id !== "loading"));
            setLoading(false);
            await triggerSearch(parsed.query, parsed.summary);
            return;
          }
        } catch { /* not JSON */ }
      }

      if (data.rateLimit?.remaining !== undefined) setRemaining(data.rateLimit.remaining);
      setMessages(prev => [
        ...prev.filter(m => m.id !== "loading"),
        { id: Date.now().toString(), role: "assistant", content: reply },
      ]);
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.id !== "loading"),
        { id: Date.now().toString(), role: "assistant", content: "Connection error — try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, systemPrompt, triggerSearch]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Chat history */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(13,13,20,0.85)", border: "1px solid rgba(124,92,255,0.20)", backdropFilter: "blur(20px)" }}>
        <div className="max-h-72 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.isLoading ? (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
                  style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.15)" }}>
                  <Loader2 size={12} className="animate-spin text-purple-400" />
                  <span className="text-[12px] text-white/35">Thinking…</span>
                </div>
              ) : (
                <div className={cn(
                  "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-white/[0.09] text-white/85"
                    : "text-white/75"
                )}
                  style={msg.role === "assistant" ? {
                    background: "rgba(124,92,255,0.08)",
                    border: "1px solid rgba(124,92,255,0.15)",
                    boxShadow: "0 0 20px rgba(124,92,255,0.08)",
                  } : {}}>
                  {msg.role === "assistant" && <Sparkles size={10} className="inline mr-1.5 text-purple-400/70 mb-0.5" />}
                  {msg.content}
                  {msg.talentIds && (
                    <p className="mt-1 text-[10px] text-purple-300/50">{msg.talentIds.length} creators matched ↓</p>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input row */}
        <div className="border-t px-3 py-2.5 flex items-end gap-2"
          style={{ borderColor: "rgba(124,92,255,0.15)" }}>
          <textarea ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about strategy, talent, or refine your brief…"
            rows={1}
            className="flex-1 bg-transparent outline-none text-[13px] text-white/80 placeholder:text-white/22 resize-none leading-relaxed"
            style={{ minHeight: "24px", maxHeight: "100px" }} />
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="cursor-pointer p-1.5 rounded-lg text-white/20 hover:text-white/45 transition" title="Attach brief">
              <Plus size={13} />
              <input type="file" className="hidden" accept=".pdf,.pptx,.docx,.png,.jpg"
                onChange={e => { const f = e.target.files?.[0]; if (f) setInput(p => p ? `${p} [brief: ${f.name}]` : `Brief: ${f.name}`); }} />
            </label>
            <button type="button" onClick={send} disabled={!input.trim() || loading}
              className={cn("flex items-center justify-center w-7 h-7 rounded-xl transition-all",
                input.trim() && !loading ? "bg-white text-black" : "bg-white/[0.06] text-white/20 cursor-not-allowed"
              )}>
              {loading ? <Loader2 size={12} className="animate-spin" /> : <ArrowUp size={12} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {remaining !== null && remaining >= 0 && (
          <p className="text-[10px] text-white/20 tabular-nums">
            {remaining > 0 ? `${remaining} AI queries left today` : "Daily limit reached"}
          </p>
        )}
        <button type="button" onClick={onClear}
          className="ml-auto flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition">
          <X size={11} /> Start over
        </button>
      </div>
    </div>
  );
}

// ── Main HeroBar export ──────────────────────────────────────────────────────
export function HeroBar({
  mode, onQueryChange, onRolesChange, onDiscover,
  showClear, onClear, onAIResults, onOpenBriefBuilder,
}: HeroBarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  type Phase = "biz-type" | "questions" | "activated";
  const [phase, setPhase] = useState<Phase>("biz-type");
  const [businessType, setBusinessType] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [dir, setDir] = useState(1);

  const handleBizSelect = (type: string) => {
    setBusinessType(type);
    setPhase("questions");
  };

  const handleAnswer = useCallback((answer: string | string[]) => {
    const q = QUESTIONS[qIndex];
    const next = { ...answers, [q.id]: answer };
    setAnswers(next);

    if (qIndex < QUESTIONS.length - 1) {
      setDir(1);
      setQIndex(i => i + 1);
    } else {
      // All questions answered — save to discovery store and activate Grok
      try {
        const roles = Array.isArray(next.roles) ? next.roles : next.roles ? [next.roles] : [];
        fetch("/api/discovery/brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            primaryObjective: next.objective ?? "",
            requestedRoles: roles,
            startTiming: next.timeline ?? "",
            budgetRange: next.budget ?? "",
            currentStep: 3,
            completed: true,
          }),
        }).catch(() => {});
      } catch { /* fire and forget */ }
      setPhase("activated");
    }
  }, [qIndex, answers]);

  const reset = useCallback(() => {
    setPhase("biz-type");
    setBusinessType("");
    setQIndex(0);
    setAnswers({});
    setDir(1);
    onAIResults?.([], "");
    onQueryChange?.("");
    onClear?.();
  }, [onAIResults, onQueryChange, onClear]);

  // Talent mode — unchanged
  if (mode === "talent") {
    return (
      <div className="flex flex-1 items-center gap-3">
        <div className="rounded-full bg-[#0D0D14] ring-1 ring-white/10 hover:ring-white/15 transition p-2 pl-5 pr-3 flex-1">
          <span className={cn("w-full block text-[15px] leading-8", session?.user ? "text-slate-200" : "text-slate-400/40")}>
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

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {phase === "biz-type" && (
          <BusinessTypeScreen key="biz" onSelect={handleBizSelect} />
        )}

        {phase === "questions" && (
          <QuestionScreen
            key={`q-${qIndex}`}
            question={QUESTIONS[qIndex]}
            qIndex={qIndex}
            total={QUESTIONS.length}
            onAnswer={handleAnswer}
            prevAnswer={answers[QUESTIONS[qIndex].id]}
          />
        )}

        {phase === "activated" && (
          <motion.div
            key="activated"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <AdvisorChat
              answers={answers}
              businessType={businessType}
              onAIResults={onAIResults}
              onDiscover={onDiscover}
              onClear={reset}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back nav during questions */}
      {phase === "questions" && qIndex > 0 && (
        <button type="button"
          onClick={() => { setDir(-1); setQIndex(i => i - 1); }}
          className="mt-3 text-[11px] text-white/25 hover:text-white/50 transition">
          ← Back
        </button>
      )}
    </div>
  );
}
