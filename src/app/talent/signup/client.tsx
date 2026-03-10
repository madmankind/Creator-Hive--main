"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Phone, Mail, ChevronRight } from "lucide-react";
import { feyTokens } from "@/lib/fey-design-tokens";

// ── Prism quiz data ────────────────────────────────────────────────────────

const PRISM_QUESTIONS = [
  {
    id: "lens",
    question: "When you're deep in a creative project, what drives you?",
    subtext: "Go with your gut — there's no right answer.",
    options: [
      { value: "logic",     label: "A clear strategy",     sub: "I want to know it's working before I go all in" },
      { value: "intuition", label: "A gut feeling",         sub: "Something clicks and I just start building" },
    ],
  },
  {
    id: "scope",
    question: "Where do you feel most alive creatively?",
    subtext: null,
    options: [
      { value: "macro", label: "Shaping the big picture",  sub: "Brand direction, campaign architecture, strategy" },
      { value: "micro", label: "Perfecting the details",   sub: "The shot, the copy, the edit, the finish" },
    ],
  },
  {
    id: "stage",
    question: "What gives you the most satisfaction?",
    subtext: null,
    options: [
      { value: "outer", label: "The world seeing it",      sub: "Impact, reach, results, reception" },
      { value: "inner", label: "The craft itself",         sub: "The process, the growth, the quality" },
    ],
  },
  {
    id: "collab",
    question: "In a team, you naturally become the person who…",
    subtext: null,
    options: [
      { value: "leads",    label: "Sets the direction",    sub: "You know where it needs to go" },
      { value: "executes", label: "Brings it to life",     sub: "You're the one who actually makes it happen" },
    ],
  },
];

const PRISM_ARCHETYPES: Record<string, { name: string; tagline: string; accent: string; description: string }> = {
  "logic-macro-outer":     { name: "The Pathfinder",   accent: "rgba(0,220,255,0.8)",    tagline: "Strategy-first. You build roads others travel.", description: "You turn data into direction. Brands trust you to navigate ambiguity and create scalable systems that move culture forward." },
  "logic-macro-inner":     { name: "The Translator",   accent: "rgba(52,211,153,0.8)",   tagline: "Clarity is your superpower.",                      description: "You make complex ideas simple without losing the weight of them. Editors, strategists, writers who shape how things are understood." },
  "logic-micro-outer":     { name: "The Architect",    accent: "rgba(99,102,241,0.8)",   tagline: "Every detail is load-bearing.",                    description: "You sweat the brief, the format, the spec. You build output that holds up at scale and looks intentional at every frame." },
  "logic-micro-inner":     { name: "The Alchemist",    accent: "rgba(234,179,8,0.8)",    tagline: "You find the formula others missed.",              description: "Your process is your product. You experiment, refine, and iterate until the work surprises even you." },
  "intuition-macro-outer": { name: "The Maverick",     accent: "rgba(229,72,77,0.8)",    tagline: "Trend-setter. Culture-shaper.",                   description: "You feel shifts before they happen. You're the one a brand calls when they want to stop following and start leading." },
  "intuition-macro-inner": { name: "The Conductor",    accent: "rgba(167,139,250,0.8)",  tagline: "You make the whole greater than its parts.",      description: "You hold creative vision and team energy at once. Directors, creative leads, and producers who orchestrate without micromanaging." },
  "intuition-micro-outer": { name: "The Auteur",       accent: "rgba(251,146,60,0.8)",   tagline: "Your signature is unmistakable.",                 description: "Every frame, caption, or cut carries your point of view. The camera — or keyboard — is an extension of your identity." },
  "intuition-micro-inner": { name: "The Amplifier",    accent: "rgba(34,211,238,0.8)",   tagline: "You make people feel something.",                 description: "Your work doesn't just land — it resonates. UGC creators, storytellers, and community builders who turn viewers into believers." },
};

function getArchetype(answers: Record<string, string>): string {
  const lens  = answers.lens  === "logic" ? "logic" : "intuition";
  const scope = answers.scope === "macro"  ? "macro"  : "micro";
  const stage = answers.stage === "outer"  ? "outer"  : "inner";
  return `${lens}-${scope}-${stage}`;
}

// ── Role categories ─────────────────────────────────────────────────────────

const ROLE_GROUPS = [
  { group: "Video & Content", roles: ["Short-form Video Creator", "Long-form Video Creator", "UGC Creator", "Videographer", "Video Editor", "Motion Designer", "Photographer"] },
  { group: "Social & Strategy", roles: ["Social Media Manager", "Content Strategist", "Copywriter", "Arabic Copywriter", "Community Manager", "Influencer / Creator"] },
  { group: "Production", roles: ["Creative Director", "Art Director", "Graphic Designer", "Brand Designer", "3D / CGI Artist", "Illustrator"] },
  { group: "Operations", roles: ["Campaign Manager", "Talent Manager", "Project Manager", "Producer"] },
];

// ── Platform list ────────────────────────────────────────────────────────────

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X / Twitter", "LinkedIn", "Snapchat", "Podcast / Audio", "Website / Blog"];

// ── Step types ───────────────────────────────────────────────────────────────

type AuthMethod = "whatsapp" | "email" | null;
type Step = "auth" | "quiz" | "reveal" | "profile" | "done";

// ── Shared UI ───────────────────────────────────────────────────────────────

const BG = {
  base: "#07070B",
  purple: "radial-gradient(900px 600px at 50% 15%, rgba(124,92,255,0.22) 0%, rgba(0,0,0,0) 65%), radial-gradient(700px 400px at 20% 60%, rgba(0,220,255,0.06) 0%, rgba(0,0,0,0) 60%)",
};

const SLIDE = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -24 },
  transition: { duration: 0.28, ease: [0.25, 0.1, 0.25, 1.0] },
};

function PillButton({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl px-5 py-4 ring-1 transition-all duration-200"
      style={{
        background: active ? "rgba(124,92,255,0.12)" : "rgba(255,255,255,0.04)",
        ring: active ? "rgba(124,92,255,0.4)" : "rgba(255,255,255,0.09)",
        boxShadow: active ? "inset 0 0 0 1px rgba(124,92,255,0.40)" : "inset 0 0 0 1px rgba(255,255,255,0.09)",
      }}
    >
      {children}
    </button>
  );
}

// ── Auth step ────────────────────────────────────────────────────────────────

function AuthStep({ onNext }: { onNext: (method: AuthMethod, contact: string) => void }) {
  const [method, setMethod] = useState<AuthMethod>(null);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 900);
  };

  const handleVerify = () => {
    if (otp.length >= 4) onNext(method, value);
  };

  return (
    <motion.div {...SLIDE} className="space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.14em] uppercase font-medium mb-3" style={{ color: feyTokens.colors.text.label }}>Creator Hive</p>
        <h1 className="text-[28px] font-light tracking-[-0.03em] leading-tight mb-2" style={{ color: feyTokens.colors.text.primary }}>
          Join the Hive.
        </h1>
        <p className="text-[14px] font-light" style={{ color: feyTokens.colors.text.muted }}>
          Get matched with UAE brands. Work on campaigns that matter.
        </p>
      </div>

      {!method && (
        <div className="space-y-3">
          <button
            onClick={() => setMethod("whatsapp")}
            className="w-full flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-200"
            style={{ background: "rgba(37,211,102,0.10)", boxShadow: "inset 0 0 0 1px rgba(37,211,102,0.30)", color: "rgba(255,255,255,0.85)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: "rgba(37,211,102,0.9)" }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.554 4.124 1.523 5.86L.057 23.5l5.77-1.513A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.363l-.358-.213-3.428.899.914-3.342-.234-.375A9.818 9.818 0 012.182 12C2.182 6.568 6.568 2.182 12 2.182S21.818 6.568 21.818 12 17.432 21.818 12 21.818z"/>
            </svg>
            <div className="text-left">
              <p className="text-[14px] font-medium">Continue with WhatsApp</p>
              <p className="text-[11px] mt-0.5" style={{ color: feyTokens.colors.text.muted }}>We'll send a verification code</p>
            </div>
          </button>
          <button
            onClick={() => setMethod("email")}
            className="w-full flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }}
          >
            <Mail size={20} style={{ color: feyTokens.colors.text.muted }} />
            <div className="text-left">
              <p className="text-[14px] font-medium">Continue with Email</p>
              <p className="text-[11px] mt-0.5" style={{ color: feyTokens.colors.text.muted }}>Receive a magic link</p>
            </div>
          </button>
        </div>
      )}

      {method && !sent && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <button onClick={() => setMethod(null)} className="text-[11px]" style={{ color: feyTokens.colors.text.label }}>← Back</button>
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.09)" }}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {method === "whatsapp" ? <Phone size={16} style={{ color: feyTokens.colors.text.muted }} /> : <Mail size={16} style={{ color: feyTokens.colors.text.muted }} />}
              <span className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>{method === "whatsapp" ? "WhatsApp number" : "Email address"}</span>
            </div>
            <input
              type={method === "email" ? "email" : "tel"}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={method === "whatsapp" ? "+971 50 000 0000" : "you@example.com"}
              className="w-full bg-transparent px-4 py-3.5 text-[16px] font-light outline-none"
              style={{ color: feyTokens.colors.text.primary }}
              autoFocus
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!value.trim() || sending}
            className="w-full py-3.5 rounded-2xl text-[14px] font-medium transition-all"
            style={{
              background: value.trim() ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.08)",
              color: value.trim() ? "#07070B" : feyTokens.colors.text.muted,
            }}
          >
            {sending ? "Sending…" : method === "whatsapp" ? "Send WhatsApp code" : "Send magic link"}
          </button>
        </motion.div>
      )}

      {method && sent && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <p className="text-[13px]" style={{ color: feyTokens.colors.text.secondary }}>
            {method === "whatsapp" ? `Code sent to ${value} via WhatsApp` : `Link sent to ${value}`}
          </p>
          {method === "whatsapp" && (
            <>
              <input
                type="number"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full bg-transparent rounded-2xl px-4 py-3.5 text-[20px] font-light tracking-[0.2em] text-center outline-none"
                style={{ background: "rgba(255,255,255,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.09)", color: feyTokens.colors.text.primary }}
                autoFocus
              />
              <button
                onClick={handleVerify}
                disabled={otp.length < 4}
                className="w-full py-3.5 rounded-2xl text-[14px] font-medium transition-all"
                style={{
                  background: otp.length >= 4 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.08)",
                  color: otp.length >= 4 ? "#07070B" : feyTokens.colors.text.muted,
                }}
              >
                Verify →
              </button>
            </>
          )}
          {method === "email" && (
            <p className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>
              Check your inbox and click the link to continue. You can close this tab.
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Quiz step ────────────────────────────────────────────────────────────────

function QuizStep({ onComplete }: { onComplete: (answers: Record<string, string>) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const q = PRISM_QUESTIONS[index];
  const progress = (index / PRISM_QUESTIONS.length) * 100;

  const handleAnswer = (val: string) => {
    const next = { ...answers, [q.id]: val };
    setAnswers(next);
    if (index < PRISM_QUESTIONS.length - 1) {
      setTimeout(() => setIndex(i => i + 1), 220);
    } else {
      setTimeout(() => onComplete(next), 220);
    }
  };

  return (
    <motion.div {...SLIDE} key={`q-${index}`} className="space-y-8">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px]" style={{ color: feyTokens.colors.text.label }}>
          <span>Prism assessment</span>
          <span>{index + 1} / {PRISM_QUESTIONS.length}</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "rgba(124,92,255,0.7)" }}
            animate={{ width: `${progress + (100 / PRISM_QUESTIONS.length)}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <div>
        <h2 className="text-[22px] font-light tracking-[-0.025em] leading-snug mb-2" style={{ color: feyTokens.colors.text.primary }}>
          {q.question}
        </h2>
        {q.subtext && <p className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>{q.subtext}</p>}
      </div>

      <div className="space-y-3">
        {q.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className="w-full text-left rounded-2xl px-5 py-4 transition-all duration-150 group"
            style={{
              background: answers[q.id] === opt.value ? "rgba(124,92,255,0.12)" : "rgba(255,255,255,0.04)",
              boxShadow: answers[q.id] === opt.value
                ? "inset 0 0 0 1px rgba(124,92,255,0.40)"
                : "inset 0 0 0 1px rgba(255,255,255,0.09)",
            }}
          >
            <p className="text-[15px] font-medium mb-0.5" style={{ color: feyTokens.colors.text.primary }}>{opt.label}</p>
            <p className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>{opt.sub}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Archetype reveal ─────────────────────────────────────────────────────────

function RevealStep({ archetype, onNext }: { archetype: string; onNext: () => void }) {
  const a = PRISM_ARCHETYPES[archetype];
  if (!a) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="space-y-8 text-center"
    >
      {/* Glowing archetype orb */}
      <div className="flex justify-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: a.accent.replace("0.8)", "0.12)"),
            boxShadow: `0 0 48px ${a.accent.replace("0.8)", "0.25)")}`,
            border: `1px solid ${a.accent.replace("0.8)", "0.30)")}`,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={a.accent} strokeWidth="1.2">
            <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
            <polygon points="12,7 17,9.8 17,15.2 12,18 7,15.2 7,9.8" strokeWidth="0.8" />
          </svg>
        </div>
      </div>

      <div>
        <p className="text-[11px] tracking-[0.16em] uppercase font-medium mb-1" style={{ color: a.accent }}>
          Your Prism archetype
        </p>
        <h2 className="text-[32px] font-light tracking-[-0.03em] mb-2" style={{ color: feyTokens.colors.text.primary }}>
          {a.name}
        </h2>
        <p className="text-[15px] font-medium mb-4" style={{ color: feyTokens.colors.text.secondary }}>
          "{a.tagline}"
        </p>
        <p className="text-[13px] leading-relaxed max-w-[340px] mx-auto" style={{ color: feyTokens.colors.text.muted }}>
          {a.description}
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 rounded-2xl text-[14px] font-medium flex items-center justify-center gap-2 transition-all"
        style={{ background: "rgba(255,255,255,0.95)", color: "#07070B" }}
      >
        Continue <ArrowRight size={15} />
      </button>
    </motion.div>
  );
}

// ── Profile step ─────────────────────────────────────────────────────────────

function ProfileStep({
  archetype,
  onSubmit,
}: {
  archetype: string;
  onSubmit: (data: Record<string, string | string[]>) => void;
}) {
  const a = PRISM_ARCHETYPES[archetype];
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleRole = (r: string) =>
    setRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const canSubmit = name.trim() && handle.trim() && roles.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    onSubmit({ name, handle, platform, portfolio, roles, location, bio, archetype });
  };

  return (
    <motion.div {...SLIDE} className="space-y-7">
      <div>
        {a && (
          <span className="inline-block text-[10px] px-2.5 py-1 rounded-full mb-3 font-medium tracking-wide uppercase"
            style={{ background: a.accent.replace("0.8)", "0.10)"), color: a.accent, border: `1px solid ${a.accent.replace("0.8)", "0.25)")}` }}>
            {a.name}
          </span>
        )}
        <h2 className="text-[22px] font-light tracking-[-0.025em]" style={{ color: feyTokens.colors.text.primary }}>
          Now tell us about you.
        </h2>
        <p className="text-[13px] mt-1" style={{ color: feyTokens.colors.text.muted }}>
          This is how brands will discover and evaluate your profile.
        </p>
      </div>

      {/* Full name */}
      <FieldBlock label="Full name" required>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Your full name" className="field-input" autoFocus />
      </FieldBlock>

      {/* Main social handle + platform */}
      <FieldBlock label="Primary social handle" required hint="Where you create most">
        <div className="flex gap-2">
          <select value={platform} onChange={e => setPlatform(e.target.value)}
            className="field-input w-[140px] flex-shrink-0">
            <option value="">Platform</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input value={handle} onChange={e => setHandle(e.target.value)}
            placeholder="@handle" className="field-input flex-1" />
        </div>
      </FieldBlock>

      {/* Portfolio */}
      <FieldBlock label="Portfolio / showreel" hint="Optional — link to your best work">
        <input value={portfolio} onChange={e => setPortfolio(e.target.value)}
          placeholder="https://..." className="field-input" />
      </FieldBlock>

      {/* Roles — multi-select grid */}
      <div>
        <label className="block text-[11px] tracking-[0.10em] uppercase font-medium mb-3"
          style={{ color: feyTokens.colors.text.label }}>
          What do you do? <span style={{ color: "rgba(124,92,255,0.7)" }}>*</span>
        </label>
        <div className="space-y-4">
          {ROLE_GROUPS.map(g => (
            <div key={g.group}>
              <p className="text-[10px] uppercase tracking-[0.10em] mb-2" style={{ color: feyTokens.colors.text.label }}>{g.group}</p>
              <div className="flex flex-wrap gap-2">
                {g.roles.map(r => (
                  <button
                    key={r}
                    onClick={() => toggleRole(r)}
                    className="px-3 py-1.5 rounded-xl text-[12px] transition-all duration-150"
                    style={{
                      background: roles.includes(r) ? "rgba(124,92,255,0.14)" : "rgba(255,255,255,0.04)",
                      boxShadow: roles.includes(r)
                        ? "inset 0 0 0 1px rgba(124,92,255,0.40)"
                        : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                      color: roles.includes(r) ? "rgba(167,139,250,0.95)" : feyTokens.colors.text.muted,
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <FieldBlock label="Based in">
        <input value={location} onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Dubai, UAE" className="field-input" />
      </FieldBlock>

      {/* Bio */}
      <FieldBlock label="One-line bio" hint="What makes you different?">
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
          placeholder="e.g. I make Arabic-first beauty content that feels like a conversation, not a campaign."
          className="field-input resize-none" />
      </FieldBlock>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full py-4 rounded-2xl text-[15px] font-medium flex items-center justify-center gap-2 transition-all"
        style={{
          background: canSubmit ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.08)",
          color: canSubmit ? "#07070B" : feyTokens.colors.text.muted,
        }}
      >
        {submitting
          ? <><span className="h-4 w-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" /> Submitting…</>
          : <>Submit application <ArrowRight size={16} /></>
        }
      </button>
    </motion.div>
  );
}

function FieldBlock({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <label className="text-[11px] tracking-[0.10em] uppercase font-medium" style={{ color: feyTokens.colors.text.label }}>
          {label}{required && <span style={{ color: "rgba(124,92,255,0.7)" }}> *</span>}
        </label>
        {hint && <span className="text-[10px]" style={{ color: feyTokens.colors.text.label }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Done screen ──────────────────────────────────────────────────────────────

function DoneStep({ name, archetype }: { name: string; archetype: string }) {
  const a = PRISM_ARCHETYPES[archetype];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="text-center space-y-8 py-6"
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
        style={{ background: "rgba(52,211,153,0.12)", boxShadow: "0 0 32px rgba(52,211,153,0.18)", border: "1px solid rgba(52,211,153,0.30)" }}>
        <Check className="w-7 h-7" style={{ color: "rgba(52,211,153,0.9)" }} />
      </div>
      <div>
        <h2 className="text-[26px] font-light tracking-[-0.03em] mb-2" style={{ color: feyTokens.colors.text.primary }}>
          You're in, {name.split(" ")[0]}.
        </h2>
        <p className="text-[13px] leading-relaxed max-w-[320px] mx-auto" style={{ color: feyTokens.colors.text.muted }}>
          Your application is under review. {a ? `We'll match you with briefs that fit ${a.name}s — ` : ""}our team will reach out within 48 hours.
        </p>
      </div>
      {a && (
        <div className="rounded-2xl px-6 py-4 mx-auto max-w-[300px]"
          style={{ background: a.accent.replace("0.8)", "0.08)"), border: `1px solid ${a.accent.replace("0.8)", "0.20)")}` }}>
          <p className="text-[11px] uppercase tracking-[0.12em] mb-1" style={{ color: a.accent }}>Your archetype</p>
          <p className="text-[16px] font-medium" style={{ color: feyTokens.colors.text.primary }}>{a.name}</p>
          <p className="text-[11px] mt-0.5" style={{ color: feyTokens.colors.text.muted }}>"{a.tagline}"</p>
        </div>
      )}
    </motion.div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export function TalentSignupClient() {
  const [step, setStep] = useState<Step>("auth");
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [archetype, setArchetype] = useState("");
  const [profileName, setProfileName] = useState("");

  const handleAuth = (method: AuthMethod, contact: string) => {
    setAuthMethod(method);
    setStep("quiz");
  };

  const handleQuizComplete = (answers: Record<string, string>) => {
    setQuizAnswers(answers);
    setArchetype(getArchetype(answers));
    setStep("reveal");
  };

  const handleProfileSubmit = (data: Record<string, string | string[]>) => {
    setProfileName(data.name as string);
    setStep("done");
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col" style={{ background: BG.base, color: feyTokens.colors.text.primary }}>
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: BG.purple, zIndex: 0 }} />

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="w-full max-w-[420px] mx-auto px-6 py-12 flex-1 flex flex-col justify-center">

          <AnimatePresence mode="wait">
            {step === "auth" && (
              <motion.div key="auth" {...SLIDE}><AuthStep onNext={handleAuth} /></motion.div>
            )}
            {step === "quiz" && (
              <motion.div key="quiz" {...SLIDE}>
                <QuizStep onComplete={handleQuizComplete} />
              </motion.div>
            )}
            {step === "reveal" && (
              <motion.div key="reveal" {...SLIDE}>
                <RevealStep archetype={archetype} onNext={() => setStep("profile")} />
              </motion.div>
            )}
            {step === "profile" && (
              <motion.div key="profile" {...SLIDE}>
                <ProfileStep archetype={archetype} onSubmit={handleProfileSubmit} />
              </motion.div>
            )}
            {step === "done" && (
              <motion.div key="done" {...SLIDE}>
                <DoneStep name={profileName} archetype={archetype} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Inline CSS for field inputs */}
      <style>{`
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 15px;
          font-weight: 300;
          color: rgba(255,255,255,0.88);
          outline: none;
          transition: box-shadow 0.15s;
          color-scheme: dark;
          appearance: none;
          -webkit-appearance: none;
          border: none;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.22); }
        .field-input:focus { box-shadow: inset 0 0 0 1px rgba(124,92,255,0.45); }
        select.field-input { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.35)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
      `}</style>
    </div>
  );
}
