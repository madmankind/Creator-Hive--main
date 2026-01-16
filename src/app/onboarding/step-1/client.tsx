'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function OnboardingStep1Client() {
  const router = useRouter()
  const [selected, setSelected] = useState<'independent' | 'agency' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!selected) return;
    setError(null);

    if (selected === "agency") {
      router.push("/discovery");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/onboarding/creator/start", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Unable to start onboarding");
      }
      router.push("/onboarding/step-2");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <button 
            onClick={() => router.push('/')}
            className="text-sm text-white/70 hover:text-white transition"
          >
            ← Change account type
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/90"></div>
            <div className="w-2 h-2 rounded-full bg-white/20"></div>
          </div>
        </header>

        {/* Content */}
        <div className="text-center mb-16">
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.01em] text-white/90 mb-4">
            Choose your account type
          </h1>
          <p className="text-[14px] text-white/60">
            This helps us customize your experience
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <motion.button
            onClick={() => setSelected('independent')}
            className={`p-8 rounded-2xl ring-1 transition-all text-left ${
              selected === 'independent' 
                ? 'ring-[rgb(var(--ring))] bg-white/5' 
                : 'ring-white/10 hover:ring-white/20 hover:bg-white/3'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-2xl mb-4">👤</div>
            <h3 className="text-lg font-medium text-white mb-2">Independent</h3>
            <p className="text-sm text-white/60">
              I work solo and manage my own projects
            </p>
          </motion.button>

          <motion.button
            onClick={() => setSelected('agency')}
            className={`p-8 rounded-2xl ring-1 transition-all text-left ${
              selected === 'agency' 
                ? 'ring-[rgb(var(--ring))] bg-white/5' 
                : 'ring-white/10 hover:ring-white/20 hover:bg-white/3'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-2xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-white mb-2">Agency</h3>
            <p className="text-sm text-white/60">
              I represent multiple creators or run a team
            </p>
          </motion.button>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selected || loading}
            className="rounded-full px-8 py-3 text-[14px] bg-white/10 ring-1 ring-white/10
                       hover:bg-white/15 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait…" : "Continue"}
          </button>
          {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        </div>
      </div>
    </main>
  )
}
