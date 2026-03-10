"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check, ChevronRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeyMeshLayer } from "@/components/campaigns/primitives/FeyMeshLayer";

/* ─────────────────────────────────────────────
   PRISM TYPES & SCORING
───────────────────────────────────────────── */
type Driver = "intuition" | "logic";
type Scope = "macro" | "micro";
type Variant = "outer" | "inner";

type PrismAnswers = {
  driver: Driver | null;
  scope: Scope | null;
  variant: Variant | null;
  friction: "A" | "B" | null;
};

type Archetype = {
  name: string;
  tagline: string;
  description: string;
  accent: string;
  accentBg: string;
  ring: string;
  emoji: string;
};

const ARCHETYPES: Record<string, Archetype> = {
  "Maverick":   { name: "The Maverick",   tagline: "The Visionary Disruptor", description: "You break rules to find zero-to-one solutions. High vision, high risk tolerance — you work best when given autonomy to rewrite the brief.", accent: "rgba(251,191,36,0.9)",  accentBg: "rgba(251,191,36,0.08)", ring: "rgba(251,191,36,0.25)", emoji: "⚡" },
  "Conductor":  { name: "The Conductor",  tagline: "The Harmonizer",          description: "You read the room and align creative chaos. Your emotional intelligence is your superpower — you make ambitious teams actually work.",      accent: "rgba(244,114,182,0.9)", accentBg: "rgba(244,114,182,0.08)", ring: "rgba(244,114,182,0.25)", emoji: "🎼" },
  "Pathfinder": { name: "The Pathfinder", tagline: "The Navigator",           description: "You see where things are going before anyone else — then map the data-backed route to get there. Strategy and KPIs are your language.",    accent: "rgba(45,212,191,0.9)",  accentBg: "rgba(45,212,191,0.08)",  ring: "rgba(45,212,191,0.25)",  emoji: "🧭" },
  "Translator": { name: "The Translator", tagline: "The Bridge",              description: "You sit between systems and humans. Complex ideas become clarity in your hands — stakeholders actually understand what engineers built.",     accent: "rgba(34,211,238,0.9)",  accentBg: "rgba(34,211,238,0.08)",  ring: "rgba(34,211,238,0.25)",  emoji: "🔗" },
  "Architect":  { name: "The Architect",  tagline: "The Builder",             description: "You build things that don't break. Obsessed with stability, efficiency, and systems that scale — you're the reason everything holds together.", accent: "rgba(96,165,250,0.9)",  accentBg: "rgba(96,165,250,0.08)",  ring: "rgba(96,165,250,0.25)",  emoji: "🏛" },
  "Alchemist":  { name: "The Alchemist",  tagline: "The Scientist",           description: "You turn raw data into ROI. Heavy on experimentation and growth hacking — you don't guess, you run the test and let the numbers tell the story.", accent: "rgba(251,146,60,0.9)",  accentBg: "rgba(251,146,60,0.08)",  ring: "rgba(251,146,60,0.25)",  emoji: "🧪" },
  "Auteur":     { name: "The Auteur",     tagline: "The Artist",              description: "Your work is unmistakable. You have uncompromising vision and craft — the kind that requires deep focus and produces world-class output.",      accent: "rgba(167,139,250,0.9)", accentBg: "rgba(167,139,250,0.08)", ring: "rgba(167,139,250,0.25)", emoji: "🎬" },
  "Amplifier":  { name: "The Amplifier",  tagline: "The Voice",               description: "You take a brand message and make it heard at scale. Reactive, high-energy, socially attuned — you live where culture happens.",               accent: "rgba(52,211,153,0.9)",  accentBg: "rgba(52,211,153,0.08)",  ring: "rgba(52,211,153,0.25)",  emoji: "📡" },
};

function scoreArchetype(a: PrismAnswers): Archetype {
  const { driver, scope, variant } = a;
  const key =
    driver === "intuition" && scope === "macro" && variant === "outer" ? "Maverick"   :
    driver === "intuition" && scope === "macro" && variant === "inner" ? "Conductor"  :
    driver === "logic"     && scope === "macro" && variant === "outer" ? "Pathfinder" :
    driver === "logic"     && scope === "macro" && variant === "inner" ? "Translator" :
    driver === "logic"     && scope === "micro" && variant === "outer" ? "Architect"  :
    driver === "logic"     && scope === "micro" && variant === "inner" ? "Alchemist"  :
    driver === "intuition" && scope === "micro" && variant === "outer" ? "Auteur"     :
    "Amplifier";
  return ARCHETYPES[key];
}

/* ─────────────────────────────────────────────
   PRISM QUESTIONS
───────────────────────────────────────────── */
type Question = {
  id: string;
  label: string;
  title: string;
  optionA: { label: string; sub: string };
  optionB: { label: string; sub: string };
};

const PRISM_QUESTIONS: Question[] = [
  {
    id: "canvas",
    label: "The Canvas",
    title: "When you start a project, what do you instinctively reach for?",
    optionA: { label: "Blank sheet or mood board", sub: "I start from feeling and build outward" },
    optionB: { label: "Spreadsheet or code editor", sub: "I start from data and logic" },
  },
  {
    id: "horizon",
    label: "The Horizon",
    title: "Which phase gives you the most flow state?",
    optionA: { label: "Defining the 5-year vision", sub: "Strategy, brand architecture, the \"why\"" },
    optionB: { label: "Perfecting the specific details", sub: "Execution, craft, pixel-perfect output" },
  },
  {
    id: "energy",
    label: "The Energy",
    title: "How do you produce your absolute best work?",
    optionA: { label: "The Cave", sub: "Deep, uninterrupted solitary focus" },
    optionB: { label: "The Pit", sub: "High-energy collaboration with a team" },
  },
  {
    id: "friction",
    label: "The Friction",
    title: "What drains your battery faster?",
    optionA: { label: "Rigid rules and micromanagement", sub: "I need room to improvise" },
    optionB: { label: "Vague briefs with no clear metrics", sub: "I need structure to thrive" },
  },
];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
type TalentOnboardingDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type Step = "email" | "check-inbox" | "prism-intro" | "prism-q" | "prism-result" | "done";

export function TalentOnboardingDialogFey({ open, onClose, onSuccess }: TalentOnboardingDialogProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<PrismAnswers>({ driver: null, scope: null, variant: null, friction: null });
  const [archetype, setArchetype] = useState<Archetype | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("email");
      setEmail("");
      setSubmitting(false);
      setError("");
      setQIndex(0);
      setAnswers({ driver: null, scope: null, variant: null, friction: null });
      setArchetype(null);
    }
  }, [open]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email"); return; }
    setSubmitting(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: email.trim(),
      userType: "talent",
      displayName: email.trim().split("@")[0],
    });
    setSubmitting(false);
    if (result?.error) { setError(result.error); return; }
    setStep("prism-intro");
  };

  const handleAnswer = (optionKey: "A" | "B") => {
    const q = PRISM_QUESTIONS[qIndex];
    const next = { ...answers };

    if (q.id === "canvas")   next.driver   = optionKey === "A" ? "intuition" : "logic";
    if (q.id === "horizon")  next.scope    = optionKey === "A" ? "macro" : "micro";
    if (q.id === "energy")   next.variant  = optionKey === "A" ? "outer" : "inner";
    if (q.id === "friction") next.friction = optionKey;

    setAnswers(next);

    if (qIndex < PRISM_QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      const result = scoreArchetype(next);
      setArchetype(result);
      setStep("prism-result");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}>
            <FeyMeshLayer variant="background" intensity="subtle" className="relative w-full max-w-md">
              <div className="relative w-full rounded-[22px] border p-8"
                style={{
                  background: `${feyTokens.colors.base.darker}EE`,
                  borderColor: feyTokens.borders.default,
                  backdropFilter: "blur(20px)",
                  boxShadow: feyTokens.shadows.modal,
                }}>

                <button type="button" onClick={onClose}
                  className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                  style={{ color: feyTokens.colors.text.muted }}>
                  <X className="h-4 w-4" />
                </button>

                <AnimatePresence mode="wait">

                  {/* ── EMAIL ── */}
                  {step === "email" && (
                    <motion.div key="email" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <EmailStep email={email} setEmail={setEmail} submitting={submitting} error={error} onSubmit={handleEmailSubmit} />
                    </motion.div>
                  )}

                  {/* ── CHECK INBOX ── */}
                  {step === "check-inbox" && (
                    <motion.div key="inbox" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <InboxStep email={email} onBack={() => setStep("email")} />
                    </motion.div>
                  )}

                  {/* ── PRISM INTRO ── */}
                  {step === "prism-intro" && (
                    <motion.div key="prism-intro" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <PrismIntroStep onStart={() => { setQIndex(0); setStep("prism-q"); }} />
                    </motion.div>
                  )}

                  {/* ── PRISM QUESTIONS ── */}
                  {step === "prism-q" && (
                    <motion.div key={`prism-q-${qIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                      <PrismQuestionStep q={PRISM_QUESTIONS[qIndex]} qIndex={qIndex} total={PRISM_QUESTIONS.length} onAnswer={handleAnswer} />
                    </motion.div>
                  )}

                  {/* ── PRISM RESULT ── */}
                  {step === "prism-result" && archetype && (
                    <motion.div key="prism-result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                      <PrismResultStep archetype={archetype} onContinue={() => { setStep("done"); onSuccess(); onClose(); }} />
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </FeyMeshLayer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   SUB-STEP COMPONENTS
───────────────────────────────────────────── */
function EmailStep({ email, setEmail, submitting, error, onSubmit }: {
  email: string; setEmail: (v: string) => void; submitting: boolean; error: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-[28px]">🐝</div>
        <h2 className="text-[22px] font-medium tracking-[-0.025em]" style={{ color: feyTokens.colors.text.primary }}>
          Apply to join Creator Hive
        </h2>
        <p className="text-[13px] font-light" style={{ color: feyTokens.colors.text.muted }}>
          UAE's top 1% creator marketplace. Enter your email to begin.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 rounded-full border px-5 py-3.5 transition-all focus-within:border-white/20"
          style={{ borderColor: error ? feyTokens.colors.status.error : feyTokens.borders.default, background: feyTokens.glass.panel.background }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com" autoFocus
            className="flex-1 bg-transparent outline-none text-[14px] font-light"
            style={{ color: feyTokens.colors.text.primary }} />
          <button type="submit" disabled={submitting || !email.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-40"
            style={{ background: email.trim() ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.08)", color: email.trim() ? "#07070B" : "rgba(255,255,255,0.4)" }}>
            {submitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="mt-2 text-[12px]" style={{ color: feyTokens.colors.status.error }}>{error}</p>}
      </div>

      <p className="text-center text-[11px]" style={{ color: feyTokens.colors.text.label }}>
        By signing up, you agree to our{" "}
        <a href="/terms" className="underline hover:no-underline" style={{ color: feyTokens.colors.text.muted }}>Terms</a>
      </p>
    </form>
  );
}

function InboxStep({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="text-center space-y-5">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `${feyTokens.colors.status.success}15` }}>
          <Check className="h-8 w-8" style={{ color: feyTokens.colors.status.success }} />
        </div>
      </div>
      <div className="space-y-1">
        <h2 className="text-[22px] font-medium tracking-[-0.025em]" style={{ color: feyTokens.colors.text.primary }}>Check your inbox</h2>
        <p className="text-[13px] font-light" style={{ color: feyTokens.colors.text.muted }}>We've sent a secure link to authenticate your account.</p>
      </div>
      <div className="rounded-xl border px-4 py-3 flex items-center justify-between" style={{ borderColor: feyTokens.borders.default, background: feyTokens.glass.panel.background }}>
        <span className="text-[13px]" style={{ color: feyTokens.colors.text.primary }}>{email}</span>
        <Check className="h-4 w-4" style={{ color: feyTokens.colors.status.success }} />
      </div>
      <button onClick={onBack} className="text-[12px] underline hover:no-underline" style={{ color: feyTokens.colors.text.label }}>← Different email</button>
    </div>
  );
}

function PrismIntroStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-3">
        <div className="text-[32px]">🔮</div>
        <h2 className="text-[22px] font-medium tracking-[-0.025em]" style={{ color: feyTokens.colors.text.primary }}>
          Discover your Origin Story
        </h2>
        <p className="text-[13px] font-light leading-relaxed max-w-xs mx-auto" style={{ color: feyTokens.colors.text.muted }}>
          4 questions. 60 seconds. We'll map you to one of 8 Prismatic Archetypes — defining how you think and how you create.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 py-2">
        {Object.values(ARCHETYPES).map((a) => (
          <div key={a.name} className="flex flex-col items-center gap-1.5 p-2 rounded-xl"
            style={{ background: a.accentBg, border: `1px solid ${a.ring}` }}>
            <span className="text-[18px]">{a.emoji}</span>
            <span className="text-[9px] font-medium text-center leading-tight" style={{ color: a.accent }}>
              {a.name.replace("The ", "")}
            </span>
          </div>
        ))}
      </div>

      <button type="button" onClick={onStart}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-medium transition-all"
        style={{ background: "rgba(255,255,255,0.92)", color: "#07070B" }}>
        Begin Origin Story
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function PrismQuestionStep({ q, qIndex, total, onAnswer }: {
  q: Question; qIndex: number; total: number;
  onAnswer: (k: "A" | "B") => void;
}) {
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div className="h-full rounded-full" style={{ background: "rgba(255,255,255,0.40)" }}
            initial={{ width: `${(qIndex / total) * 100}%` }}
            animate={{ width: `${((qIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.4 }} />
        </div>
        <span className="text-[11px] font-medium shrink-0" style={{ color: feyTokens.colors.text.label }}>
          {qIndex + 1} / {total}
        </span>
      </div>

      {/* Question */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: feyTokens.colors.text.label }}>{q.label}</p>
        <h3 className="text-[17px] font-medium tracking-[-0.02em] leading-snug" style={{ color: feyTokens.colors.text.primary }}>{q.title}</h3>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {(["A", "B"] as const).map((key) => {
          const opt = key === "A" ? q.optionA : q.optionB;
          return (
            <button key={key} type="button" onClick={() => onAnswer(key)}
              className="w-full text-left p-4 rounded-xl transition-all duration-150 group"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.07)"; el.style.borderColor = "rgba(255,255,255,0.14)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.03)"; el.style.borderColor = "rgba(255,255,255,0.07)"; }}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(255,255,255,0.08)", color: feyTokens.colors.text.muted }}>
                  {key}
                </div>
                <div>
                  <p className="text-[14px] font-medium" style={{ color: feyTokens.colors.text.primary }}>{opt.label}</p>
                  <p className="text-[12px] mt-0.5 font-light" style={{ color: feyTokens.colors.text.muted }}>{opt.sub}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PrismResultStep({ archetype, onContinue }: { archetype: Archetype; onContinue: () => void }) {
  return (
    <div className="space-y-6">
      {/* Result card */}
      <motion.div className="rounded-2xl p-6 text-center space-y-3"
        style={{ background: archetype.accentBg, border: `1px solid ${archetype.ring}` }}
        initial={{ scale: 0.92 }} animate={{ scale: 1 }} transition={{ duration: 0.5, type: "spring", stiffness: 180 }}>
        <div className="text-[40px]">{archetype.emoji}</div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: archetype.accent }}>{archetype.tagline}</p>
          <h2 className="text-[26px] font-medium tracking-[-0.025em]" style={{ color: feyTokens.colors.text.primary }}>{archetype.name}</h2>
        </div>
      </motion.div>

      <p className="text-[13px] font-light leading-relaxed" style={{ color: feyTokens.colors.text.muted }}>
        {archetype.description}
      </p>

      <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: feyTokens.borders.default, background: feyTokens.glass.panel.background }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: feyTokens.colors.text.label }}>What happens next</p>
        {[
          "Your archetype is added to your creator profile",
          "Brands can match you to campaigns based on your type",
          "You'll be visible to UAE's top agencies & brands",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <Check size={12} className="mt-0.5 shrink-0" style={{ color: feyTokens.colors.status.success }} />
            <span className="text-[12px] font-light" style={{ color: feyTokens.colors.text.secondary }}>{item}</span>
          </div>
        ))}
      </div>

      <button type="button" onClick={onContinue}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-medium transition-all"
        style={{ background: archetype.accent.replace("0.9", "0.92"), color: "#07070B" }}>
        Enter the Hive
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
