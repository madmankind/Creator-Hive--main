'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { redirectByRole } from '@/server/authz';
import type { PrismArchetypeName } from '@/lib/curatedTalent';

// ── Prism Compass Axes ───────────────────────────────────────────────
type XAxis = 'Logic' | 'Intuition';
type YAxis = 'Macro' | 'Micro';
type Variant = 'Outer' | 'Inner';

// Canonical 4-question "Origin Story" assessment per Prism Methodology
const PRISM_QUESTIONS = [
  {
    id: 'canvas',
    label: 'The Canvas',
    sublabel: 'Question 1 of 4',
    q: 'When you start a project, what do you instinctively reach for?',
    axis: 'x' as const,
    options: [
      { text: 'Blank sheet of paper or a mood board', value: 'Intuition' as XAxis },
      { text: 'Spreadsheet, data, or a code editor', value: 'Logic' as XAxis },
    ],
  },
  {
    id: 'horizon',
    label: 'The Horizon',
    sublabel: 'Question 2 of 4',
    q: 'Which phase of work gives you the most flow state?',
    axis: 'y' as const,
    options: [
      { text: 'Defining the 5-year vision or brand strategy', value: 'Macro' as YAxis },
      { text: 'Perfecting the specific details, code, or pixels', value: 'Micro' as YAxis },
    ],
  },
  {
    id: 'energy',
    label: 'The Energy',
    sublabel: 'Question 3 of 4',
    q: 'How do you produce your absolute best work?',
    axis: 'v' as const,
    options: [
      { text: '"The Cave" — deep, uninterrupted solo focus', value: 'Outer' as Variant },
      { text: '"The Pit" — high-energy, bouncing ideas with a team', value: 'Inner' as Variant },
    ],
  },
  {
    id: 'friction',
    label: 'The Friction',
    sublabel: 'Question 4 of 4',
    q: "What drains your battery faster?",
    axis: 'val' as const,
    options: [
      { text: 'Rigid rules, micromanagement, or being told how to do things', value: 'A' },
      { text: 'Vague briefs, no clear metrics, or undefined success', value: 'B' },
    ],
  },
] as const;

// Scoring matrix
function deriveArchetype(x: XAxis, y: YAxis, v: Variant, _friction: string): PrismArchetypeName {
  const key = `${x}-${y}-${v}` as const;
  const map: Record<string, PrismArchetypeName> = {
    'Logic-Macro-Outer':     'The Pathfinder',
    'Logic-Macro-Inner':     'The Translator',
    'Logic-Micro-Outer':     'The Architect',
    'Logic-Micro-Inner':     'The Alchemist',
    'Intuition-Macro-Outer': 'The Maverick',
    'Intuition-Macro-Inner': 'The Conductor',
    'Intuition-Micro-Outer': 'The Auteur',
    'Intuition-Micro-Inner': 'The Amplifier',
  };
  return map[key] ?? 'The Maverick';
}

const ARCHETYPE_META: Record<PrismArchetypeName, { tagline: string; detail: string; accent: string }> = {
  'The Pathfinder':  { tagline: 'The Navigator', detail: 'You see the future and rely on data to map the route. You define strategy and KPIs before lifting a finger.', accent: 'rgba(0,220,255,0.8)' },
  'The Translator':  { tagline: 'The Bridge', detail: 'You sit between technical systems and human understanding. You turn complex concepts into clear stakeholder stories.', accent: 'rgba(52,211,153,0.8)' },
  'The Architect':   { tagline: 'The Builder', detail: "You're obsessed with stability, efficiency, and systems that don't break. Structure is your creative output.", accent: 'rgba(99,102,241,0.8)' },
  'The Alchemist':   { tagline: 'The Scientist', detail: 'You use logic to transform raw data into ROI. You are heavy on experimentation, testing, and growth loops.', accent: 'rgba(234,179,8,0.8)' },
  'The Maverick':    { tagline: 'The Visionary Disruptor', detail: 'High vision, high risk tolerance. You break rules to find zero-to-one solutions and thrive in autonomy.', accent: 'rgba(229,72,77,0.8)' },
  'The Conductor':   { tagline: 'The Harmonizer', detail: 'You use emotional intelligence to align people and vision. You manage the beautiful chaos of creative teams.', accent: 'rgba(167,139,250,0.8)' },
  'The Auteur':      { tagline: 'The Artist', detail: 'Uncompromising vision and craft. You require deep focus to produce world-class aesthetic or narrative output.', accent: 'rgba(251,146,60,0.8)' },
  'The Amplifier':   { tagline: 'The Voice', detail: 'Reactive, high-energy, and socially attuned. You take a brand message and scale it to the masses.', accent: 'rgba(34,211,238,0.8)' },
};

const SKILLS = [
  'Content Creation','Photography','Videography','Graphic Design',
  'Social Media','Copywriting','Marketing','Brand Strategy',
  'Animation','Art Direction','SEO','Editing',
];

const inputCls = [
  'w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-colors',
  'bg-white/[0.04] ring-1 ring-white/[0.08] text-white/90 placeholder:text-white/30',
  'focus:ring-white/20 focus:bg-white/[0.06]',
].join(' ');

// ── Main component ─────────────────────────────────────────────────────
export default function BuildProfileClient() {
  const router  = useRouter();
  const { data: session } = useSession();

  // Phase: 'quiz' | 'reveal' | 'profile'
  const [phase, setPhase]      = useState<'quiz' | 'reveal' | 'profile'>('quiz');
  const [qIndex, setQIndex]    = useState(0);
  const [answers, setAnswers]  = useState<{ x?: XAxis; y?: YAxis; v?: Variant; friction?: string }>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [archetype, setArchetype] = useState<PrismArchetypeName | null>(null);

  // Profile fields
  const [name,           setName]      = useState('');
  const [oneLiner,     setOneLiner]    = useState('');
  const [selectedSkills, setSkills]    = useState<string[]>([]);
  const [instagram,    setInstagram]   = useState('');
  const [location,     setLocation]    = useState('');
  const [niches,       setNiches]      = useState('');
  const [monthlyRate,  setMonthlyRate] = useState('');
  const [saving,       setSaving]      = useState(false);
  const [error,        setError]       = useState<string | null>(null);

  const { data: existing } = useSWR('/api/onboarding/creator/profile', (u) =>
    fetch(u).then((r) => r.json()),
  );

  useEffect(() => {
    if (!existing?.profile) return;
    const p = existing.profile;
    setName(p.name || '');
    setOneLiner(p.bio || '');
    setSkills(p.skills || []);
    setMonthlyRate(p.hourlyRate ? String(p.hourlyRate) : '');
    setInstagram(p.instagram || '');
    setLocation(p.location || '');
    setNiches((p.niches || []).join(', '));
    if (p.prismArchetype) {
      setArchetype(p.prismArchetype as PrismArchetypeName);
      setPhase('profile');
    }
  }, [existing]);

  // Quiz navigation
  const handleNext = () => {
    if (selected === null) return;
    const q = PRISM_QUESTIONS[qIndex];
    const opt = q.options[selected];
    const next = { ...answers };

    if (q.axis === 'x') next.x = (opt as { value: XAxis }).value;
    else if (q.axis === 'y') next.y = (opt as { value: YAxis }).value;
    else if (q.axis === 'v') next.v = (opt as { value: Variant }).value;
    else next.friction = (opt as { value: string }).value;

    setAnswers(next);
    setSelected(null);

    if (qIndex + 1 < PRISM_QUESTIONS.length) {
      setQIndex((i) => i + 1);
    } else {
      // Compute archetype
      const arch = deriveArchetype(
        next.x ?? 'Intuition',
        next.y ?? 'Micro',
        next.v ?? 'Inner',
        next.friction ?? 'A',
      );
      setArchetype(arch);
      setPhase('reveal');
    }
  };

  const handleRetake = () => {
    setPhase('quiz');
    setQIndex(0);
    setAnswers({});
    setSelected(null);
    setArchetype(null);
  };

  // Profile save
  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/onboarding/creator/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, instagram, bio: oneLiner, location,
          skills: selectedSkills,
          niches: niches.split(',').map((n) => n.trim()).filter(Boolean),
          hourlyRate: monthlyRate,
          prismArchetype: archetype,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Failed to save profile');
      }
      const role = (session?.user as { role?: string } | null)?.role;
      router.push(redirectByRole(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const quizProgress = phase === 'quiz' ? Math.round((qIndex / PRISM_QUESTIONS.length) * 100) : 100;
  const currentQ = PRISM_QUESTIONS[qIndex];
  const meta = archetype ? ARCHETYPE_META[archetype] : null;

  return (
    <main style={{ minHeight: '100vh', background: '#07070B', color: 'rgba(255,255,255,0.88)' }}>
      {/* Bg gradients */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(900px 600px at 30% 15%, rgba(124,92,255,0.10) 0%, transparent 60%), radial-gradient(700px 500px at 70% 80%, rgba(0,220,255,0.05) 0%, transparent 60%)',
        zIndex: 0,
      }} />

      <div className="relative z-10 mx-auto max-w-lg px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <button
            onClick={() => phase === 'profile' ? setPhase('reveal') : qIndex > 0 ? setQIndex((i) => i - 1) : router.push('/onboarding/step-1')}
            className="text-[13px] transition-opacity hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.30)' }}
          >
            ← Back
          </button>
          <div className="flex-1 mx-6">
            <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${quizProgress}%`, background: meta?.accent ?? 'rgba(255,255,255,0.45)' }} />
            </div>
          </div>
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {phase === 'quiz' ? `${qIndex + 1} / ${PRISM_QUESTIONS.length}` : phase === 'reveal' ? 'Your archetype' : 'Profile'}
          </span>
        </header>

        <AnimatePresence mode="wait">

          {/* ─── QUIZ PHASE ─────────────────────────────────────────── */}
          {phase === 'quiz' && (
            <motion.div
              key={`q-${qIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2"
                style={{ color: 'rgba(255,255,255,0.22)' }}>
                Origin Story · {currentQ.sublabel}
              </p>
              <p className="text-[11px] font-medium tracking-[0.06em] mb-3"
                style={{ color: 'rgba(255,255,255,0.40)' }}>
                {currentQ.label}
              </p>
              <h2 className="text-[24px] font-light tracking-[-0.02em] mb-8 leading-snug">
                {currentQ.q}
              </h2>
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelected(i)}
                    className="w-full text-left rounded-2xl px-5 py-4 transition-all duration-150"
                    style={{
                      background: selected === i ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${selected === i ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}`,
                      color: selected === i ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.50)',
                    }}
                  >
                    <span className="text-[14px] font-light">{opt.text}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={selected === null}
                className="mt-8 w-full rounded-xl py-3.5 text-[14px] font-medium transition-all"
                style={{
                  background: selected !== null ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: selected !== null ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.22)',
                  cursor: selected !== null ? 'pointer' : 'not-allowed',
                }}
              >
                {qIndex + 1 < PRISM_QUESTIONS.length ? 'Next →' : 'Reveal my archetype →'}
              </button>
            </motion.div>
          )}

          {/* ─── ARCHETYPE REVEAL PHASE ──────────────────────────────── */}
          {phase === 'reveal' && archetype && meta && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="text-center"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-6"
                style={{ color: 'rgba(255,255,255,0.22)' }}>
                Prism · Your Origin Story
              </p>
              {/* Archetype glow badge */}
              <div className="relative mx-auto mb-6" style={{ width: 88, height: 88 }}>
                <div className="absolute inset-0 rounded-full blur-xl opacity-40"
                  style={{ background: meta.accent }} />
                <div className="relative w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${meta.accent}40`,
                    boxShadow: `0 0 32px ${meta.accent}30`,
                  }}>
                  <span style={{ fontSize: 32 }}>◈</span>
                </div>
              </div>
              <p className="text-[11px] tracking-[0.1em] mb-1" style={{ color: meta.accent }}>
                {meta.tagline.toUpperCase()}
              </p>
              <h2 className="text-[32px] font-light tracking-[-0.02em] mb-3">{archetype}</h2>
              <p className="text-[14px] font-light leading-relaxed max-w-xs mx-auto mb-8"
                style={{ color: 'rgba(255,255,255,0.45)' }}>
                {meta.detail}
              </p>
              <button
                onClick={() => setPhase('profile')}
                className="w-full rounded-xl py-3.5 text-[14px] font-medium transition-all mb-3"
                style={{
                  background: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.88)',
                }}
              >
                Build my profile →
              </button>
              <button
                onClick={handleRetake}
                className="text-[12px] transition-opacity hover:opacity-80"
                style={{ color: 'rgba(255,255,255,0.28)' }}
              >
                Retake Origin Story
              </button>
            </motion.div>
          )}

          {/* ─── PROFILE PHASE ───────────────────────────────────────── */}
          {phase === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
            >
              {/* Archetype mini card */}
              {archetype && meta && (
                <div className="flex items-center gap-3 mb-8 rounded-xl px-4 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: `1px solid ${meta.accent}25`,
                  }}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: `${meta.accent}18`, border: `1px solid ${meta.accent}35` }}>
                    <span style={{ fontSize: 14 }}>◈</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-[0.08em]" style={{ color: meta.accent }}>{meta.tagline}</p>
                    <p className="text-[13px] font-medium">{archetype}</p>
                  </div>
                  <button
                    onClick={handleRetake}
                    className="ml-auto text-[11px] flex-shrink-0 transition-opacity hover:opacity-70"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                  >
                    Retake
                  </button>
                </div>
              )}

              <h2 className="text-[26px] font-light tracking-[-0.02em] mb-6">Build your profile</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>Full name *</label>
                  <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Reyes" />
                </div>
                <div>
                  <label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>Short bio</label>
                  <textarea className={inputCls + ' h-20 resize-none'} value={oneLiner} onChange={(e) => setOneLiner(e.target.value)} placeholder="What do you do best?" />
                </div>
                <div>
                  <label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>Instagram *</label>
                  <input className={inputCls} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" />
                </div>
                <div>
                  <label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>Location *</label>
                  <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Dubai, UAE" />
                </div>
                <div>
                  <label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    Skills <span style={{ color: 'rgba(255,255,255,0.20)' }}>(up to 3)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map((s) => (
                      <button key={s} type="button"
                        onClick={() => setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 3 ? [...prev, s] : prev)}
                        className="rounded-full px-3 py-1.5 text-[12px] transition-all"
                        style={{
                          background: selectedSkills.includes(s) ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.025)',
                          border: `1px solid ${selectedSkills.includes(s) ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.07)'}`,
                          color: selectedSkills.includes(s) ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.38)',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    Niches <span style={{ color: 'rgba(255,255,255,0.20)' }}>(comma separated)</span>
                  </label>
                  <input className={inputCls} value={niches} onChange={(e) => setNiches(e.target.value)} placeholder="beauty, wellness, travel" />
                </div>
                <div>
                  <label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>Monthly rate (AED)</label>
                  <input className={inputCls} value={monthlyRate} onChange={(e) => setMonthlyRate(e.target.value)} placeholder="e.g. 5000" type="number" />
                </div>
              </div>

              {error && <p className="mt-4 text-[13px]" style={{ color: '#f87171' }}>{error}</p>}

              <button
                onClick={handleSave}
                disabled={saving || !name || !instagram || !location}
                className="mt-8 w-full rounded-xl py-3.5 text-[14px] font-medium transition-all"
                style={{
                  background: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.88)',
                  opacity: (saving || !name || !instagram || !location) ? 0.35 : 1,
                  cursor: (saving || !name || !instagram || !location) ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving…' : 'Complete profile →'}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
