"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, Loader2, Plus, X, Sparkles } from "lucide-react";
import { curatedTalent } from "@/lib/curatedTalent";
import { useDiscoveryStore } from "@/store/useDiscoveryStore";
import {
  CLIENT_CAMPAIGN_STEPS,
  getClientBranchSteps,
  mapClientIntakeToDiscovery,
  buildClientAiSearchQuery,
  type ClientBranchStep,
} from "@/lib/clientIntakeBranch";

import {
  TALENT_COACH_SEQUENTIAL_STEPS,
  buildTalentDraftDigest,
  draftToProfileBody,
} from "@/lib/heroTalentIntake";
import { HeroTalentIntakeBar } from "@/components/talent/HeroTalentIntakeBar";
import {
  ARCHETYPE_CELEBRATION_ICON,
  ARCHETYPE_PUBLIC_BLURB,
  formatYoureArchetypeSentence,
  normalizePrismArchetypeLabel,
  type CreatorHiveArchetypeLabel,
} from "@/lib/talent-onboarding/prismPlaybook";
import { RoleFuzzyMultiPicker } from "@/components/onboarding/RoleFuzzyMultiPicker";

interface HeroBarProps {
  mode: "client" | "talent";
  onQueryChange?: (q: string) => void;
  onRolesChange?: (roles: string[]) => void;
  onDiscover?: () => void;
  /** Client only: open sign-in without jumping to talent gallery (e.g. brief upload while logged out) */
  onRequireSignIn?: () => void;
  showClear?: boolean;
  onClear?: () => void;
  onAIResults?: (ids: string[], summary: string) => void;
  onOpenBriefBuilder?: () => void;
  /** After profile save from hero talent flow */
  onTalentProfileSaved?: () => void;
}

const BIZ_TYPES = ["Brand / In-house", "Agency", "Startup / Founder", "Media / Publisher"];

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

SHOWCASE ROSTER (${curatedTalent.length} vetted profiles; IDs start with talent-):
${TALENT_CONTEXT}

YOUR ROLE: Senior media strategist. You know the showcase roster above; the chat API also attaches every creator who finished Creator Hive onboarding (IDs prefixed db:). Help brands find the right talent, build campaign strategy, and navigate UAE/GCC content marketing.

STYLE: Conversational and sharp. Reference creators by name. Keep responses to 2–3 sentences unless asked for detail.

TRIGGER TALENT SEARCH: When you have enough context to recommend creators — including when the user asks for more options, different roles, or alternatives — end your message with this exact JSON (no markdown, nothing after). The search layer matches against showcase + platform-onboarded talent.
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

type IntakePhase = { k: "biz" } | { k: "branch"; i: number } | { k: "camp"; i: number };

// ── Inline intake bar (questions inside the bar) ─────────────────────────────
function IntakeBar({
  onComplete,
  showSkipQuestions,
  onSkipToGrok,
  onSkipToTalentSearch,
  onBriefFile,
  uploadBusy,
  uploadError,
}: {
  onComplete: (answers: Record<string, string>, bizType: string) => void;
  showSkipQuestions?: boolean;
  onSkipToGrok?: () => void;
  onSkipToTalentSearch?: () => void;
  onBriefFile?: (file: File) => void;
  uploadBusy?: boolean;
  uploadError?: string | null;
}) {
  const [phase, setPhase] = useState<IntakePhase>({ k: "biz" });
  const [bizType, setBizType] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputVal, setInputVal] = useState("");
  const [rolePicks, setRolePicks] = useState<string[]>([]);
  const [fuzzyPicks, setFuzzyPicks] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const briefFileRef = useRef<HTMLInputElement>(null);

  const branchSteps = useMemo(() => (bizType ? getClientBranchSteps(bizType) : []), [bizType]);

  const { step, promptText, chips, totalSteps, stepIndex } = useMemo(() => {
    if (phase.k === "biz") {
      return {
        step: null as ClientBranchStep | null,
        promptText: "What type of business are you?",
        chips: BIZ_TYPES,
        totalSteps: 1 + 0 + CLIENT_CAMPAIGN_STEPS.length,
        stepIndex: 0,
      };
    }
    if (phase.k === "branch") {
      const b = branchSteps[phase.i];
      return {
        step: b ?? null,
        promptText: b?.prompt ?? "",
        chips: b?.chips ?? [],
        totalSteps: 1 + branchSteps.length + CLIENT_CAMPAIGN_STEPS.length,
        stepIndex: 1 + phase.i,
      };
    }
    const c = CLIENT_CAMPAIGN_STEPS[phase.i];
    return {
      step: c ?? null,
      promptText: c?.prompt ?? "",
      chips: c?.chips ?? [],
      totalSteps: 1 + branchSteps.length + CLIENT_CAMPAIGN_STEPS.length,
      stepIndex: 1 + branchSteps.length + phase.i,
    };
  }, [phase, branchSteps]);

  const { out: typedPrompt, done: promptDone } = useTypewriter(promptText, 20);

  useEffect(() => {
    if (promptDone) setTimeout(() => inputRef.current?.focus(), 80);
  }, [promptDone, phase]);

  useEffect(() => {
    if (phase.k !== "camp") return;
    const c = CLIENT_CAMPAIGN_STEPS[phase.i];
    if (c?.id !== "roles" || !c.rolePickerMulti) return;
    const raw = answers.roles?.trim();
    if (!raw) {
      setRolePicks([]);
      return;
    }
    try {
      const j = JSON.parse(raw) as unknown;
      setRolePicks(Array.isArray(j) ? j.map((x) => String(x).trim()).filter(Boolean) : []);
    } catch {
      setRolePicks(raw ? [raw] : []);
    }
  }, [phase, answers.roles]);

  const fuzzyPickStep = phase.k === "camp" ? CLIENT_CAMPAIGN_STEPS[phase.i] : null;
  const fuzzyPickRaw =
    fuzzyPickStep?.fuzzyPickMulti && fuzzyPickStep.id ? answers[fuzzyPickStep.id] : undefined;
  useEffect(() => {
    if (!fuzzyPickStep?.fuzzyPickMulti) return;
    const raw = fuzzyPickRaw?.trim();
    if (!raw) {
      setFuzzyPicks([]);
      return;
    }
    try {
      const j = JSON.parse(raw) as unknown;
      setFuzzyPicks(Array.isArray(j) ? j.map((x) => String(x).trim()).filter(Boolean) : []);
    } catch {
      setFuzzyPicks(raw ? [raw] : []);
    }
  }, [fuzzyPickStep?.id, fuzzyPickRaw]);

  const progress =
    totalSteps > 0 ? Math.min(1, (stepIndex + (promptDone ? 1 : 0.35)) / totalSteps) : 0.05;

  const goBack = useCallback(() => {
    setInputVal("");
    if (phase.k === "camp") {
      if (phase.i > 0) setPhase({ k: "camp", i: phase.i - 1 });
      else if (branchSteps.length > 0) setPhase({ k: "branch", i: branchSteps.length - 1 });
      else setPhase({ k: "biz" });
      return;
    }
    if (phase.k === "branch") {
      if (phase.i > 0) setPhase({ k: "branch", i: phase.i - 1 });
      else setPhase({ k: "biz" });
      return;
    }
  }, [phase, branchSteps.length]);

  const advance = useCallback(
    (raw: string) => {
      const isSkip = raw === "Skip";
      const val = isSkip ? "" : raw.trim();
      if (!isSkip && !val) return;

      if (phase.k === "biz") {
        setBizType(raw);
        setInputVal("");
        const br = getClientBranchSteps(raw);
        if (br.length > 0) setPhase({ k: "branch", i: 0 });
        else setPhase({ k: "camp", i: 0 });
        return;
      }

      if (phase.k === "branch") {
        const b = branchSteps[phase.i];
        if (!b) return;
        const next = { ...answers, [b.id]: val };
        setAnswers(next);
        setInputVal("");
        if (phase.i < branchSteps.length - 1) setPhase({ k: "branch", i: phase.i + 1 });
        else setPhase({ k: "camp", i: 0 });
        return;
      }

      const c = CLIENT_CAMPAIGN_STEPS[phase.i];
      if (!c) return;
      const next = { ...answers, [c.id]: val };
      setAnswers(next);
      setInputVal("");
      if (phase.i < CLIENT_CAMPAIGN_STEPS.length - 1) setPhase({ k: "camp", i: phase.i + 1 });
      else onComplete(next, bizType);
    },
    [phase, answers, bizType, branchSteps, onComplete],
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const t = inputVal.trim();
    if (phase.k !== "biz" && step?.optional && !t) return;
    if (t) advance(t);
  };

  const isRolePickerStep = Boolean(step?.rolePickerMulti);
  const isFuzzyPickStep = Boolean(step?.fuzzyPickMulti);
  const showInputRow = promptDone && phase.k !== "biz" && !isRolePickerStep && !isFuzzyPickStep;

  const canBack = phase.k !== "biz";

  const commitRolePicks = useCallback(() => {
    if (phase.k !== "camp") return;
    const c = CLIENT_CAMPAIGN_STEPS[phase.i];
    if (c?.id !== "roles" || !c.rolePickerMulti || rolePicks.length < 1) return;
    const next = { ...answers, roles: JSON.stringify(rolePicks) };
    setAnswers(next);
    setInputVal("");
    if (phase.i < CLIENT_CAMPAIGN_STEPS.length - 1) setPhase({ k: "camp", i: phase.i + 1 });
    else onComplete(next, bizType);
  }, [phase, answers, rolePicks, bizType, onComplete]);

  const commitFuzzyPicks = useCallback(() => {
    if (phase.k !== "camp") return;
    const c = CLIENT_CAMPAIGN_STEPS[phase.i];
    if (!c?.fuzzyPickMulti) return;
    const next = { ...answers, [c.id]: JSON.stringify(fuzzyPicks) };
    setAnswers(next);
    setInputVal("");
    if (phase.i < CLIENT_CAMPAIGN_STEPS.length - 1) setPhase({ k: "camp", i: phase.i + 1 });
    else onComplete(next, bizType);
  }, [phase, answers, fuzzyPicks, bizType, onComplete]);

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
          style={{ background: "linear-gradient(90deg, rgba(124,92,255,0.8), rgba(93,208,255,0.7))" }}
          animate={{ width: `${Math.max(progress * 100, 4)}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="px-5 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between gap-2 min-h-[28px]">
          {canBack ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 text-[11px] text-white/28 hover:text-white/50 transition shrink-0"
            >
              <ArrowLeft size={12} /> Back
            </button>
          ) : (
            <span />
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${phase.k}-${phase.k === "biz" ? "b" : phase.i}`}
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
            {promptDone && phase.k !== "biz" ? (
              <p className="text-[10px] text-white/30 mt-1.5 pl-[22px]">
                {isRolePickerStep
                  ? "Examples below — search the full role list or add custom titles."
                  : isFuzzyPickStep
                    ? "Pick any mix — chips are shortcuts; add custom lines if needed."
                    : "Examples below — type your own answer anytime."}
              </p>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showInputRow && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type your answer or pick below…"
                  className="flex-1 bg-transparent outline-none text-[14px] text-white/80 placeholder:text-white/20"
                />
                {inputVal.trim() ? (
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

        {promptDone && isRolePickerStep && step?.rolePickerMulti ? (
          <div className="space-y-3 pl-1">
            <RoleFuzzyMultiPicker
              value={rolePicks}
              onChange={setRolePicks}
              max={step.rolePickerMulti.max}
              quickChips={chips}
              placeholder="Search roles or type a custom need…"
            />
            <button
              type="button"
              onClick={commitRolePicks}
              disabled={rolePicks.length < 1}
              className={cn(
                "rounded-full px-4 py-2 text-[12px] font-semibold transition",
                rolePicks.length < 1 ? "bg-white/10 text-white/25 cursor-not-allowed" : "bg-white text-black hover:bg-white/90",
              )}
            >
              Continue{rolePicks.length > 0 ? ` (${rolePicks.length} roles)` : ""}
            </button>
          </div>
        ) : null}

        {promptDone && isFuzzyPickStep && step?.fuzzyPickMulti ? (
          <div className="space-y-3 pl-1">
            <RoleFuzzyMultiPicker
              value={fuzzyPicks}
              onChange={setFuzzyPicks}
              max={step.fuzzyPickMulti.max}
              ordered={step.fuzzyPickMulti.ordered ?? false}
              catalog={chips}
              quickChips={chips}
              placeholder="Search or type your own…"
            />
            <button
              type="button"
              onClick={commitFuzzyPicks}
              className="rounded-full px-4 py-2 text-[12px] font-semibold bg-white text-black hover:bg-white/90 transition"
            >
              Continue{fuzzyPicks.length > 0 ? ` (${fuzzyPicks.length} selected)` : ""}
            </button>
          </div>
        ) : null}

        <AnimatePresence>
          {promptDone && chips.length > 0 && !isRolePickerStep && !isFuzzyPickStep && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => advance(chip === "Skip" ? "Skip" : chip)}
                  className="rounded-full px-3 py-1 text-[11px] transition-all duration-100"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                  onMouseEnter={(e) => {
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

      <div
        className="border-t px-5 py-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <input
            ref={briefFileRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
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
              {uploadBusy ? "Reading your brief…" : "Already have a brief? Upload →"}
            </button>
          ) : null}
          {uploadError ? (
            <span className="text-[10px] text-rose-300/85 max-w-[200px] leading-snug">{uploadError}</span>
          ) : onBriefFile ? (
            <span className="text-[10px] text-white/22 hidden sm:inline">PDF, DOCX, or TXT</span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onSkipToTalentSearch ? (
            <button type="button" onClick={onSkipToTalentSearch} className="text-[11px] text-white/38 hover:text-white/62 transition">
              Skip to talent search →
            </button>
          ) : null}
          {showSkipQuestions && onSkipToGrok ? (
            <button type="button" onClick={onSkipToGrok} className="text-[11px] text-purple-400/60 hover:text-purple-300/80 transition">
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
  onReset,
  autoQuery,
  onBriefFile,
  skipAutoAiSearch,
  autoFocusInput,
}: {
  systemPrompt: string;
  welcomeMsg: string;
  onAIResults?: (ids: string[], summary: string) => void;
  onReset?: () => void;
  autoQuery?: string;
  onBriefFile?: (file: File) => void;
  /** When true, do not auto-run /api/ai-search on mount (parent already ran search) */
  skipAutoAiSearch?: boolean;
  autoFocusInput?: boolean;
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
      if (!res.ok && res.status !== 429) {
        setMessages((p) => [
          ...p,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Search didn't return results — try describing the role or campaign in more detail below.",
          },
        ]);
        return;
      }
      if (res.ok && Array.isArray(data.talentIds)) {
        if (data.rateLimit?.remaining !== undefined) setRemaining(data.rateLimit.remaining);
        onAIResults?.(data.talentIds, data.teamSummary ?? summary);
        if (data.talentIds.length > 0) {
          setMessages((p) => [
            ...p,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `Hive brief received. We'll build your team from ${data.talentIds.length} matched creator${data.talentIds.length === 1 ? "" : "s"} — profiles, personas and fit scores shown below.\n\n${data.teamSummary ?? summary}`,
              talentIds: data.talentIds,
            },
          ]);
        } else {
          setMessages((p) => [
            ...p,
            {
              id: Date.now().toString(),
              role: "assistant",
              content:
                "No matches returned for that query — try broader roles or ask for alternatives. Search covers showcase talent and creators who finished onboarding.",
            },
          ]);
        }
      }
    } catch { /* silent */ }
  }, [onAIResults]);

  useEffect(() => {
    if (!autoFocusInput) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 160);
    return () => window.clearTimeout(id);
  }, [autoFocusInput, welcomeMsg]);

  // Auto-trigger search on load if we have enough context
  useEffect(() => {
    if (skipAutoAiSearch || !autoQuery || didAutoSearch.current) return;
    didAutoSearch.current = true;
    setTimeout(() => triggerSearch(autoQuery, ""), 900);
  }, [autoQuery, triggerSearch, skipAutoAiSearch]);

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
                  {msg.talentIds && <p className="mt-1 text-[10px] text-purple-300/45">{msg.talentIds.length} creator{msg.talentIds.length === 1 ? "" : "s"} matched to your brief — see below ↓</p>}
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
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
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

/** Grok finalize — coach steps optional; intake digest carries PRISM + match fields */
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
  const totalSteps = Math.max(1, 1 + steps.length);
  /** -1 welcome, 0..steps.length-1 questions; if no steps, phase 1 = ready to save */
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
    putBody: Record<string, unknown>;
  } | null>(null);
  const [postArchNotes, setPostArchNotes] = useState("");
  const [notesSaveBusy, setNotesSaveBusy] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const progressTickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const flowComplete = steps.length === 0 ? phase >= 1 : phase >= steps.length;
  const currentStep = phase >= 0 && phase < steps.length ? steps[phase] : null;

  useEffect(() => {
    const fn = draft.firstName?.trim() || userName.split(/\s+/)[0] || "there";
    setWelcomeText(
      `Hi ${fn}. Tap Submit below to save your profile and reveal your "Hive Archetype" using our PRISM™ intelligence.`,
    );
    setWelcomeReady(true);
  }, [draft.firstName, userName]);

  useEffect(() => {
    if (currentStep?.id === "portfolio") {
      setUploadedAssetUrl(null);
      setUploadHint("");
    }
  }, [phase, currentStep?.id]);

  useEffect(() => {
    if (!finalizing) {
      if (progressTickerRef.current) {
        clearInterval(progressTickerRef.current);
        progressTickerRef.current = null;
      }
      return;
    }
    setSubmitProgress(0);
    const t0 = Date.now();
    progressTickerRef.current = setInterval(() => {
      const elapsed = Date.now() - t0;
      setSubmitProgress((prev) => Math.max(prev, Math.min(100, Math.floor((elapsed / 10_000) * 100))));
    }, 80);
    return () => {
      if (progressTickerRef.current) {
        clearInterval(progressTickerRef.current);
        progressTickerRef.current = null;
      }
    };
  }, [finalizing]);

  const promptText =
    phase === -1
      ? welcomeReady
        ? welcomeText
        : "Welcome — loading…"
      : flowComplete
        ? ""
        : (currentStep?.prompt ?? "");

  const typeSpeed = flowComplete ? 0 : 20;
  const { out: typedPrompt, done: promptDone } = useTypewriter(promptText, typeSpeed);

  useEffect(() => {
    if (promptDone && phase >= 0 && phase < steps.length) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [promptDone, phase, steps.length]);

  const progressFrac =
    steps.length === 0
      ? phase >= 1
        ? 1
        : 0.5
      : phase === -1
        ? 1 / totalSteps
        : flowComplete
          ? 1
          : (1 + phase + 1) / totalSteps;

  const linkCandidate = inputVal.trim();
  const hasPortfolioLink = Boolean(normalizeHttpUrl(linkCandidate));
  const hasPortfolioPayload = Boolean(uploadedAssetUrl) || hasPortfolioLink;

  const chips: string[] =
    phase === -1
      ? []
      : flowComplete || !currentStep
        ? []
        : [
            ...currentStep.chips,
            ...(currentStep.inputKind === "portfolio" && hasPortfolioPayload ? (["Continue"] as const) : []),
          ];

  const isPortfolioStep = currentStep?.inputKind === "portfolio";
  const showTextLine = steps.length > 0 && phase >= 0 && phase < steps.length;

  const goNext = useCallback(() => {
    setPhase((p) => p + 1);
    setInputVal("");
  }, []);

  const advance = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const isSkip = raw.startsWith("Skip");

      if (phase === -1) {
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
    [phase, flowComplete, currentStep, uploadedAssetUrl, goNext, linkCandidate],
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
          intakeDigest: buildTalentDraftDigest(draft),
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

      setSubmitProgress(100);
      setPostArchNotes("");
      setCelebration({
        primary,
        secondary,
        putBody,
      });
    } catch {
      setErr("Something went wrong — try again.");
    } finally {
      setFinalizing(false);
    }
  }, [draft, userName, welcomeText, steps, stepAnswers]);

  if (celebration) {
    const archKey = normalizePrismArchetypeLabel(celebration.primary);
    const iconChar =
      archKey && archKey in ARCHETYPE_CELEBRATION_ICON
        ? ARCHETYPE_CELEBRATION_ICON[archKey]
        : "✦";
    const blurb =
      celebration.primary in ARCHETYPE_PUBLIC_BLURB
        ? ARCHETYPE_PUBLIC_BLURB[celebration.primary as CreatorHiveArchetypeLabel]
        : null;

    const finishWithNotes = async () => {
      setNotesSaveBusy(true);
      setErr("");
      try {
        const notes = postArchNotes.trim();
        const body =
          notes.length > 0
            ? { ...celebration.putBody, onboardingMatchNotes: notes.slice(0, 4000) }
            : celebration.putBody;
        const putRes = await fetch("/api/onboarding/creator/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!putRes.ok) {
          const t = await putRes.text();
          setErr(t ? t.slice(0, 200) : "Could not save notes");
          setNotesSaveBusy(false);
          return;
        }
        const summaryBlurb = blurb ? blurb.slice(0, 220) : "";
        const head = formatYoureArchetypeSentence(celebration.primary);
        onDone({
          prismArchetype: celebration.primary,
          prismArchetypeSecondary: celebration.secondary,
          celebrationLine: summaryBlurb ? `${head} ${summaryBlurb}` : head,
        });
      } catch {
        setErr("Something went wrong — try again.");
      } finally {
        setNotesSaveBusy(false);
      }
    };

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
            <div className="space-y-2 flex-1 min-w-0">
              <p className="text-[20px] font-bold text-white/95 leading-tight">Congrats!</p>
              <div
                className="text-[40px] leading-none py-1 select-none"
                style={{
                  filter:
                    "drop-shadow(0 0 20px rgba(167, 139, 250, 0.9)) drop-shadow(0 0 10px rgba(124, 92, 255, 0.55))",
                }}
                aria-hidden
              >
                {iconChar}
              </div>
              <p className="text-[15px] font-semibold text-white/92 leading-snug">
                {formatYoureArchetypeSentence(celebration.primary)}
              </p>
              {blurb ? (
                <p className="text-[12px] text-white/58 leading-relaxed">{blurb}</p>
              ) : null}
              {celebration.secondary ? (
                <p className="text-[11px] text-purple-200/45">Also: {celebration.secondary}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-1.5 pt-1 border-t border-white/[0.08]">
            <p className="text-[12px] text-white/50">
              Any other notes, deal breakers, or preferences to share?{" "}
              <span className="text-white/30">(optional)</span>
            </p>
            <textarea
              value={postArchNotes}
              onChange={(e) => setPostArchNotes(e.target.value)}
              rows={3}
              placeholder="Type anything that helps us match you better…"
              className="w-full rounded-xl bg-transparent outline-none text-[13px] text-white/78 placeholder:text-white/22 border border-white/[0.1] px-3 py-2 resize-none"
            />
          </div>
          <button
            type="button"
            disabled={notesSaveBusy}
            onClick={() => void finishWithNotes()}
            className="w-full rounded-full bg-white py-2.5 text-xs font-semibold text-black hover:bg-white/90 transition disabled:opacity-50"
          >
            {notesSaveBusy ? "Saving…" : "Continue"}
          </button>
          {err ? <p className="text-[11px] text-rose-300/90">{err}</p> : null}
        </div>
      </div>
    );
  }

  const footerSubmitDisabled =
    finalizing || !welcomeReady || (phase >= 0 && !flowComplete);

  const handleFooterSubmit = () => {
    if (footerSubmitDisabled) return;
    if (phase === -1 && steps.length > 0) {
      setPhase(0);
      setInputVal("");
      return;
    }
    if (phase === -1 && steps.length === 0) {
      void finalize();
      return;
    }
    if (flowComplete) void finalize();
  };

  return (
    <div className="w-full flex flex-col">
      <div
        className="relative w-full rounded-2xl transition-all duration-300 overflow-hidden"
        style={{
          background: "rgba(10,10,18,0.92)",
          border: "1px solid rgba(124,92,255,0.30)",
          boxShadow: "0 0 40px rgba(124,92,255,0.12), 0 0 0 1px rgba(124,92,255,0.08)",
        }}
      >
        {finalizing ? (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6"
            style={{ background: "rgba(7,7,11,0.88)", backdropFilter: "blur(8px)" }}
          >
            <Loader2 size={28} className="animate-spin text-purple-300/90" />
            <p className="text-[12px] text-white/55 text-center">Saving your profile and Hive Archetype…</p>
            <div className="w-full max-w-[220px] h-1.5 rounded-full overflow-hidden bg-white/[0.08]">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${submitProgress}%`,
                  background: "linear-gradient(90deg, rgba(124,92,255,0.95), rgba(93,208,255,0.85))",
                }}
              />
            </div>
            <p className="text-[11px] tabular-nums text-white/35">{submitProgress}%</p>
          </div>
        ) : null}
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
          onClick={handleFooterSubmit}
          disabled={footerSubmitDisabled}
          className={cn(
            "rounded-full px-4 py-1.5 text-[11px] font-semibold transition",
            footerSubmitDisabled
              ? "bg-white/10 text-white/25 cursor-not-allowed"
              : "bg-white text-black hover:bg-white/90",
          )}
        >
          Submit
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
  onRequireSignIn,
  showClear,
  onClear,
  onAIResults,
  onTalentProfileSaved,
}: HeroBarProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const store = useDiscoveryStore();
  const hydrate = useDiscoveryStore((s) => s.hydrate);
  const resetDiscovery = useDiscoveryStore((s) => s.reset);

  const [skipAdvisorAutoSearch, setSkipAdvisorAutoSearch] = useState(false);
  const [focusAdvisorChatInput, setFocusAdvisorChatInput] = useState(false);
  // Pending intake answers stashed while user completes sign-in
  const [pendingClientAnswers, setPendingClientAnswers] = useState<{ answers: Record<string, string>; bizType: string } | null>(null);
  const [pendingTalentCompletion, setPendingTalentCompletion] = useState<{ draft: Record<string, string>; meta: import("@/components/talent/HeroTalentIntakeBar").TalentIntakeCompleteMeta } | null>(null);

  // track: "intake" | "returning-new" | "returning-resume" | "intake_searching" | "activated"
  type Track = "intake" | "returning-new" | "returning-resume" | "intake_searching" | "activated";
  const [track, setTrack] = useState<Track | null>(null);
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [welcomeOverride, setWelcomeOverride] = useState<string | null>(null);
  const [autoQueryOverride, setAutoQueryOverride] = useState<string | null>(null);
  const [advisorChatKey, setAdvisorChatKey] = useState(0);
  const [briefUploadBusy, setBriefUploadBusy] = useState(false);
  const [briefUploadErr, setBriefUploadErr] = useState<string | null>(null);
  const [discoveryRehydrated, setDiscoveryRehydrated] = useState(false);

  useEffect(() => {
    if (discoveryRehydrated) return;
    // Immediate check — if already hydrated or no persisted data, unblock instantly
    if (useDiscoveryStore.persist.hasHydrated()) {
      setDiscoveryRehydrated(true);
      return;
    }
    const unsub = useDiscoveryStore.persist.onFinishHydration(() => setDiscoveryRehydrated(true));
    // Hard fallback: max 500ms wait then unblock regardless
    const t = setTimeout(() => setDiscoveryRehydrated(true), 500);
    return () => { unsub(); clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const runAiSearchThenOpenAdvisor = useCallback(
    async (searchQuery: string, welcomeIntro: string | null) => {
      setSkipAdvisorAutoSearch(true);
      try {
        const res = await fetch("/api/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery }),
        });
        const data = (await res.json()) as {
          talentIds?: string[];
          teamSummary?: string;
          message?: string;
        };
        if (res.ok && Array.isArray(data.talentIds)) {
          onAIResults?.(data.talentIds, data.teamSummary ?? "");
          const sum = (data.teamSummary ?? "").trim();
          const intro = (welcomeIntro ?? "").trim();
          if (data.talentIds.length > 0) {
            const head = [intro, sum].filter((x) => x.length > 0).join(intro && sum ? "\n\n" : "\n");
            const tail = `Hive brief submitted. We'll set you up with a team of ${data.talentIds.length} creator${data.talentIds.length === 1 ? "" : "s"} whose personas, experience, and working style fit your brief. Browse their profiles below and add anyone to your pod to kick things off.`;
            setWelcomeOverride(
              [head, tail].filter((x) => x.length > 0).join("\n\n") ||
                "Brief submitted — your matched team is below. Add creators to your pod to get started.",
            );
          } else {
            setWelcomeOverride(
              intro ||
                "Brief saved — describe roles or style in chat and I'll search the full roster.",
            );
          }
        } else if (res.status === 429) {
          setWelcomeOverride(String(data.message ?? "Daily AI search limit reached — use chat to refine."));
        } else {
          setWelcomeOverride(
            welcomeIntro?.trim() ||
              "Brief saved — describe roles or style in chat and I'll search the full roster.",
          );
        }
      } catch {
        setWelcomeOverride(
          welcomeIntro?.trim() ||
            "Tell me what you're looking for and I'll run a fresh search across showcase + onboarded talent.",
        );
      } finally {
        setAutoQueryOverride(null);
        setAdvisorChatKey((k) => k + 1);
        setTrack("activated");
      }
    },
    [onAIResults],
  );

  const skipToTalentSearch = useCallback(() => {
    resetDiscovery();
    onAIResults?.([], "");
    onQueryChange?.("");
    setSkipAdvisorAutoSearch(false);
    setWelcomeOverride(
      "Skipping the briefing — describe the talent or campaign you need below and I'll run a fresh search. Open the gallery only when you want to browse cards.",
    );
    setAutoQueryOverride(null);
    setProfile({});
    setFocusAdvisorChatInput(true);
    window.setTimeout(() => setFocusAdvisorChatInput(false), 500);
    setAdvisorChatKey((k) => k + 1);
    setTrack("activated");
  }, [resetDiscovery, onAIResults, onQueryChange]);

  const handleBriefFile = useCallback(
    async (file: File) => {
      if (!session?.user) {
        onRequireSignIn?.();
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
            setAutoQueryOverride(null);
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
        const intro =
          data.assistantMessage?.trim() ||
          "I've pulled the key points from your brief — here's who fits first.";
        const searchQuery = buildClientAiSearchQuery({
          primaryObjective: sp.primaryObjective,
          requestedRoles: sp.requestedRoles,
          startTiming: sp.startTiming,
          budgetRange: sp.budgetRange,
          companyName: sp.companyName ?? null,
          industry: sp.industry ?? null,
          notes: sp.notes ?? null,
          clientFitProfile: null,
        });
        setTrack("intake_searching");
        await runAiSearchThenOpenAdvisor(searchQuery, intro);
      } catch {
        setBriefUploadErr("Something went wrong — try again");
      } finally {
        setBriefUploadBusy(false);
      }
    },
    [session?.user, onRequireSignIn, hydrate, runAiSearchThenOpenAdvisor],
  );

  const handleIntakeComplete = useCallback(
    async (answers: Record<string, string>, bizType: string) => {
      // Gate: if not signed in, stash answers and trigger sign-in. Resume after session appears.
      if (!session?.user) {
        setPendingClientAnswers({ answers, bizType });
        onRequireSignIn?.();
        return;
      }
      setWelcomeOverride(null);
      setTrack("intake_searching");
      const mapped = mapClientIntakeToDiscovery(answers, bizType);
      setProfile(mapped.profileFlat);
      hydrate({
        primaryObjective: mapped.primaryObjective,
        rankedObjectives: mapped.primaryObjective ? [mapped.primaryObjective] : [],
        requestedRoles: mapped.requestedRoles,
        startTiming: mapped.startTiming,
        budgetRange: mapped.budgetRange,
        companyName: mapped.companyName ?? "",
        industry: mapped.industry ?? "",
        notes: mapped.notes ?? "",
        clientFitProfile: mapped.clientFitProfile,
        currentStep: 3,
        completed: true,
      });
      await fetch("/api/discovery/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryObjective: mapped.primaryObjective,
          requestedRoles: mapped.requestedRoles,
          startTiming: mapped.startTiming,
          budgetRange: mapped.budgetRange,
          companyName: mapped.companyName,
          industry: mapped.industry,
          notes: mapped.notes,
          clientFitProfile: mapped.clientFitProfile,
          currentStep: 3,
          completed: true,
        }),
      }).catch(() => {});
      const searchQuery = buildClientAiSearchQuery({
        primaryObjective: mapped.primaryObjective,
        requestedRoles: mapped.requestedRoles,
        startTiming: mapped.startTiming,
        budgetRange: mapped.budgetRange,
        companyName: mapped.companyName,
        industry: mapped.industry,
        notes: mapped.notes,
        clientFitProfile: mapped.clientFitProfile,
      });
      await runAiSearchThenOpenAdvisor(searchQuery, "Hive brief submitted —");
    },
    [hydrate, runAiSearchThenOpenAdvisor, session?.user, onRequireSignIn],
  );

  // Resume pending client intake once session appears after sign-in gate
  useEffect(() => {
    if (!session?.user || !pendingClientAnswers) return;
    const { answers, bizType } = pendingClientAnswers;
    setPendingClientAnswers(null);
    handleIntakeComplete(answers, bizType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user, pendingClientAnswers]);

  // Resume pending talent intake once session appears after sign-in gate
  useEffect(() => {
    if (!session?.user || !pendingTalentCompletion) return;
    const { draft, meta } = pendingTalentCompletion;
    setPendingTalentCompletion(null);
    setTalentArchetype(null);
    if (meta.kind === "individual") {
      setTalentDraft(draft);
      setTalentGate("coach");
    } else {
      onTalentProfileSaved?.();
      setTalentGate("pending_review");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user, pendingTalentCompletion]);

  const handleReset = useCallback(() => {
    setWelcomeOverride(null);
    setAutoQueryOverride(null);
    setBriefUploadErr(null);
    setSkipAdvisorAutoSearch(false);
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
              onClick={() => {
                onTalentProfileSaved?.();
                router.push("/dashboard/creator");
              }}
              className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition"
            >
              Continue to dashboard
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
        <HeroTalentIntakeBar
          onComplete={(draft, meta) => {
            // Gate: if not signed in, stash completion and trigger sign-in
            if (!session?.user) {
              setPendingTalentCompletion({ draft, meta });
              onRequireSignIn?.();
              return;
            }
            setTalentArchetype(null);
            if (meta.kind === "individual") {
              setTalentDraft(draft);
              setTalentGate("coach");
              return;
            }
            onTalentProfileSaved?.();
            setTalentArchetype({
              prismArchetype: "The Conductor",
              celebrationLine:
                meta.kind === "rep_roster"
                  ? "Roster imported as drafts — invite talents to complete profiles when you're ready."
                  : "Talent drafts saved under your agency — you can add more anytime from the dashboard.",
            });
            setTalentGate("pending_review");
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
            onSkipToTalentSearch={skipToTalentSearch}
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
              setSkipAdvisorAutoSearch(false);
              setProfile(buildReturningProfile());
              setTrack("activated");
            }}
            onSkipToTalentSearch={skipToTalentSearch}
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
                  setSkipAdvisorAutoSearch(false);
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

      {/* Intake complete — AI match in progress */}
      {track === "intake_searching" && (
        <motion.div
          key="intake-searching"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <div
            className="w-full rounded-2xl px-5 py-6 flex flex-col items-center justify-center gap-3 min-h-[120px]"
            style={{
              background: "rgba(10,10,18,0.92)",
              border: "1px solid rgba(124,92,255,0.35)",
              boxShadow: "0 0 48px rgba(124,92,255,0.18), 0 0 0 1px rgba(124,92,255,0.1)",
            }}
          >
            <Loader2 size={22} className="animate-spin text-purple-300/90" style={{ filter: "drop-shadow(0 0 12px rgba(167,139,250,0.5))" }} />
            <p className="text-[13px] font-medium text-white/85 text-center" style={{ textShadow: "0 0 18px rgba(167,139,250,0.35)" }}>
              Finding your team…
            </p>
            <p className="text-[11px] text-white/38 text-center max-w-sm">
              Matching against showcase talent and creators who completed onboarding
            </p>
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
            onReset={handleReset}
            skipAutoAiSearch={skipAdvisorAutoSearch}
            autoFocusInput={focusAdvisorChatInput}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
