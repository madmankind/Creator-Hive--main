// src/app/onboarding/step-2/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InstaField from "@/components/onboarding/InstaField";

const SKILLS = [
  'Content Creation', 'Photography', 'Videography', 'Graphic Design', 
  'Social Media', 'Copywriting', 'Marketing', 'Brand Strategy',
  'Web Design', 'Animation', 'SEO', 'Development'
]

export default function BuildProfile() {
  const router = useRouter()
  const [oneLiner, setOneLiner] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill)
      } else if (prev.length < 3) {
        return [...prev, skill]
      }
      return prev
    })
  }

  const handleContinue = () => {
    // In a real app, save the profile data
    router.push('/')
  }

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <button 
            onClick={() => router.push('/onboarding/step-1')}
            className="text-sm text-white/70 hover:text-white transition"
          >
            ← Change account type
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/20"></div>
            <div className="w-2 h-2 rounded-full bg-white/90"></div>
          </div>
        </header>

        {/* Content */}
        <div className="text-center mb-12">
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.01em] text-white/90 mb-4">
            Build your profile
          </h1>
          <p className="text-[14px] text-white/60">
            Help clients understand what you do
          </p>
        </div>

        <div className="space-y-8">
          {/* One-liner */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              One-liner
            </label>
            <input
              type="text"
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              placeholder="I create engaging content for lifestyle brands"
              className="w-full rounded-2xl bg-white/5 text-white/90 placeholder-white/40
                         outline-none ring-1 ring-white/10 focus:ring-[0.8px]
                         focus:ring-[rgb(var(--ring))] transition px-6 py-4"
              maxLength={60}
            />
            <div className="text-xs text-white/50 mt-2">
              {oneLiner.length}/60 characters
            </div>
          </div>

          {/* Instagram display name */}
          <section className="space-y-2">
            <label className="block text-sm text-white/70">
              @Instagram display name
            </label>
            <InstaField />
            <p className="text-xs text-white/45">
              We&apos;ll auto-link to your Instagram profile and show a quick public preview. For follower counts and deeper insights, we can connect your account later via Instagram Graph API.
            </p>
          </section>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Skills <span className="text-white/60">(add up to three)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => {
                const isSelected = selectedSkills.includes(skill)
                const canSelect = selectedSkills.length < 3 || isSelected
                
                return (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    disabled={!canSelect}
                    className={`px-4 py-2 rounded-full text-sm transition ${
                      isSelected
                        ? 'bg-white/15 text-white ring-1 ring-white/20'
                        : canSelect
                        ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-white/10'
                        : 'bg-white/3 text-white/30 cursor-not-allowed ring-1 ring-white/5'
                    }`}
                  >
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-white/90">
                Hourly rate
              </label>
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="w-4 h-4 rounded-full bg-white/10 text-white/60 text-xs flex items-center justify-center"
                >
                  ?
                </button>
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-black/90 rounded-lg text-xs text-white/90 w-64 z-10">
                    This helps clients understand your pricing. You can always negotiate project rates separately.
                  </div>
                )}
              </div>
            </div>
            <select
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full rounded-2xl bg-white/5 text-white/90
                         outline-none ring-1 ring-white/10 focus:ring-[0.8px]
                         focus:ring-[rgb(var(--ring))] transition px-6 py-4"
            >
              <option value="" className="bg-[#0B0F14]">Select rate range</option>
              <option value="25-50" className="bg-[#0B0F14]">$25-50/hour</option>
              <option value="50-100" className="bg-[#0B0F14]">$50-100/hour</option>
              <option value="100-200" className="bg-[#0B0F14]">$100-200/hour</option>
              <option value="200+" className="bg-[#0B0F14]">$200+/hour</option>
            </select>
          </div>

          {/* Upload Photo */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Profile photo
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-white/30 transition">
              <div className="text-2xl mb-2">📷</div>
              <p className="text-sm text-white/60 mb-2">
                Upload a professional photo
              </p>
              <button className="text-xs text-white/90 bg-white/10 px-4 py-2 rounded-full hover:bg-white/15 transition">
                Choose file
              </button>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center mt-12">
          <button
            onClick={handleContinue}
            className="rounded-full px-8 py-3 text-[14px] bg-white/10 ring-1 ring-white/10
                       hover:bg-white/15 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  )
}
