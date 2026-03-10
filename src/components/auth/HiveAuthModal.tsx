"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check, ChevronRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { feyTokens } from "@/lib/fey-design-tokens";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type Mode = "client" | "talent";
type Step = "auth" | "inbox" | "prism-intro" | "prism-q" | "prism-result" | "profile" | "done";

export type HiveAuthModalProps = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onSuccess: () => void;
};

/* ─────────────────────────────────────────
   PRISM DATA
───────────────────────────────────────── */
const PRISM_QUESTIONS = [
  {
    id: "canvas", label: "The Canvas",
    title: "When you start a creative project, what do you instinctively reach for?",
    optionA: { label: "A blank mood board", sub: "I start from feeling and build outward" },
    optionB: { label: "A brief or spreadsheet", sub: "I start from data and structure" },
  },
  {
    id: "horizon", label: "The Horizon",
    title: "Which gives you the most flow state?",
    optionA: { label: "Defining the campaign vision", sub: "Strategy, tone, the big why" },
    optionB: { label: "Perfecting the output", sub: "The edit, the caption, the finish" },
  },
  {
    id: "energy", label: "The Energy",
    title: "How do you produce your absolute best work?",
    optionA: { label: "Solo deep work", sub: "Uninterrupted, no noise, just flow" },
    optionB: { label: "In the room with a team", sub: "Energy and feedback fuel me" },
  },
  {
    id: "friction", label: "The Friction",
    title: "What drains your battery faster?",
    optionA: { label: "Rigid briefs and micromanagement", sub: "I need room to improvise" },
    optionB: { label: "Vague direction with no metrics", sub: "I need structure to thrive" },
  },
];

type DriverKey = "intuition" | "logic";
type ScopeKey  = "macro" | "micro";
type VariantKey = "outer" | "inner";

const ARCHETYPES: Record<string, { name: string; tagline: string; description: string; accent: string; accentBg: string; ring: string; emoji: string }> = {
  Maverick:   { name: "The Maverick",   tagline: "The Visionary Disruptor", description: "You break rules to find zero-to-one solutions. High vision, high risk tolerance — you work best when given autonomy to rewrite the brief.",                  accent: "rgba(251,191,36,0.9)",  accentBg: "rgba(251,191,36,0.08)",  ring: "rgba(251,191,36,0.25)",  emoji: "⚡" },
  Conductor:  { name: "The Conductor",  tagline: "The Harmoniser",          description: "You read the room and align creative chaos. Your emotional intelligence is your superpower — you make ambitious teams actually deliver.",                         accent: "rgba(244,114,182,0.9)", accentBg: "rgba(244,114,182,0.08)", ring: "rgba(244,114,182,0.25)", emoji: "🎼" },
  Pathfinder: { name: "The Pathfinder", tagline: "The Navigator",           description: "You see where things are going before anyone else — then map the data-backed route to get there. Strategy and KPIs are your language.",                         accent: "rgba(45,212,191,0.9)",  accentBg: "rgba(45,212,191,0.08)",  ring: "rgba(45,212,191,0.25)",  emoji: "🧭" },
  Translator: { name: "The Translator", tagline: "The Bridge",              description: "You sit between systems and audiences. Complex ideas become clarity in your hands — brands actually understand what you're saying.",                             accent: "rgba(34,211,238,0.9)",  accentBg: "rgba(34,211,238,0.08)",  ring: "rgba(34,211,238,0.25)",  emoji: "🔗" },
  Architect:  { name: "The Architect",  tagline: "The Builder",             description: "You build things that don't break. Obsessed with stability and systems that scale — you're the reason ambitious campaigns hold together.",                       accent: "rgba(96,165,250,0.9)",  accentBg: "rgba(96,165,250,0.08)",  ring: "rgba(96,165,250,0.25)",  emoji: "🏛" },
  Alchemist:  { name: "The Alchemist",  tagline: "The Scientist",           description: "You turn raw inputs into ROI. Heavy on experimentation — you don't guess, you run the test and let the output tell the story.",                                  accent: "rgba(251,146,60,0.9)",  accentBg: "rgba(251,146,60,0.08)",  ring: "rgba(251,146,60,0.25)",  emoji: "🧪" },
  Auteur:     { name: "The Auteur",     tagline: "The Artist",              description: "Your work is unmistakable. You have uncompromising vision and craft — the kind that requires deep focus and produces world-class output.",                       accent: "rgba(167,139,250,0.9)", accentBg: "rgba(167,139,250,0.08)", ring: "rgba(167,139,250,0.25)", emoji: "🎬" },
  Amplifier:  { name: "The Amplifier",  tagline: "The Voice",               description: "You take a brand message and make it resonate at scale. Reactive, culturally attuned — you live where audiences are and you speak their language.",             accent: "rgba(52,211,153,0.9)",  accentBg: "rgba(52,211,153,0.08)",  ring: "rgba(52,211,153,0.25)",  emoji: "📡" },
};

function scoreArchetype(answers: Record<string, string>) {
  const driver: DriverKey  = answers.canvas   === "A" ? "intuition" : "logic";
  const scope: ScopeKey    = answers.horizon  === "A" ? "macro"     : "micro";
  const variant: VariantKey = answers.energy  === "A" ? "outer"     : "inner";
  const key =
    driver === "intuition" && scope === "macro" && variant === "outer" ? "Maverick"   :
    driver === "intuition" && scope === "macro" && variant === "inner" ? "Conductor"  :
    driver === "logic"     && scope === "macro" && variant === "outer" ? "Pathfinder" :
    driver === "logic"     && scope === "macro" && variant === "inner" ? "Translator" :
    driver === "logic"     && scope === "micro" && variant === "outer" ? "Architect"  :
    driver === "logic"     && scope === "micro" && variant === "inner" ? "Alchemist"  :
    driver === "intuition" && scope === "micro" && variant === "outer" ? "Auteur"     : "Amplifier";
  return { key, ...ARCHETYPES[key] };
}

/* ─────────────────────────────────────────
   ROLE GROUPS (for profile step)
───────────────────────────────────────── */
const ROLE_GROUPS = [
  { group: "Video & Content", roles: ["Short-form Creator", "Long-form Creator", "UGC Creator", "Videographer", "Video Editor", "Motion Designer", "Photographer"] },
  { group: "Social & Strategy", roles: ["Social Media Manager", "Content Strategist", "Copywriter", "Arabic Copywriter", "Influencer / Creator"] },
  { group: "Production", roles: ["Creative Director", "Art Director", "Graphic Designer", "3D / CGI Artist"] },
  { group: "Operations", roles: ["Campaign Manager", "Producer", "Project Manager"] },
];

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X / Twitter", "LinkedIn", "Snapchat", "YouTube Shorts", "Website / Blog"];

const RATE_TYPES = [
  { id: "day_rate",    label: "Day rate",          hint: "Fixed daily fee for on-set or delivery work" },
  { id: "per_post",   label: "Per post/deliverable", hint: "Charged per piece of content" },
  { id: "retainer",   label: "Monthly retainer",  hint: "Ongoing brand partnership" },
  { id: "flexible",   label: "Flexible / TBD",    hint: "Discuss per brief" },
];

/* ─────────────────────────────────────────
   SHARED MOTION PRESET
───────────────────────────────────────── */
const SLIDE = {
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
};

/* ─────────────────────────────────────────
   GOOGLE ICON
───────────────────────────────────────── */
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.082 17.64 11.836 17.64 9.2z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

/* ─────────────────────────────────────────
   AUTH STEP (shared client + talent)
───────────────────────────────────────── */
function AuthStep({
  mode, email, setEmail, submitting, error,
  onEmailSubmit, onGoogleClick,
}: {
  mode: Mode; email: string; setEmail: (v: string) => void;
  submitting: boolean; error: string;
  onEmailSubmit: () => void; onGoogleClick: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typing = email.length > 0;

  const blurStyle = (suppress?: boolean): React.CSSProperties => ({
    opacity: (typing && !suppress) ? 0 : 1,
    filter:  (typing && !suppress) ? "blur(5px)" : "none",
    transition: "opacity 0.35s ease, filter 0.35s ease",
    pointerEvents: (typing && !suppress) ? "none" : "auto",
  });

  const headingText = mode === "client"
    ? { pre: "Discover the talent.", grad: "Creator Hive." }
    : { pre: "Join the Hive.", grad: "Creator Hive." };

  const subtitle = mode === "client"
    ? "Enter your work email to access UAE's most vetted creator marketplace."
    : "Your application starts here. We'll match you to campaigns that fit who you are.";

  return (
    <div className="w-full flex flex-col items-center gap-7">

      {/* Heading — blurs when typing */}
      <div className="text-center space-y-2.5" style={blurStyle()}>
        <h1 className="text-[30px] sm:text-[34px] font-light tracking-[-0.03em] leading-tight">
          <span style={{ color: "rgba(255,255,255,0.88)" }}>{headingText.pre} </span>
          <span style={{
            background: "linear-gradient(100deg, #9B7FFF 0%, #C4AEFF 45%, #5DD0FF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>{headingText.grad}</span>
        </h1>
        <p className="text-[14px] font-light max-w-[340px] mx-auto" style={{ color: "rgba(255,255,255,0.42)" }}>
          {subtitle}
        </p>
      </div>

      {/* Email input */}
      <div className="w-full max-w-[400px] space-y-3">
        <div
          className="flex items-center rounded-full px-5 transition-all duration-200"
          style={{
            height: "52px",
            background: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${focused ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)"}`,
            boxShadow: focused ? "0 0 0 3px rgba(155,127,255,0.08)" : "none",
          }}
        >
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => { if (e.key === "Enter" && email.trim()) onEmailSubmit(); }}
            placeholder="account email"
            autoFocus
            className="flex-1 bg-transparent outline-none text-[15px] font-light min-w-0"
            style={{ color: "rgba(255,255,255,0.90)", caretColor: "rgba(155,127,255,0.9)" }}
          />
          <button
            type="button"
            onClick={onEmailSubmit}
            disabled={!email.trim() || submitting}
            className="flex-shrink-0 flex items-center justify-center rounded-full ml-2 transition-all duration-200"
            style={{
              width: "34px", height: "34px",
              background: email.trim() ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.09)",
              color: email.trim() ? "#07070B" : "rgba(255,255,255,0.30)",
            }}
          >
            {submitting
              ? <span className="block w-4 h-4 rounded-full border-2 border-current/20 border-t-current animate-spin" />
              : <ArrowRight size={15} strokeWidth={2.5} />
            }
          </button>
        </div>
        {error && (
          <p className="text-[12px] text-center" style={{ color: "rgba(251,113,133,0.85)" }}>{error}</p>
        )}
      </div>

      {/* Google option — blurs when typing */}
      <div style={blurStyle()}>
        <button
          type="button"
          onClick={onGoogleClick}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-150"
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.65)",
            fontSize: "14px",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <GoogleG />
          {mode === "client" ? "Continue with Google" : "Sign up with Google"}
        </button>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────
   CHECK INBOX STEP
───────────────────────────────────────── */
function InboxStep({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="w-full max-w-[400px] mx-auto flex flex-col items-center gap-7 text-center">
      <div className="space-y-2.5">
        <h1 className="text-[30px] sm:text-[34px] font-light tracking-[-0.03em]">
          <span style={{ color: "rgba(255,255,255,0.88)" }}>Check your </span>
          <span style={{ background: "linear-gradient(100deg,#9B7FFF,#5DD0FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>inbox.</span>
        </h1>
        <p className="text-[14px] font-light" style={{ color: "rgba(255,255,255,0.42)" }}>
          We've sent you a secure link to authenticate your account.
        </p>
      </div>

      <div className="w-full max-w-[400px]">
        <div
          className="flex items-center rounded-full px-5"
          style={{ height: "52px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <span className="flex-1 text-[15px] font-light text-left" style={{ color: "rgba(255,255,255,0.85)" }}>{email}</span>
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.30)" }}>
            <Check size={14} style={{ color: "rgba(52,211,153,0.9)" }} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <button type="button" onClick={onBack} className="text-[13px] transition-opacity hover:opacity-60" style={{ color: "rgba(255,255,255,0.30)" }}>
        ← Back to Signup
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   PRISM INTRO STEP
───────────────────────────────────────── */
function PrismIntroStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="w-full max-w-[440px] mx-auto flex flex-col items-center gap-7 text-center">
      <div className="space-y-3">
        <p className="text-[11px] tracking-[0.16em] uppercase font-medium" style={{ color: "rgba(155,127,255,0.7)" }}>
          Before we match you
        </p>
        <h2 className="text-[26px] font-light tracking-[-0.03em]" style={{ color: "rgba(255,255,255,0.92)" }}>
          Discover your Origin Story.
        </h2>
        <p className="text-[14px] font-light leading-relaxed max-w-[320px] mx-auto" style={{ color: "rgba(255,255,255,0.42)" }}>
          4 questions. 60 seconds. We map how you think, create, and deliver — so brands get matched to the right version of you.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full max-w-[400px]">
        {Object.values(ARCHETYPES).map((a) => (
          <div key={a.name} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl"
            style={{ background: a.accentBg, border: `1px solid ${a.ring}` }}>
            <span className="text-[18px]">{a.emoji}</span>
            <span className="text-[9px] font-medium leading-tight" style={{ color: a.accent }}>
              {a.name.replace("The ", "")}
            </span>
          </div>
        ))}
      </div>

      <button type="button" onClick={onStart}
        className="flex items-center gap-2 px-8 py-3.5 rounded-full text-[14px] font-medium transition-all"
        style={{ background: "rgba(255,255,255,0.93)", color: "#07070B" }}>
        Begin <ChevronRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   PRISM QUESTION STEP
───────────────────────────────────────── */
function PrismQuestionStep({ q, qIndex, total, onAnswer }: {
  q: typeof PRISM_QUESTIONS[0]; qIndex: number; total: number;
  onAnswer: (k: "A" | "B") => void;
}) {
  const pct = Math.round(((qIndex + 1) / total) * 100);
  return (
    <div className="w-full max-w-[440px] mx-auto space-y-7">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "rgba(155,127,255,0.6)" }}>{q.label}</p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>{qIndex + 1} / {total}</p>
        </div>
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div className="h-full rounded-full" style={{ background: "rgba(155,127,255,0.55)" }}
            initial={{ width: `${(qIndex / total) * 100}%` }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }} />
        </div>
      </div>

      <h3 className="text-[20px] font-light tracking-[-0.025em] leading-snug" style={{ color: "rgba(255,255,255,0.92)" }}>
        {q.title}
      </h3>

      <div className="space-y-3">
        {(["A", "B"] as const).map(key => {
          const opt = key === "A" ? q.optionA : q.optionB;
          return (
            <button key={key} type="button" onClick={() => onAnswer(key)}
              className="w-full text-left p-4 rounded-2xl transition-all duration-150"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(155,127,255,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(155,127,255,0.22)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>
                  {key}
                </div>
                <div>
                  <p className="text-[15px] font-light" style={{ color: "rgba(255,255,255,0.88)" }}>{opt.label}</p>
                  <p className="text-[12px] mt-0.5 font-light" style={{ color: "rgba(255,255,255,0.38)" }}>{opt.sub}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PRISM RESULT STEP
───────────────────────────────────────── */
function PrismResultStep({ archetype, onContinue }: {
  archetype: ReturnType<typeof scoreArchetype>; onContinue: () => void;
}) {
  return (
    <div className="w-full max-w-[440px] mx-auto flex flex-col items-center gap-7 text-center">
      <motion.div className="rounded-2xl p-7 w-full space-y-4"
        style={{ background: archetype.accentBg, border: `1px solid ${archetype.ring}` }}
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
        <div className="text-[44px]">{archetype.emoji}</div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1.5" style={{ color: archetype.accent }}>
            {archetype.tagline}
          </p>
          <h2 className="text-[28px] font-light tracking-[-0.03em]" style={{ color: "rgba(255,255,255,0.95)" }}>
            {archetype.name}
          </h2>
        </div>
      </motion.div>

      <p className="text-[14px] font-light leading-relaxed max-w-[360px]" style={{ color: "rgba(255,255,255,0.50)" }}>
        {archetype.description}
      </p>

      <button type="button" onClick={onContinue}
        className="flex items-center gap-2 px-8 py-3.5 rounded-full text-[14px] font-medium transition-all"
        style={{ background: archetype.accent.replace("0.9)", "0.92)"), color: "#07070B" }}>
        Build your profile <ChevronRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   PROFILE STEP
───────────────────────────────────────── */
function ProfileStep({
  archetype, onSubmit,
}: {
  archetype: ReturnType<typeof scoreArchetype>;
  onSubmit: (data: Record<string, unknown>) => void;
}) {
  const [name, setName]         = useState("");
  const [igHandle, setIgHandle] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [handle, setHandle]     = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [roles, setRoles]       = useState<string[]>([]);
  const [rateType, setRateType] = useState("day_rate");
  const [rateAmount, setRateAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleRole = (r: string) =>
    setRoles(p => p.includes(r) ? p.filter(x => x !== r) : p.length < 3 ? [...p, r] : p);

  const canSubmit = name.trim() && igHandle.trim() && roles.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700));
    onSubmit({ name, igHandle, platform, handle, portfolio, roles, rateType, rateAmount, archetypeName: archetype.name });
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)", borderRadius: "12px",
    padding: "12px 16px", fontSize: "14px", fontWeight: 300,
    color: "rgba(255,255,255,0.88)", outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div className="w-full max-w-[480px] mx-auto space-y-6">
      <div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-3"
          style={{ background: archetype.accentBg, border: `1px solid ${archetype.ring}`, color: archetype.accent }}>
          {archetype.emoji} {archetype.name}
        </span>
        <h2 className="text-[22px] font-light tracking-[-0.025em]" style={{ color: "rgba(255,255,255,0.92)" }}>
          Now tell us about your work.
        </h2>
        <p className="text-[13px] mt-1 font-light" style={{ color: "rgba(255,255,255,0.38)" }}>
          This shapes how brands discover and evaluate you.
        </p>
      </div>

      {/* Name */}
      <Field label="Full name" required>
        <input style={fieldStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" autoFocus />
      </Field>

      {/* Primary IG handle */}
      <Field label="Instagram handle" required hint="Your main account — even if you create elsewhere">
        <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.04)" }}>
          <span className="px-3 text-[14px]" style={{ color: "rgba(255,255,255,0.28)" }}>@</span>
          <input style={{ ...fieldStyle, border: "none", background: "transparent", paddingLeft: 0, borderRadius: 0 }}
            value={igHandle} onChange={e => setIgHandle(e.target.value)} placeholder="yourhandle" />
        </div>
      </Field>

      {/* Primary platform + handle */}
      <Field label="Primary content platform" hint="Where you publish most">
        <div className="flex gap-2">
          <select style={{ ...fieldStyle, width: "156px", flexShrink: 0 }} value={platform}
            onChange={e => setPlatform(e.target.value)}>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input style={{ ...fieldStyle, flex: 1 }} value={handle}
            onChange={e => setHandle(e.target.value)} placeholder="@handle or URL" />
        </div>
      </Field>

      {/* Portfolio */}
      <Field label="Portfolio / showreel" hint="Optional — link to your best work">
        <input style={fieldStyle} value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://..." />
      </Field>

      {/* Roles */}
      <div>
        <div className="flex items-baseline gap-2 mb-3">
          <label className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>
            What do you create? <span style={{ color: "rgba(155,127,255,0.7)" }}>*</span>
          </label>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>Pick up to 3</span>
        </div>
        {ROLE_GROUPS.map(g => (
          <div key={g.group} className="mb-3">
            <p className="text-[9px] uppercase tracking-[0.12em] mb-1.5" style={{ color: "rgba(255,255,255,0.22)" }}>{g.group}</p>
            <div className="flex flex-wrap gap-1.5">
              {g.roles.map(r => {
                const active = roles.includes(r);
                const maxed  = !active && roles.length >= 3;
                return (
                  <button key={r} type="button" onClick={() => toggleRole(r)} disabled={maxed}
                    className="px-3 py-1.5 rounded-xl text-[12px] font-light transition-all duration-100"
                    style={{
                      background: active ? "rgba(155,127,255,0.14)" : "rgba(255,255,255,0.04)",
                      border: active ? "1px solid rgba(155,127,255,0.40)" : "1px solid rgba(255,255,255,0.07)",
                      color: active ? "rgba(196,174,255,0.95)" : maxed ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.55)",
                      opacity: maxed ? 0.5 : 1,
                    }}>
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Rate structure */}
      <div>
        <div className="flex items-baseline gap-2 mb-3">
          <label className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>
            How do you prefer to charge?
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {RATE_TYPES.map(rt => (
            <button key={rt.id} type="button" onClick={() => setRateType(rt.id)}
              className="text-left px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: rateType === rt.id ? "rgba(155,127,255,0.10)" : "rgba(255,255,255,0.03)",
                border: rateType === rt.id ? "1px solid rgba(155,127,255,0.35)" : "1px solid rgba(255,255,255,0.07)",
              }}>
              <p className="text-[12px] font-medium" style={{ color: rateType === rt.id ? "rgba(196,174,255,0.95)" : "rgba(255,255,255,0.65)" }}>
                {rt.label}
              </p>
              <p className="text-[10px] mt-0.5 font-light" style={{ color: "rgba(255,255,255,0.30)" }}>{rt.hint}</p>
            </button>
          ))}
        </div>
        {rateType !== "flexible" && (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-light shrink-0" style={{ color: "rgba(255,255,255,0.40)" }}>AED</span>
            <input style={{ ...fieldStyle }} value={rateAmount} onChange={e => setRateAmount(e.target.value)}
              placeholder="e.g. 2,500" type="text" />
          </div>
        )}
        <p className="text-[10px] mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.22)" }}>
          * Rates are indicative. Creator Hive will communicate a suggested rate for your approval before any engagement — this may not be the final rate.
        </p>
      </div>

      {/* Submit */}
      <button type="button" onClick={handleSubmit} disabled={!canSubmit || submitting}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-[14px] font-medium transition-all"
        style={{
          background: canSubmit ? "rgba(255,255,255,0.93)" : "rgba(255,255,255,0.08)",
          color: canSubmit ? "#07070B" : "rgba(255,255,255,0.30)",
        }}>
        {submitting
          ? <><span className="w-4 h-4 rounded-full border-2 border-current/20 border-t-current animate-spin" /> Submitting…</>
          : <>Submit application <ArrowRight size={15} strokeWidth={2.5} /></>
        }
      </button>
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <label className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>
          {label}{required && <span style={{ color: "rgba(155,127,255,0.7)" }}> *</span>}
        </label>
        {hint && <span className="text-[10px] font-light" style={{ color: "rgba(255,255,255,0.22)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   DONE STEP
───────────────────────────────────────── */
function DoneStep({ firstName, archetype }: { firstName: string; archetype?: ReturnType<typeof scoreArchetype> }) {
  return (
    <div className="w-full max-w-[440px] mx-auto flex flex-col items-center gap-7 text-center">
      <motion.div className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.28)", boxShadow: "0 0 32px rgba(52,211,153,0.14)" }}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}>
        <Check size={26} style={{ color: "rgba(52,211,153,0.9)" }} strokeWidth={2} />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-[28px] font-light tracking-[-0.03em]" style={{ color: "rgba(255,255,255,0.92)" }}>
          {firstName ? `You're in, ${firstName}.` : "Application received."}
        </h2>
        <p className="text-[14px] font-light max-w-[320px] mx-auto" style={{ color: "rgba(255,255,255,0.40)" }}>
          Your profile is under review. Our team will reach out within 48 hours to confirm your spot in the Hive.
        </p>
      </div>

      {archetype && (
        <div className="px-5 py-3 rounded-2xl" style={{ background: archetype.accentBg, border: `1px solid ${archetype.ring}` }}>
          <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: archetype.accent }}>{archetype.emoji} {archetype.name}</p>
          <p className="text-[11px] mt-0.5 font-light" style={{ color: "rgba(255,255,255,0.40)" }}>"{archetype.tagline}"</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   ROOT MODAL COMPONENT
───────────────────────────────────────── */
export function HiveAuthModal({ open, mode, onClose, onSuccess }: HiveAuthModalProps) {
  const [step, setStep]           = useState<Step>("auth");
  const [email, setEmail]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [prismAnswers, setPrismAnswers] = useState<Record<string, string>>({});
  const [qIndex, setQIndex]       = useState(0);
  const [archetype, setArchetype] = useState<ReturnType<typeof scoreArchetype> | null>(null);
  const [profileFirstName, setProfileFirstName] = useState("");

  useEffect(() => {
    if (!open) {
      setStep("auth"); setEmail(""); setSubmitting(false); setError("");
      setPrismAnswers({}); setQIndex(0); setArchetype(null); setProfileFirstName("");
    }
  }, [open]);

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    setError("");
    setSubmitting(true);

    // Try NextAuth, fall back gracefully in dev
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        userType: mode,
        displayName: email.split("@")[0],
      });
      if (result?.ok || !result?.error || result.error.toLowerCase().includes("configuration")) {
        localStorage.setItem(`ch_${mode}_email`, email.trim().toLowerCase());
      } else {
        setError("Couldn't send sign-in link. Please try again.");
        setSubmitting(false);
        return;
      }
    } catch {
      localStorage.setItem(`ch_${mode}_email`, email.trim().toLowerCase());
    }

    setSubmitting(false);
    if (mode === "client") {
      setStep("inbox");
      setTimeout(() => { onSuccess(); }, 1800);
    } else {
      setStep("prism-intro");
    }
  };

  const handleGoogleClick = () => {
    signIn("google", { callbackUrl: mode === "talent" ? "/onboarding/step-1" : "/dashboard/campaigns" });
  };

  const handlePrismAnswer = (key: "A" | "B") => {
    const q = PRISM_QUESTIONS[qIndex];
    const next = { ...prismAnswers, [q.id]: key };
    setPrismAnswers(next);
    if (qIndex < PRISM_QUESTIONS.length - 1) {
      setQIndex(i => i + 1);
    } else {
      setArchetype(scoreArchetype(next));
      setStep("prism-result");
    }
  };

  const handleProfileSubmit = (data: Record<string, unknown>) => {
    setProfileFirstName((data.name as string).split(" ")[0]);
    setStep("done");
    setTimeout(() => { onSuccess(); onClose(); }, 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9000] flex flex-col"
          style={{ background: "#07070B" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Purple spotlight */}
          <div className="pointer-events-none fixed inset-0"
            style={{ background: "radial-gradient(ellipse 800px 500px at 50% 40%, rgba(124,92,255,0.14) 0%, transparent 65%)", zIndex: 0 }} />

          {/* Close button */}
          <button type="button" onClick={onClose}
            className="fixed top-6 left-6 z-10 flex items-center justify-center rounded-full transition-colors"
            style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}>
            <X size={15} strokeWidth={2} />
          </button>

          {/* Scrollable content area */}
          <div className="relative z-10 flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1 flex items-center justify-center px-6 py-20">
              <div className="w-full max-w-[520px]">
                <AnimatePresence mode="wait">
                  {step === "auth" && (
                    <motion.div key="auth" {...SLIDE}>
                      <AuthStep mode={mode} email={email} setEmail={setEmail}
                        submitting={submitting} error={error}
                        onEmailSubmit={handleEmailSubmit} onGoogleClick={handleGoogleClick} />
                    </motion.div>
                  )}
                  {step === "inbox" && (
                    <motion.div key="inbox" {...SLIDE}>
                      <InboxStep email={email} onBack={() => setStep("auth")} />
                    </motion.div>
                  )}
                  {step === "prism-intro" && (
                    <motion.div key="prism-intro" {...SLIDE}>
                      <PrismIntroStep onStart={() => { setQIndex(0); setStep("prism-q"); }} />
                    </motion.div>
                  )}
                  {step === "prism-q" && (
                    <motion.div key={`prism-q-${qIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      <PrismQuestionStep q={PRISM_QUESTIONS[qIndex]} qIndex={qIndex} total={PRISM_QUESTIONS.length} onAnswer={handlePrismAnswer} />
                    </motion.div>
                  )}
                  {step === "prism-result" && archetype && (
                    <motion.div key="prism-result" {...SLIDE}>
                      <PrismResultStep archetype={archetype} onContinue={() => setStep("profile")} />
                    </motion.div>
                  )}
                  {step === "profile" && archetype && (
                    <motion.div key="profile" {...SLIDE}>
                      <ProfileStep archetype={archetype} onSubmit={handleProfileSubmit} />
                    </motion.div>
                  )}
                  {step === "done" && (
                    <motion.div key="done" {...SLIDE}>
                      <DoneStep firstName={profileFirstName} archetype={archetype ?? undefined} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom bar — Fey-style */}
            {(step === "auth" || step === "inbox") && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="flex-shrink-0 flex items-center justify-between px-6 py-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold"
                    style={{ background: "rgba(124,92,255,0.20)", color: "rgba(155,127,255,0.90)" }}>
                    CH
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Creator Hive</span>
                </div>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.20)" }}>
                  By signing up, you agree to our{" "}
                  <a href="/terms" className="underline hover:no-underline" style={{ color: "rgba(255,255,255,0.35)" }}>Terms of Service</a>.
                </p>
              </motion.div>
            )}
          </div>

          {/* Inline styles for native selects */}
          <style>{`
            select option { background: #111118; color: rgba(255,255,255,0.88); }
            input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22) !important; }
            input:focus, select:focus, textarea:focus { border-color: rgba(155,127,255,0.45) !important; }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
