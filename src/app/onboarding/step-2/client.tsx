'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { redirectByRole } from '@/server/authz';
import type { PrismArchetypeName } from '@/lib/curatedTalent';

// ── Prism Archetype Quiz ───────────────────────────────────────────────
const ARCHETYPES: PrismArchetypeName[] = [
  'The Maverick','The Amplifier','The Architect','The Auteur',
  'The Translator','The Conductor','The Alchemist','The Pathfinder',
];

type ArchetypeScores = Record<PrismArchetypeName, number>;
function emptyScores(): ArchetypeScores {
  return Object.fromEntries(ARCHETYPES.map((a) => [a, 0])) as ArchetypeScores;
}

interface QuizOption { text: string; weights: Partial<ArchetypeScores> }
interface QuizQuestion { q: string; options: QuizOption[] }

const QUIZ: QuizQuestion[] = [
  {
    q: 'How do you approach a new brief?',
    options: [
      { text: 'Jump in and iterate fast',                         weights: { 'The Maverick': 3 } },
      { text: 'Research deeply, then plan every step',            weights: { 'The Architect': 3 } },
      { text: 'Understand the brand story and aesthetic first',   weights: { 'The Auteur': 3 } },
      { text: 'Think about the audience and how it spreads',      weights: { 'The Amplifier': 3 } },
    ],
  },
  {
    q: 'What describes your strongest work?',
    options: [
      { text: 'Raw, authentic, relatable content that converts', weights: { 'The Amplifier': 3 } },
      { text: 'Cinematic, high-production with a distinct POV',   weights: { 'The Auteur': 3 } },
      { text: 'Clean, structured, systematic output',             weights: { 'The Architect': 3 } },
      { text: 'Fast and flexible across any format',             weights: { 'The Maverick': 3 } },
    ],
  },
  {
    q: 'Your natural role in a creative team?',
    options: [
      { text: "The executor — gets things shipped",              weights: { 'The Maverick': 3 } },
      { text: 'The visionary — sets the creative direction',     weights: { 'The Auteur': 3 } },
      { text: 'The orchestrator — keeps everyone aligned',       weights: { 'The Conductor': 3 } },
      { text: 'The end-to-end guide — concept to delivery',      weights: { 'The Pathfinder': 3 } },
    ],
  },
  {
    q: 'Which brand category gets you most excited?',
    options: [
      { text: 'Luxury, editorial, premium lifestyle',             weights: { 'The Auteur': 3 } },
      { text: 'Consumer brands, everyday products',              weights: { 'The Amplifier': 3 } },
      { text: 'B2B, tech, complex ideas',                        weights: { 'The Translator': 3 } },
      { text: 'Fast-moving startups and performance brands',      weights: { 'The Maverick': 2, 'The Architect': 1 } },
    ],
  },
  {
    q: 'How do you communicate a complex idea?',
    options: [
      { text: 'Make it visual and emotionally intuitive',         weights: { 'The Alchemist': 3 } },
      { text: 'Strip it down to a clear, simple story',          weights: { 'The Translator': 3 } },
      { text: 'Build a structured framework or system',           weights: { 'The Architect': 3 } },
      { text: 'Show real people experiencing it',                weights: { 'The Amplifier': 3 } },
    ],
  },
  {
    q: 'Your ideal campaign output looks like…',
    options: [
      { text: 'One defining, brand-shaping creative piece',       weights: { 'The Auteur': 3 } },
      { text: 'A scalable multi-format content system',           weights: { 'The Architect': 3 } },
      { text: 'A coordinated multi-creator push across channels', weights: { 'The Conductor': 3 } },
      { text: 'End-to-end production from concept to publish',    weights: { 'The Pathfinder': 3 } },
    ],
  },
  {
    q: 'Where does your creative spark live?',
    options: [
      { text: 'In the visuals — colour, texture, form',          weights: { 'The Alchemist': 3 } },
      { text: 'In the audience — empathy and storytelling',       weights: { 'The Amplifier': 2, 'The Translator': 1 } },
      { text: 'In the process — map it all out first',            weights: { 'The Pathfinder': 3 } },
      { text: 'In the moment — start and discover as I go',      weights: { 'The Maverick': 3 } },
    ],
  },
];

const ARCHETYPE_DESCRIPTIONS: Record<PrismArchetypeName, string> = {
  'The Maverick':   'Fast-moving, adaptable creator who thrives on variety and quick turnarounds.',
  'The Amplifier':  'Authentic UGC creator who amplifies brand messages through relatable content.',
  'The Architect':  'Structured systems-builder who creates scalable, high-performance content.',
  'The Auteur':     'Luxury-focused creator with a distinct aesthetic and editorial vision.',
  'The Translator': 'B2B specialist who turns complex ideas into clear, compelling narratives.',
  'The Conductor':  'Strategic orchestrator who coordinates multi-platform campaigns and teams.',
  'The Alchemist':  'Visual designer who transforms brand briefs into cohesive identities.',
  'The Pathfinder': 'End-to-end producer who guides projects from concept to delivery.',
};

const SKILLS = [
  'Content Creation','Photography','Videography','Graphic Design',
  'Social Media','Copywriting','Marketing','Brand Strategy',
  'Animation','Art Direction','SEO','Editing',
];

// ── Shared glass input style ───────────────────────────────────────────
const inputCls = [
  'w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-colors',
  'bg-white/[0.04] ring-1 ring-white/[0.08] text-white/90 placeholder:text-white/30',
  'focus:ring-white/20 focus:bg-white/[0.06]',
].join(' ');

// ── Main component ─────────────────────────────────────────────────────
export default function BuildProfileClient() {
  const router  = useRouter();
  const { data: session } = useSession();

  // ── Phase: 'quiz' | 'profile' ──
  const [phase, setPhase]               = useState<'quiz' | 'profile'>('quiz');
  const [qIndex, setQIndex]             = useState(0);
  const [scores, setScores]             = useState<ArchetypeScores>(emptyScores());
  const [selectedOpt, setSelectedOpt]   = useState<number | null>(null);
  const [archetype, setArchetype]       = useState<PrismArchetypeName | null>(null);

  // ── Profile fields ──
  const [name,         setName]         = useState('');
  const [oneLiner,     setOneLiner]     = useState('');
  const [selectedSkills, setSkills]     = useState<string[]>([]);
  const [instagram,    setInstagram]    = useState('');
  const [location,     setLocation]     = useState('');
  const [niches,       setNiches]       = useState('');
  const [hourlyRate,   setHourlyRate]   = useState('');
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const { data: existing } = useSWR('/api/onboarding/creator/profile', (u) =>
    fetch(u).then((r) => r.json()),
  );
  useEffect(() => {
    if (!existing?.profile) return;
    const p = existing.profile;
    setName(p.name || '');
    setOneLiner(p.bio || '');
    setSkills(p.skills || []);
    setHourlyRate(p.hourlyRate ? String(p.hourlyRate) : '');
    setInstagram(p.instagram || '');
    setLocation(p.location || '');
    setNiches((p.niches || []).join(', '));
    if (p.prismArchetype) {
      setArchetype(p.prismArchetype as PrismArchetypeName);
      setPhase('profile');
    }
  }, [existing]);

  // ── Quiz logic ──────────────────────────────────────────────────────
  const handleOptionClick = (i: number) => setSelectedOpt(i);

  const handleNext = () => {
    if (selectedOpt === null) return;
    const opt = QUIZ[qIndex].options[selectedOpt];
    const next = { ...scores };
    for (const [k, v] of Object.entries(opt.weights)) {
      next[k as PrismArchetypeName] = (next[k as PrismArchetypeName] || 0) + (v as number);
    }
    setScores(next);
    setSelectedOpt(null);
    if (qIndex + 1 < QUIZ.length) {
      setQIndex((x) => x + 1);
    } else {
      const winner = (Object.entries(next) as [PrismArchetypeName, number][])
        .sort((a, b) => b[1] - a[1])[0][0];
      setArchetype(winner);
      setPhase('profile');
    }
  };

  // ── Profile save ────────────────────────────────────────────────────
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
          hourlyRate,
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

  const progress = phase === 'quiz'
    ? Math.round(((qIndex) / QUIZ.length) * 50)
    : 50 + Math.round((Object.values({ name, instagram, location }).filter(Boolean).length / 3) * 50);

  return (
    <main className="relative min-h-screen" style={{ background: '#07070B', color: 'rgba(255,255,255,0.88)' }}>
      {/* Bg gradients */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(900px 600px at 30% 15%, rgba(124,92,255,0.12) 0%, transparent 60%), radial-gradient(700px 500px at 70% 80%, rgba(0,220,255,0.06) 0%, transparent 60%)' }} />

      <div className="relative z-10 mx-auto max-w-xl px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <button onClick={() => phase === 'profile' && qIndex === 0 ? setPhase('quiz') : router.push('/onboarding/step-1')}
            className="text-[13px] transition-opacity hover:opacity-60" style={{ color: 'rgba(255,255,255,0.35)' }}>
            ← Back
          </button>
          <div className="flex-1 mx-6">
            <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'rgba(255,255,255,0.55)' }} />
            </div>
          </div>
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {phase === 'quiz' ? `${qIndex + 1} / ${QUIZ.length}` : 'Profile'}
          </span>
        </header>

        <AnimatePresence mode="wait">
          {phase === 'quiz' ? (
            <motion.div key={`q-${qIndex}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Prism · Question {qIndex + 1}</p>
              <h2 className="text-[26px] font-light tracking-[-0.02em] mb-8 leading-tight">{QUIZ[qIndex].q}</h2>
              <div className="space-y-3">
                {QUIZ[qIndex].options.map((opt, i) => (
                  <button key={i} type="button" onClick={() => handleOptionClick(i)}
                    className="w-full text-left rounded-2xl px-5 py-4 transition-all duration-150"
                    style={{
                      background: selectedOpt === i ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedOpt === i ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}`,
                      color: selectedOpt === i ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.55)',
                    }}>
                    <span className="text-[14px] font-light">{opt.text}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleNext} disabled={selectedOpt === null}
                className="mt-8 w-full rounded-xl py-3.5 text-[14px] font-medium transition-all"
                style={{
                  background: selectedOpt !== null ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: selectedOpt !== null ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.25)',
                  cursor: selectedOpt !== null ? 'pointer' : 'not-allowed',
                }}>
                {qIndex + 1 < QUIZ.length ? 'Next →' : 'See my archetype →'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }}>
              {/* Archetype reveal */}
              {archetype && (
                <div className="mb-10 rounded-2xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>Your Prism archetype</p>
                  <p className="text-[20px] font-medium tracking-[-0.01em] mb-1">{archetype}</p>
                  <p className="text-[13px] font-light" style={{ color: 'rgba(255,255,255,0.45)' }}>{ARCHETYPE_DESCRIPTIONS[archetype]}</p>
                  <button onClick={() => { setPhase('quiz'); setQIndex(0); setScores(emptyScores()); setSelectedOpt(null); }}
                    className="mt-3 text-[11px] transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    Retake quiz →
                  </button>
                </div>
              )}
              <h2 className="text-[26px] font-light tracking-[-0.02em] mb-6">Build your profile</h2>
              <div className="space-y-5">
                <div><label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Full name *</label>
                  <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Reyes" /></div>
                <div><label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Short bio</label>
                  <textarea className={inputCls + ' h-20 resize-none'} value={oneLiner} onChange={(e) => setOneLiner(e.target.value)} placeholder="What do you do best?" /></div>
                <div><label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Instagram *</label>
                  <input className={inputCls} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" /></div>
                <div><label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Location *</label>
                  <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Dubai, UAE" /></div>
                <div>
                  <label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Skills <span style={{ color: 'rgba(255,255,255,0.22)' }}>(up to 3)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map((s) => (
                      <button key={s} type="button" onClick={() => setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 3 ? [...prev, s] : prev)}
                        className="rounded-full px-3 py-1.5 text-[12px] transition-all"
                        style={{ background: selectedSkills.includes(s) ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedSkills.includes(s) ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.08)'}`, color: selectedSkills.includes(s) ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.40)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Niches <span style={{ color: 'rgba(255,255,255,0.22)' }}>(comma separated)</span></label>
                  <input className={inputCls} value={niches} onChange={(e) => setNiches(e.target.value)} placeholder="beauty, wellness, travel" /></div>
                <div><label className="block text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Monthly rate (AED)</label>
                  <input className={inputCls} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="e.g. 5000" type="number" /></div>
              </div>
              {error && <p className="mt-4 text-[13px] text-red-400">{error}</p>}
              <button onClick={handleSave} disabled={saving || !name || !instagram || !location}
                className="mt-8 w-full rounded-xl py-3.5 text-[14px] font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.88)', opacity: (saving || !name || !instagram || !location) ? 0.4 : 1, cursor: (saving || !name || !instagram || !location) ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Saving…' : 'Complete profile →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
