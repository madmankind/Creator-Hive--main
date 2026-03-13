"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Briefcase, Users, Target, ChevronRight, Check, Sparkles } from "lucide-react";

type Step = 1 | 2 | 3;

const GOALS = [
  { id: "ugc", label: "UGC Content", desc: "User-generated content for ads & social" },
  { id: "influencer", label: "Influencer Posts", desc: "Authentic posts on creators own channels" },
  { id: "production", label: "Video Production", desc: "Professional brand videos & reels" },
  { id: "strategy", label: "Content Strategy", desc: "Ongoing content planning & execution" },
];

const BUDGETS = [
  { id: "5k", label: "AED 5K–15K", sub: "1–2 creators" },
  { id: "15k", label: "AED 15K–50K", sub: "3–5 creators" },
  { id: "50k", label: "AED 50K–150K", sub: "5–12 creators" },
  { id: "150k+", label: "AED 150K+", sub: "Full campaign pod" },
];

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
};

export function AgencyOnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleGoal = (id: string) => setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

  const finish = async () => {
    setSaving(true);
    await fetch("/api/agency/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: agencyName || "My Agency", website, goals: selectedGoals, budget }),
    }).catch(() => {});
    router.push("/dashboard/campaigns");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ background: "#07070B", color: "rgba(255,255,255,0.88)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 60%)", opacity: 0.08 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, #7c3aed 0%, #4c1d95 55%, transparent 100%)", filter: "blur(180px)", opacity: 0.09 }} />

      <div className="relative z-10 w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {([1, 2, 3] as const).map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                style={{ background: step >= s ? "rgba(124,92,255,0.40)" : "rgba(255,255,255,0.08)", color: step >= s ? "rgba(167,139,250,0.95)" : "rgba(255,255,255,0.35)", boxShadow: step >= s ? "0 0 0 1px rgba(124,92,255,0.45)" : "none" }}>
                {step > s ? <Check className="w-3 h-3" /> : s}
              </div>
              {s < 3 && <div className="w-8 h-px" style={{ background: step > s ? "rgba(124,92,255,0.40)" : "rgba(255,255,255,0.10)" }} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Goals */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(124,92,255,0.18)", boxShadow: "0 0 0 1px rgba(124,92,255,0.35)" }}>
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-[24px] font-semibold text-white/90 mb-2">What are you hiring for?</h1>
                <p className="text-[14px] text-white/50">Select all that apply — we'll match you with the right creators.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {GOALS.map(g => {
                  const active = selectedGoals.includes(g.id);
                  return (
                    <button key={g.id} onClick={() => toggleGoal(g.id)}
                      className="rounded-2xl p-4 text-left transition-all"
                      style={{ background: active ? "rgba(124,92,255,0.16)" : GLASS.background, border: `1px solid ${active ? "rgba(124,92,255,0.45)" : "rgba(255,255,255,0.08)"}` }}>
                      <p className="text-[13px] font-medium mb-1" style={{ color: active ? "rgba(167,139,250,0.95)" : "rgba(255,255,255,0.80)" }}>{g.label}</p>
                      <p className="text-[11px]" style={{ color: active ? "rgba(167,139,250,0.65)" : "rgba(255,255,255,0.40)" }}>{g.desc}</p>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep(2)} disabled={selectedGoals.length === 0}
                className="w-full rounded-full py-3.5 text-[14px] font-medium transition flex items-center justify-center gap-2"
                style={{ background: selectedGoals.length > 0 ? "rgba(124,92,255,0.30)" : "rgba(255,255,255,0.06)", color: selectedGoals.length > 0 ? "rgba(167,139,250,0.95)" : "rgba(255,255,255,0.30)", boxShadow: selectedGoals.length > 0 ? "0 0 0 1px rgba(124,92,255,0.50)" : "none" }}>
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Budget */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(124,92,255,0.18)", boxShadow: "0 0 0 1px rgba(124,92,255,0.35)" }}>
                  <Briefcase className="w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-[24px] font-semibold text-white/90 mb-2">What's your campaign budget?</h1>
                <p className="text-[14px] text-white/50">This helps us show you the right tier of creators.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {BUDGETS.map(b => {
                  const active = budget === b.id;
                  return (
                    <button key={b.id} onClick={() => setBudget(b.id)}
                      className="rounded-2xl p-4 text-left transition-all"
                      style={{ background: active ? "rgba(124,92,255,0.16)" : GLASS.background, border: `1px solid ${active ? "rgba(124,92,255,0.45)" : "rgba(255,255,255,0.08)"}` }}>
                      <p className="text-[14px] font-semibold mb-1" style={{ color: active ? "rgba(167,139,250,0.95)" : "rgba(255,255,255,0.80)" }}>{b.label}</p>
                      <p className="text-[11px]" style={{ color: active ? "rgba(167,139,250,0.55)" : "rgba(255,255,255,0.40)" }}>{b.sub}</p>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 rounded-full py-3.5 text-[13px] font-medium transition"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }}>Back</button>
                <button onClick={() => setStep(3)} disabled={!budget}
                  className="flex-1 rounded-full py-3.5 text-[14px] font-medium transition flex items-center justify-center gap-2"
                  style={{ background: budget ? "rgba(124,92,255,0.30)" : "rgba(255,255,255,0.06)", color: budget ? "rgba(167,139,250,0.95)" : "rgba(255,255,255,0.30)", boxShadow: budget ? "0 0 0 1px rgba(124,92,255,0.50)" : "none" }}>
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Agency details */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(124,92,255,0.18)", boxShadow: "0 0 0 1px rgba(124,92,255,0.35)" }}>
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-[24px] font-semibold text-white/90 mb-2">Almost there</h1>
                <p className="text-[14px] text-white/50">Tell us a bit about your brand or agency.</p>
              </div>
              <div className="space-y-3 mb-8">
                <input value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Agency / Brand name"
                  className="w-full rounded-xl px-4 py-3.5 text-[14px] outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.85)" }} />
                <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="Website (optional)"
                  className="w-full rounded-xl px-4 py-3.5 text-[14px] outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.85)" }} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 rounded-full py-3.5 text-[13px] font-medium transition"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }}>Back</button>
                <button onClick={finish} disabled={saving || !agencyName}
                  className="flex-1 rounded-full py-3.5 text-[14px] font-medium transition"
                  style={{ background: agencyName ? "rgba(124,92,255,0.30)" : "rgba(255,255,255,0.06)", color: agencyName ? "rgba(167,139,250,0.95)" : "rgba(255,255,255,0.30)", boxShadow: agencyName ? "0 0 0 1px rgba(124,92,255,0.50)" : "none" }}>
                  {saving ? "Setting up…" : "Launch Creator Hive"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
