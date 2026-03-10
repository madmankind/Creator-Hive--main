'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function OnboardingStep1Client() {
  const router = useRouter();
  const [selected, setSelected] = useState<'independent' | 'agency' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    setError(null);

    if (selected === 'agency') {
      router.push('/discovery');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/onboarding/creator/start', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Unable to start onboarding');
      }
      router.push('/onboarding/step-2');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#07070B', color: 'rgba(255,255,255,0.88)' }}>
      {/* Bg gradients */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(900px 600px at 30% 15%, rgba(124,92,255,0.10) 0%, transparent 60%), radial-gradient(700px 500px at 70% 80%, rgba(0,220,255,0.05) 0%, transparent 60%)',
        zIndex: 0,
      }} />

      <div className="relative z-10 mx-auto max-w-xl px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <button
            onClick={() => router.push('/')}
            className="text-[13px] transition-opacity hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.30)' }}
          >
            ← Back
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.85)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>
        </header>

        <div className="mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
            style={{ color: 'rgba(255,255,255,0.22)' }}>
            Creator Hive · Join as
          </p>
          <h1 className="text-[28px] font-light tracking-[-0.02em] leading-snug mb-2">
            Choose your account type
          </h1>
          <p className="text-[13px] font-light" style={{ color: 'rgba(255,255,255,0.40)' }}>
            This shapes your experience on the platform
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[
            { id: 'independent' as const, emoji: '👤', title: 'Creator', sub: 'I create content and want to get booked for campaigns' },
            { id: 'agency' as const, emoji: '🏢', title: 'Agency / Brand', sub: 'I represent multiple creators or manage campaigns' },
          ].map((opt) => (
            <motion.button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-left rounded-2xl px-6 py-5 transition-all"
              style={{
                background: selected === opt.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${selected === opt.id ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <div className="text-2xl mb-3">{opt.emoji}</div>
              <h3 className="text-[15px] font-medium tracking-[-0.01em] mb-1">
                {opt.title}
              </h3>
              <p className="text-[13px] font-light" style={{ color: 'rgba(255,255,255,0.40)' }}>
                {opt.sub}
              </p>
            </motion.button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full rounded-xl py-3.5 text-[14px] font-medium transition-all"
          style={{
            background: selected ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: selected ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.25)',
            cursor: selected && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Please wait…' : 'Continue →'}
        </button>

        {error && (
          <p className="mt-3 text-[13px]" style={{ color: '#f87171' }}>{error}</p>
        )}
      </div>
    </main>
  );
}
