"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check, ChevronRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { feyTokens } from "@/lib/fey-design-tokens";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type Mode = "client" | "talent";
type TalentAccountType = "independent" | "manager" | "agency";
type Step = "auth" | "otp" | "phone" | "loading" | "inbox" | "talent-type" | "prism-intro" | "prism-q" | "prism-result" | "profile" | "manager-profile" | "done";

export type HiveAuthModalProps = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onSuccess: () => void;
  initialStep?: Step;
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

// Output statements grouped by role — talent picks up to 4, bio is assembled automatically
const OUTPUTS_BY_ROLE: Record<string, string[]> = {
  "Video & Content": [
    "Shoot and direct brand films",
    "Produce short-form social reels",
    "Edit long-form video content",
    "Create UGC product content",
    "Shoot and edit vlogs and travel content",
    "Produce motion graphics and animations",
    "Direct and shoot music videos",
    "Shoot product and commercial photography",
    "Create TikTok-native content",
    "Produce YouTube content and series",
  ],
  "Social & Strategy": [
    "Manage social media accounts",
    "Write social captions and copy",
    "Build content calendars and strategies",
    "Write Arabic-language content",
    "Create and manage paid social campaigns",
    "Grow organic social audiences",
    "Handle community management",
    "Produce monthly content reports",
  ],
  "Production": [
    "Art direct brand campaigns",
    "Lead creative concept development",
    "Design visual identities and brand assets",
    "Create 3D and CGI visuals",
    "Design social media templates",
    "Direct and oversee shoot productions",
    "Build mood boards and campaign decks",
    "Design print and digital collateral",
  ],
  "Operations": [
    "Manage campaigns end-to-end",
    "Coordinate talent and production teams",
    "Build project timelines and briefs",
    "Handle client communication and reporting",
    "Manage budgets and vendor relations",
    "Oversee deliverable review and approvals",
  ],
};

const NICHES_LIST = [
  "F&B", "Beauty", "Fashion", "Fitness & Wellness",
  "Travel", "Automotive", "Technology", "Real Estate",
  "Hospitality", "Entertainment", "Finance", "Healthcare",
  "Retail", "Sport", "Education", "Sustainability",
];

function buildBio(outputs: string[], niches: string[]): string {
  if (outputs.length === 0) return "";
  const last = outputs[outputs.length - 1];
  const rest = outputs.slice(0, -1);
  const outputStr = rest.length > 0
    ? rest.join(", ") + ", and " + last
    : last;
  const nicheStr = niches.length > 0
    ? " Experienced in " + (niches.length === 1
        ? niches[0]
        : niches.slice(0, -1).join(", ") + " and " + niches[niches.length - 1]) + "."
    : "";
  // Capitalise first letter
  const bio = outputStr.charAt(0).toUpperCase() + outputStr.slice(1) + "." + nicheStr;
  return bio;
}

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
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
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
  mode, authMode, setAuthMode, email, setEmail, submitting, error,
  onEmailSubmit, onGoogleClick, onWhatsAppClick,
}: {
  mode: Mode;
  authMode: "signup" | "login";
  setAuthMode: (m: "signup" | "login") => void;
  email: string; setEmail: (v: string) => void;
  submitting: boolean; error: string;
  onEmailSubmit: () => void; onGoogleClick: () => void; onWhatsAppClick?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const typing = email.length > 0;

  const blurStyle = (suppress?: boolean): React.CSSProperties => ({
    opacity: (typing && !suppress) ? 0 : 1,
    filter:  (typing && !suppress) ? "blur(5px)" : "none",
    transition: "opacity 0.35s ease, filter 0.35s ease",
    pointerEvents: (typing && !suppress) ? "none" : "auto",
  });

  const subtitleMap: Record<string, string> = {
    "client-signup": "Enter your work email to access UAE's most vetted creator marketplace.",
    "client-login":  "Welcome back. Enter your email and we'll send you a secure link.",
    "talent-signup": "Your application starts here. We'll match you to campaigns that fit who you are.",
    "talent-login":  "Good to have you back. Enter your email to continue.",
  };
  const subtitle = subtitleMap[`${mode}-${authMode}`];

  const googleLabel = authMode === "login"
    ? "Continue with Google"
    : mode === "client" ? "Continue with Google" : "Sign up with Google";

  return (
    <div className="w-full flex flex-col items-center gap-7">

      {/* Static heading — blurs when typing */}
      <div className="text-center space-y-3" style={blurStyle()}>
        <h1 className="text-[30px] sm:text-[36px] font-medium tracking-[-0.025em] text-white leading-[1.12]">
          {mode === "talent" ? "Join Creator Hive" : "Welcome to Creator Hive"}
        </h1>
        {/* Subtitle — swipes horizontally on mode/authMode change */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`${mode}-${authMode}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] as const }}
            className="text-[14px] font-light max-w-[340px] mx-auto"
            style={{ color: "rgba(255,255,255,0.42)" }}
          >
            {subtitle}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Email input */}
      <div className="w-full max-w-[400px] space-y-3">
        <div
          className="flex items-center rounded-full px-5 transition-all duration-200"
          style={{
            height: "52px",
            background: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${focused ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)"}`,
            boxShadow: focused ? "0 0 0 3px rgba(255,255,255,0.05)" : "none",
          }}
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => { if (e.key === "Enter" && email.trim()) onEmailSubmit(); }}
            placeholder="account email"
            autoFocus
            className="flex-1 bg-transparent outline-none text-[15px] font-light min-w-0"
            style={{ color: "rgba(255,255,255,0.90)", caretColor: "rgba(255,255,255,0.6)" }}
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

      {/* Social options — blurs when typing */}
      <div style={blurStyle()} className="flex flex-col items-center gap-3">
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
          {googleLabel}
        </button>

        {/* WhatsApp option — talent only */}
        {mode === "talent" && onWhatsAppClick && (
          <button
            type="button"
            onClick={onWhatsAppClick}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-150"
            style={{
              border: "1px solid rgba(37,211,102,0.25)",
              color: "rgba(255,255,255,0.65)",
              fontSize: "14px",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,211,102,0.06)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <WhatsAppIcon />
            Continue with WhatsApp
          </button>
        )}

        {/* Sign up / Log in toggle */}
        <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.28)" }}>
          {authMode === "signup" ? "Already have an account? " : "Don’t have an account? "}
          <button
            type="button"
            onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
            className="transition-opacity hover:opacity-80"
            style={{ color: "rgba(255,255,255,0.65)", textDecoration: "underline", textUnderlineOffset: "2px" }}
          >
            {authMode === "signup" ? "Log in" : "Sign up"}
          </button>
        </p>
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
        ← Back
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   LOADING STEP — rotating logo → reveal landing
───────────────────────────────────────── */
function LoadingStep({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Rotating CH icon */}
      <div style={{ animation: "chSpin 1.6s linear infinite", transformOrigin: "center" }}>
        <img
          src="/brand/ch-icon.svg"
          width={48} height={54}
          alt="Creator Hive"
          style={{
            filter: "brightness(0) invert(1) opacity(0.6)",
          }}
        />
      </div>
      <p style={{
        color: "rgba(255,255,255,0.32)",
        fontSize: "13px",
        fontWeight: 300,
        letterSpacing: "0.03em",
      }}>
        Signing you in…
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   WHATSAPP ICON
───────────────────────────────────────── */
function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
    </svg>
  );
}

/* ─────────────────────────────────────────
   OTP STEP — 6-digit code entry
───────────────────────────────────────── */
function OTPStep({
  destination, via, onVerify, onBack, onResend,
}: {
  destination: string;
  via: "email" | "whatsapp";
  onVerify: () => void;
  onBack: () => void;
  onResend?: () => void;
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const inputRef0 = useRef<HTMLInputElement>(null);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);
  const inputRef4 = useRef<HTMLInputElement>(null);
  const inputRef5 = useRef<HTMLInputElement>(null);
  const refs: Record<number, ReturnType<typeof useRef<HTMLInputElement | null>>> = {
    0: inputRef0, 1: inputRef1, 2: inputRef2, 3: inputRef3, 4: inputRef4, 5: inputRef5,
  };

  const handleChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[idx] = val.slice(-1);
    setDigits(next);
    if (val && idx < 5) refs[idx + 1].current?.focus();
    if (next.every(d => d !== "") && !verifying) submit(next.join(""));
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) refs[idx - 1].current?.focus();
    if (e.key === "ArrowRight" && idx < 5) refs[idx + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setDigits(next);
    refs[Math.min(pasted.length, 5)].current?.focus();
    if (pasted.length === 6) submit(pasted);
  };

  const submit = async (code: string) => {
    setError("");
    setVerifying(true);
    await new Promise(r => setTimeout(r, 900));
    // In production: verify code against backend
    // Accept any 6-digit code for now (demo mode)
    if (code.length === 6) {
      onVerify();
    } else {
      setError("Invalid code. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      refs[0].current?.focus();
    }
    setVerifying(false);
  };

  const handleResend = () => {
    setResent(true);
    onResend?.();
    setTimeout(() => setResent(false), 30000);
  };

  const label = via === "whatsapp"
    ? `Code sent to your WhatsApp at ${destination}`
    : `Code sent to ${destination}`;

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="text-center space-y-3">
        <h1 className="text-[30px] sm:text-[36px] font-medium tracking-[-0.025em] text-white leading-[1.12]">
          Welcome to Creator Hive
        </h1>
        <p className="text-[14px] font-light max-w-[360px] mx-auto" style={{ color: "rgba(255,255,255,0.42)" }}>
          {label}
        </p>
      </div>

      {/* 6-digit boxes */}
      <div className="flex items-center gap-2.5" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i] as React.RefObject<HTMLInputElement | null>}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            autoFocus={i === 0}
            className="w-11 h-14 text-center text-[22px] font-light rounded-xl outline-none transition-all duration-150"
            style={{
              background: d ? "rgba(124,92,255,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${d ? "rgba(124,92,255,0.40)" : "rgba(255,255,255,0.10)"}`,
              color: "rgba(255,255,255,0.92)",
              caretColor: "transparent",
              boxShadow: d ? "0 0 0 3px rgba(124,92,255,0.08)" : "none",
            }}
          />
        ))}
      </div>

      {verifying && (
        <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>
          <span className="block w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white/50 animate-spin" />
          Verifying…
        </div>
      )}
      {error && <p className="text-[12px] text-center" style={{ color: "rgba(251,113,133,0.85)" }}>{error}</p>}

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          disabled={resent}
          onClick={handleResend}
          className="text-[13px] transition-opacity"
          style={{ color: resent ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.45)", cursor: resent ? "default" : "pointer" }}
        >
          {resent ? "Code resent" : "Resend code"}
        </button>
        <button type="button" onClick={onBack} className="text-[13px] transition-opacity hover:opacity-60"
          style={{ color: "rgba(255,255,255,0.25)" }}>
          ← Back
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PHONE STEP — WhatsApp phone number entry
───────────────────────────────────────── */
function PhoneStep({ onSubmit, onBack }: { onSubmit: (phone: string) => void; onBack: () => void }) {
  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full flex flex-col items-center gap-7">
      <div className="text-center space-y-3">
        <h1 className="text-[30px] sm:text-[36px] font-medium tracking-[-0.025em] text-white leading-[1.12]">
          Welcome to Creator Hive
        </h1>
        <AnimatePresence mode="wait">
          <motion.p key="wa-sub"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] as const }}
            className="text-[14px] font-light max-w-[340px] mx-auto"
            style={{ color: "rgba(255,255,255,0.42)" }}
          >
            Enter your WhatsApp number and we’ll send you a one-time code.
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-[400px]">
        <div className="flex items-center rounded-full px-5 transition-all duration-200"
          style={{
            height: "52px",
            background: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${focused ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)"}`,
            boxShadow: focused ? "0 0 0 3px rgba(255,255,255,0.05)" : "none",
          }}>
          <span className="flex-shrink-0 text-[15px] font-light pr-3 border-r mr-3"
            style={{ color: "rgba(255,255,255,0.40)", borderColor: "rgba(255,255,255,0.12)" }}>
            +971
          </span>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => { if (e.key === "Enter" && phone.trim().length >= 8) onSubmit("+971" + phone); }}
            placeholder="50 123 4567"
            autoFocus
            className="flex-1 bg-transparent outline-none text-[15px] font-light"
            style={{ color: "rgba(255,255,255,0.90)", caretColor: "rgba(255,255,255,0.6)" }}
          />
          <button type="button"
            onClick={() => phone.trim().length >= 8 && onSubmit("+971" + phone)}
            disabled={phone.trim().length < 8}
            className="flex-shrink-0 flex items-center justify-center rounded-full ml-2 transition-all duration-200"
            style={{
              width: "34px", height: "34px",
              background: phone.trim().length >= 8 ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.09)",
              color: phone.trim().length >= 8 ? "#07070B" : "rgba(255,255,255,0.30)",
            }}>
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <button type="button" onClick={onBack} className="text-[13px] transition-opacity hover:opacity-60"
        style={{ color: "rgba(255,255,255,0.28)" }}>
        ← Back
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
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}>
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
  const [outputs, setOutputs]   = useState<string[]>([]);
  const [niches, setNiches]     = useState<string[]>([]);
  const [rateType, setRateType] = useState("day_rate");
  const [rateAmount, setRateAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleRole = (r: string) =>
    setRoles(p => p.includes(r) ? p.filter(x => x !== r) : p.length < 3 ? [...p, r] : p);
  const toggleOutput = (o: string) =>
    setOutputs(p => p.includes(o) ? p.filter(x => x !== o) : p.length < 4 ? [...p, o] : p);
  const toggleNiche = (n: string) =>
    setNiches(p => p.includes(n) ? p.filter(x => x !== n) : p.length < 4 ? [...p, n] : p);

  const generatedBio = buildBio(outputs, niches);
  const canSubmit = name.trim() && igHandle.trim() && roles.length > 0 && outputs.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700));
    onSubmit({ name, igHandle, platform, handle, portfolio, roles, outputs, niches, bio: generatedBio, rateType, rateAmount, archetypeName: archetype.name });
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

      {/* Outputs — generates standardised bio */}
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <label className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>
            What will brands get from working with you? <span style={{ color: "rgba(155,127,255,0.7)" }}>*</span>
          </label>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>Pick up to 4</span>
        </div>
        <p className="text-[11px] mb-3 font-light" style={{ color: "rgba(255,255,255,0.30)" }}>
          Select the outputs you deliver. We'll build your public profile from these.
        </p>
        {Object.entries(OUTPUTS_BY_ROLE).map(([group, items]) => (
          <div key={group} className="mb-3">
            <p className="text-[9px] uppercase tracking-[0.12em] mb-1.5" style={{ color: "rgba(255,255,255,0.20)" }}>{group}</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map(o => {
                const active = outputs.includes(o);
                const maxed  = !active && outputs.length >= 4;
                return (
                  <button key={o} type="button" onClick={() => toggleOutput(o)} disabled={maxed}
                    className="px-3 py-1.5 rounded-xl text-[12px] font-light transition-all duration-100"
                    style={{
                      background: active ? "rgba(34,211,238,0.10)" : "rgba(255,255,255,0.04)",
                      border: active ? "1px solid rgba(34,211,238,0.35)" : "1px solid rgba(255,255,255,0.07)",
                      color: active ? "rgba(103,232,249,0.95)" : maxed ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.55)",
                      opacity: maxed ? 0.45 : 1,
                    }}>
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Niches */}
        <div className="mt-4">
          <div className="flex items-baseline gap-2 mb-1.5">
            <label className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>
              Industries you work in
            </label>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>Pick up to 4</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {NICHES_LIST.map(n => {
              const active = niches.includes(n);
              const maxed  = !active && niches.length >= 4;
              return (
                <button key={n} type="button" onClick={() => toggleNiche(n)} disabled={maxed}
                  className="px-3 py-1.5 rounded-xl text-[12px] font-light transition-all duration-100"
                  style={{
                    background: active ? "rgba(167,139,250,0.10)" : "rgba(255,255,255,0.04)",
                    border: active ? "1px solid rgba(167,139,250,0.35)" : "1px solid rgba(255,255,255,0.07)",
                    color: active ? "rgba(196,174,255,0.95)" : maxed ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.55)",
                    opacity: maxed ? 0.45 : 1,
                  }}>
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live bio preview */}
        {generatedBio && (
          <div className="mt-4 rounded-xl px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[9px] uppercase tracking-[0.12em] mb-1.5 font-semibold" style={{ color: "rgba(255,255,255,0.25)" }}>
              Your public profile bio
            </p>
            <p className="text-[13px] font-light leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              {generatedBio}
            </p>
          </div>
        )}
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
   TALENT TYPE SELECTION STEP
───────────────────────────────────────── */
function TalentTypeStep({ onSelect }: { onSelect: (type: TalentAccountType) => void }) {
  const cards: { type: TalentAccountType; emoji: string; title: string; sub: string; description: string; accent: string; accentBg: string; ring: string }[] = [
    {
      type: "independent",
      emoji: "🎨",
      title: "Independent Creator",
      sub: "Solo talent",
      description: "You create content, build your personal brand, and work directly with brands. Manage your own profile, bookings and rates.",
      accent: "rgba(155,127,255,0.9)",
      accentBg: "rgba(155,127,255,0.07)",
      ring: "rgba(155,127,255,0.22)",
    },
    {
      type: "manager",
      emoji: "👥",
      title: "Talent Manager",
      sub: "Represent a roster",
      description: "You manage a curated group of creators. Add talent to your roster, submit them for campaigns, and handle bookings on their behalf.",
      accent: "rgba(45,212,191,0.9)",
      accentBg: "rgba(45,212,191,0.07)",
      ring: "rgba(45,212,191,0.22)",
    },
    {
      type: "agency",
      emoji: "🏢",
      title: "Agency",
      sub: "Manage at scale",
      description: "You operate a full-service creator or talent agency. Build your company profile, onboard a large roster, and run multiple campaigns simultaneously.",
      accent: "rgba(251,191,36,0.9)",
      accentBg: "rgba(251,191,36,0.07)",
      ring: "rgba(251,191,36,0.22)",
    },
  ];

  return (
    <div className="w-full max-w-[520px] mx-auto flex flex-col items-center gap-7">
      <div className="text-center space-y-2">
        <h1 className="text-[30px] sm:text-[34px] font-medium tracking-[-0.025em] text-white leading-[1.12]">
          Join Creator Hive
        </h1>
        <p className="text-[14px] font-light max-w-[380px] mx-auto" style={{ color: "rgba(255,255,255,0.42)" }}>
          Tell us how you work — we'll tailor your experience.
        </p>
      </div>

      <div className="w-full space-y-3">
        {cards.map((card) => (
          <button
            key={card.type}
            type="button"
            onClick={() => onSelect(card.type)}
            className="w-full text-left p-4 rounded-2xl transition-all duration-150 group"
            style={{ background: card.accentBg, border: `1px solid ${card.ring}` }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = card.accentBg.replace("0.07)", "0.12)");
              (e.currentTarget as HTMLElement).style.borderColor = card.ring.replace("0.22)", "0.40)");
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = card.accentBg;
              (e.currentTarget as HTMLElement).style.borderColor = card.ring;
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[20px]"
                style={{ background: card.accentBg.replace("0.07)", "0.14)"), border: `1px solid ${card.ring}` }}
              >
                {card.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[15px] font-medium" style={{ color: "rgba(255,255,255,0.92)" }}>{card.title}</span>
                  <span className="text-[11px] font-light px-2 py-0.5 rounded-full" style={{ background: card.accentBg.replace("0.07)", "0.15)"), color: card.accent }}>
                    {card.sub}
                  </span>
                </div>
                <p className="text-[12px] font-light leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>
                  {card.description}
                </p>
              </div>
              <ChevronRight size={16} className="flex-shrink-0 self-center" style={{ color: "rgba(255,255,255,0.25)" }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MANAGER / AGENCY PROFILE STEP
───────────────────────────────────────── */
const ROSTER_SIZES = [
  { id: "1-5",   label: "1 – 5",    hint: "Boutique roster" },
  { id: "6-20",  label: "6 – 20",   hint: "Growing roster" },
  { id: "21-50", label: "21 – 50",  hint: "Mid-size agency" },
  { id: "50+",   label: "50+",      hint: "Full-scale agency" },
];

function ManagerProfileStep({
  accountType,
  onSubmit,
  onBack,
}: {
  accountType: TalentAccountType;
  onSubmit: (data: Record<string, unknown>) => void;
  onBack: () => void;
}) {
  const [companyName, setCompanyName]   = useState("");
  const [contactName, setContactName]   = useState("");
  const [whatsapp, setWhatsapp]         = useState("");
  const [rosterSize, setRosterSize]     = useState("1-5");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [submitting, setSubmitting]     = useState(false);
  const [focused, setFocused]           = useState<string | null>(null);

  const toggleRole = (r: string) =>
    setSelectedRoles(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r]);

  const canSubmit = contactName.trim() && (accountType === "independent" || companyName.trim());

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700));
    onSubmit({ companyName, contactName, whatsapp, rosterSize, roles: selectedRoles, accountType });
  };

  const isAgency = accountType === "agency";
  const accentColor = isAgency ? "rgba(251,191,36,0.9)" : "rgba(45,212,191,0.9)";
  const accentBg    = isAgency ? "rgba(251,191,36,0.07)" : "rgba(45,212,191,0.07)";
  const accentRing  = isAgency ? "rgba(251,191,36,0.22)" : "rgba(45,212,191,0.22)";

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: 300,
    color: "rgba(255,255,255,0.88)",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const focusedField = (id: string): React.CSSProperties => ({
    ...fieldStyle,
    borderColor: focused === id ? accentRing.replace("0.22)", "0.55)") : "rgba(255,255,255,0.09)",
  });

  return (
    <div className="w-full max-w-[480px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-3"
          style={{ background: accentBg, border: `1px solid ${accentRing}`, color: accentColor }}
        >
          {isAgency ? "🏢" : "👥"} {isAgency ? "Agency" : "Talent Manager"}
        </span>
        <h2 className="text-[22px] font-light tracking-[-0.025em]" style={{ color: "rgba(255,255,255,0.92)" }}>
          {isAgency ? "Tell us about your agency." : "Tell us about your management."}
        </h2>
        <p className="text-[13px] mt-1 font-light" style={{ color: "rgba(255,255,255,0.38)" }}>
          {isAgency
            ? "This sets up your agency profile on Creator Hive."
            : "This creates your talent manager profile so brands know who's behind the roster."}
        </p>
      </div>

      {/* Contact name */}
      <Field label="Your full name" required>
        <input
          style={focusedField("contact")}
          value={contactName}
          onChange={e => setContactName(e.target.value)}
          onFocus={() => setFocused("contact")}
          onBlur={() => setFocused(null)}
          placeholder="Your name"
          autoFocus
        />
      </Field>

      {/* Company / agency name */}
      {accountType !== "independent" && (
        <Field
          label={isAgency ? "Agency name" : "Management company name"}
          required
          hint={accountType === "manager" ? "Or your personal management brand" : undefined}
        >
          <input
            style={focusedField("company")}
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            onFocus={() => setFocused("company")}
            onBlur={() => setFocused(null)}
            placeholder={isAgency ? "e.g. Hive Agency" : "e.g. Talent Co."}
          />
        </Field>
      )}

      {/* WhatsApp */}
      <Field label="WhatsApp number" hint="For campaign coordination">
        <div
          className="flex items-center rounded-xl overflow-hidden transition-all duration-150"
          style={{ border: `1px solid ${focused === "wa" ? accentRing.replace("0.22)", "0.55)") : "rgba(255,255,255,0.09)"}`, background: "rgba(255,255,255,0.04)" }}
        >
          <span className="px-3 text-[14px]" style={{ color: "rgba(255,255,255,0.28)" }}>+971</span>
          <input
            style={{ ...fieldStyle, border: "none", background: "transparent", paddingLeft: 0, borderRadius: 0 }}
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ""))}
            onFocus={() => setFocused("wa")}
            onBlur={() => setFocused(null)}
            placeholder="50 123 4567"
          />
        </div>
      </Field>

      {/* Roster size */}
      <div>
        <label className="text-[10px] uppercase tracking-[0.12em] font-semibold block mb-3" style={{ color: "rgba(255,255,255,0.28)" }}>
          Current roster size
        </label>
        <div className="grid grid-cols-4 gap-2">
          {ROSTER_SIZES.map(rs => (
            <button
              key={rs.id}
              type="button"
              onClick={() => setRosterSize(rs.id)}
              className="text-center px-2 py-2.5 rounded-xl transition-all"
              style={{
                background: rosterSize === rs.id ? accentBg.replace("0.07)", "0.12)") : "rgba(255,255,255,0.03)",
                border: rosterSize === rs.id ? `1px solid ${accentRing.replace("0.22)", "0.45)")}` : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className="text-[13px] font-medium" style={{ color: rosterSize === rs.id ? accentColor : "rgba(255,255,255,0.65)" }}>
                {rs.label}
              </p>
              <p className="text-[9px] mt-0.5 font-light" style={{ color: "rgba(255,255,255,0.25)" }}>{rs.hint}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Types of talent represented */}
      <div>
        <div className="flex items-baseline gap-2 mb-3">
          <label className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>
            Types of talent you represent
          </label>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>Select all that apply</span>
        </div>
        {ROLE_GROUPS.map(g => (
          <div key={g.group} className="mb-3">
            <p className="text-[9px] uppercase tracking-[0.12em] mb-1.5" style={{ color: "rgba(255,255,255,0.22)" }}>{g.group}</p>
            <div className="flex flex-wrap gap-1.5">
              {g.roles.map(r => {
                const active = selectedRoles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRole(r)}
                    className="px-3 py-1.5 rounded-xl text-[12px] font-light transition-all duration-100"
                    style={{
                      background: active ? accentBg.replace("0.07)", "0.14)") : "rgba(255,255,255,0.04)",
                      border: active ? `1px solid ${accentRing.replace("0.22)", "0.40)")}` : "1px solid rgba(255,255,255,0.07)",
                      color: active ? accentColor : "rgba(255,255,255,0.55)",
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-[14px] font-medium transition-all"
          style={{
            background: canSubmit ? "rgba(255,255,255,0.93)" : "rgba(255,255,255,0.08)",
            color: canSubmit ? "#07070B" : "rgba(255,255,255,0.30)",
          }}
        >
          {submitting
            ? <><span className="w-4 h-4 rounded-full border-2 border-current/20 border-t-current animate-spin" /> Setting up your account…</>
            : <>Create account <ArrowRight size={15} strokeWidth={2.5} /></>
          }
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-[13px] transition-opacity hover:opacity-60"
          style={{ color: "rgba(255,255,255,0.28)" }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DONE STEP
───────────────────────────────────────── */
function DoneStep({
  firstName,
  archetype,
  accountType,
}: {
  firstName: string;
  archetype?: ReturnType<typeof scoreArchetype>;
  accountType?: TalentAccountType;
}) {
  const isManager = accountType === "manager";
  const isAgency  = accountType === "agency";
  const isManaged = isManager || isAgency;

  const headline = firstName
    ? `You're in, ${firstName}.`
    : isManaged ? "Account created." : "Application received.";

  const body = isAgency
    ? "Your agency account is ready. We're setting up your dashboard — you'll be redirected to complete your agency profile."
    : isManager
    ? "Your manager account is set up. Head to your dashboard to add talent to your roster and start submitting them for campaigns."
    : "Your profile is under review. Our team will reach out within 48 hours to confirm your spot in the Hive.";

  const badgeAccent = isAgency ? "rgba(251,191,36,0.9)" : isManager ? "rgba(45,212,191,0.9)" : null;
  const badgeLabel  = isAgency ? "🏢 Agency" : isManager ? "👥 Talent Manager" : null;

  return (
    <div className="w-full max-w-[440px] mx-auto flex flex-col items-center gap-7 text-center">
      <motion.div className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.28)", boxShadow: "0 0 32px rgba(52,211,153,0.14)" }}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}>
        <Check size={26} style={{ color: "rgba(52,211,153,0.9)" }} strokeWidth={2} />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-[28px] font-light tracking-[-0.03em]" style={{ color: "rgba(255,255,255,0.92)" }}>
          {headline}
        </h2>
        <p className="text-[14px] font-light max-w-[320px] mx-auto" style={{ color: "rgba(255,255,255,0.40)" }}>
          {body}
        </p>
      </div>

      {badgeLabel && badgeAccent && (
        <div className="px-5 py-3 rounded-2xl" style={{ background: `${badgeAccent.replace("0.9)", "0.07)")}`, border: `1px solid ${badgeAccent.replace("0.9)", "0.25)")}` }}>
          <p className="text-[12px] font-medium" style={{ color: badgeAccent }}>{badgeLabel}</p>
          <p className="text-[11px] mt-0.5 font-light" style={{ color: "rgba(255,255,255,0.40)" }}>Setting up your workspace…</p>
        </div>
      )}

      {archetype && !isManaged && (
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
export function HiveAuthModal({ open, mode, onClose, onSuccess, initialStep }: HiveAuthModalProps) {
  const router = useRouter();
  const [step, setStep]           = useState<Step>("auth");
  const [authMode, setAuthMode]   = useState<"signup" | "login">("signup");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [otpVia, setOtpVia]       = useState<"email" | "whatsapp">("email");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [prismAnswers, setPrismAnswers] = useState<Record<string, string>>({});
  const [qIndex, setQIndex]       = useState(0);
  const [archetype, setArchetype] = useState<ReturnType<typeof scoreArchetype> | null>(null);
  const [profileFirstName, setProfileFirstName] = useState("");
  const [talentAccountType, setTalentAccountType] = useState<TalentAccountType | null>(null);

  useEffect(() => {
    if (open) {
      setStep(initialStep ?? "auth");
    } else {
      setStep("auth"); setAuthMode("signup"); setEmail(""); setPhone(""); setOtpVia("email");
      setSubmitting(false); setError("");
      setPrismAnswers({}); setQIndex(0); setArchetype(null); setProfileFirstName("");
      setTalentAccountType(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        userType: authMode === "login" ? mode : mode,
        displayName: email.split("@")[0],
      });
      if (result?.ok || !result?.error || result.error.toLowerCase().includes("configuration")) {
        localStorage.setItem(`ch_${mode}_email`, email.trim().toLowerCase());
      } else {
        setError("Couldn't send link. Please try again.");
        setSubmitting(false);
        return;
      }
    } catch {
      localStorage.setItem(`ch_${mode}_email`, email.trim().toLowerCase());
    }

    setSubmitting(false);
    // All email paths go through OTP verification first
    setOtpVia("email");
    setStep("otp");
  };

  const handleGoogleClick = () => {
    signIn("google", { callbackUrl: mode === "talent" ? "/onboarding/step-1" : "/dashboard/campaigns" });
  };

  const handleWhatsAppClick = () => {
    setStep("phone");
  };

  const handlePhoneSubmit = (phoneNumber: string) => {
    setPhone(phoneNumber);
    setOtpVia("whatsapp");
    // In production: POST to /api/auth/whatsapp-otp with phoneNumber
    setStep("otp");
  };

  const handleOTPVerify = () => {
    // OTP verified — decide next step based on mode + authMode
    if (authMode === "login" || mode === "client") {
      setStep("loading");
    } else {
      // talent new signup — first choose account type
      setStep("talent-type");
    }
  };

  const handleTalentTypeSelect = (type: TalentAccountType) => {
    setTalentAccountType(type);
    if (type === "independent") {
      // Independent creators go through the Prism archetype quiz
      setStep("prism-intro");
    } else {
      // Manager / Agency go through dedicated profile setup
      setStep("manager-profile");
    }
  };

  const handleManagerProfileSubmit = (data: Record<string, unknown>) => {
    setProfileFirstName((data.contactName as string).split(" ")[0]);
    setStep("done");
    // Redirect manager/agency to agency onboarding after modal closes
    setTimeout(() => {
      onSuccess();
      onClose();
      router.push("/onboarding/agency");
    }, 2000);
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
    // Persist profile data to onboarding API (fire-and-forget)
    fetch("/api/onboarding/creator/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        instagram: data.igHandle,
        bio: data.bio,
        location: "Dubai, UAE",
        skills: data.roles,
        niches: data.niches,
        prismArchetype: data.archetypeName,
        portfolioUrl: data.portfolio,
        rateType: data.rateType,
        rateAmount: data.rateAmount,
      }),
    }).catch(() => {});
    setStep("done");
    setTimeout(() => { onSuccess(); onClose(); }, 2000);
  };

  const SIMPLE_STEPS = ["auth", "otp", "phone", "loading", "talent-type"];
  const isSimple = SIMPLE_STEPS.includes(step);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9000]"
          style={{ background: "#07070B" }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
        >
          {/* Ambient glow — white top + deep amethyst */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "60vw", maxWidth: "800px", height: "40vh",
              background: "radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.06) 50%, transparent 80%)",
              filter: "blur(120px)", opacity: 0.13, borderRadius: "50%",
            }} />
            <div style={{
              position: "absolute", top: "30%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80vw", height: "70vh",
              background: "radial-gradient(ellipse, #7c3aed 0%, #4c1d95 60%, transparent 100%)",
              filter: "blur(180px)", opacity: 0.18, borderRadius: "50%",
            }} />
          </div>

          {/* Close button — hidden during loading */}
          {step !== "loading" && (
            <button type="button" onClick={onClose}
              className="absolute top-6 left-6 z-20 flex items-center justify-center rounded-full transition-colors"
              style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}>
              <X size={15} strokeWidth={2} />
            </button>
          )}

          {/* SIMPLE STEPS: pt-[106px] pushes content down to align heading with landing page
               (landing page heading sits ~53px below screen center due to toggle pill above it;
                adding pt=2×53px to the flex container shifts center by exactly 53px) */}
          {isSimple && (
            <div className={`absolute inset-0 flex items-center justify-center px-6 ${step === "talent-type" ? "py-20 overflow-y-auto" : "pt-[106px]"}`}>
              <div className="w-full max-w-[520px]">
                <AnimatePresence mode="wait">
                  {step === "auth" && (
                    <motion.div key="auth" {...SLIDE}>
                      <AuthStep mode={mode} authMode={authMode} setAuthMode={setAuthMode}
                        email={email} setEmail={setEmail}
                        submitting={submitting} error={error}
                        onEmailSubmit={handleEmailSubmit}
                        onGoogleClick={handleGoogleClick}
                        onWhatsAppClick={handleWhatsAppClick} />
                    </motion.div>
                  )}
                  {step === "otp" && (
                    <motion.div key="otp" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                      <OTPStep
                        destination={otpVia === "whatsapp" ? phone : email}
                        via={otpVia}
                        onVerify={handleOTPVerify}
                        onBack={() => setStep(otpVia === "whatsapp" ? "phone" : "auth")}
                        onResend={() => { /* re-send OTP */ }}
                      />
                    </motion.div>
                  )}
                  {step === "phone" && (
                    <motion.div key="phone" {...SLIDE}>
                      <PhoneStep onSubmit={handlePhoneSubmit} onBack={() => setStep("auth")} />
                    </motion.div>
                  )}
                  {step === "loading" && (
                    <motion.div key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}>
                      <LoadingStep onDone={() => { onSuccess(); onClose(); }} />
                    </motion.div>
                  )}
                  {step === "talent-type" && (
                    <motion.div key="talent-type" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                      <TalentTypeStep onSelect={handleTalentTypeSelect} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* COMPLEX STEPS: scrollable column for prism/profile/done */}
          {!isSimple && (
            <div className="absolute inset-0 overflow-y-auto flex flex-col">
              <div className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-[520px]">
                  <AnimatePresence mode="wait">
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
                    {step === "manager-profile" && talentAccountType && talentAccountType !== "independent" && (
                      <motion.div key="manager-profile" {...SLIDE}>
                        <ManagerProfileStep
                          accountType={talentAccountType}
                          onSubmit={handleManagerProfileSubmit}
                          onBack={() => setStep("talent-type")}
                        />
                      </motion.div>
                    )}
                    {step === "done" && (
                      <motion.div key="done" {...SLIDE}>
                        <DoneStep
                          firstName={profileFirstName}
                          archetype={archetype ?? undefined}
                          accountType={talentAccountType ?? undefined}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* Bottom bar — Fey-style (only on auth/phone steps) */}
          {(step === "auth" || step === "phone" || step === "talent-type") && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4"
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
                By continuing, you agree to our{" "}
                <a href="/terms" className="underline hover:no-underline" style={{ color: "rgba(255,255,255,0.35)" }}>Terms of Service</a>.
              </p>
            </motion.div>
          )}

          {/* Inline styles */}
          <style>{`
            select option { background: #111118; color: rgba(255,255,255,0.88); }
            input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22) !important; }
            input:focus, select:focus, textarea:focus { border-color: rgba(155,127,255,0.45) !important; }
            @keyframes chSpin {
              0%   { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
