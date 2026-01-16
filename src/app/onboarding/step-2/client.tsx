'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useSWR from "swr";
import InstaField from "@/components/onboarding/InstaField";
import { redirectByRole } from '@/server/authz';

const SKILLS = [
  'Content Creation', 'Photography', 'Videography', 'Graphic Design', 
  'Social Media', 'Copywriting', 'Marketing', 'Brand Strategy',
  'Web Design', 'Animation', 'SEO', 'Development'
]

export default function BuildProfileClient() {
  const router = useRouter()
  const { data: session } = useSession()
  const [name, setName] = useState('')
  const [oneLiner, setOneLiner] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [instagram, setInstagram] = useState('')
  const [location, setLocation] = useState('')
  const [niches, setNiches] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: existing, isLoading } = useSWR("/api/onboarding/creator/profile", (u) => fetch(u).then(r => r.json()))

  useEffect(() => {
    if (existing?.profile) {
      setName(existing.profile.name || "")
      setOneLiner(existing.profile.bio || "")
      setSelectedSkills(existing.profile.skills || [])
      setHourlyRate(existing.profile.hourlyRate ? String(existing.profile.hourlyRate) : "")
      setInstagram(existing.profile.instagram || existing.profile.username || "")
      setLocation(existing.profile.location || "")
      setNiches((existing.profile.niches || []).join(", "))
      setAvatarUrl(existing.profile.avatarUrl || "")
    }
  }, [existing])
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

  const handleContinue = async () => {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch("/api/onboarding/creator/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          instagram,
          bio: oneLiner,
          location,
          skills: selectedSkills,
          niches: niches.split(",").map((n) => n.trim()).filter(Boolean),
          avatarUrl: avatarUrl || undefined,
          hourlyRate,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Failed to save profile")
      }
      const role = (session?.user as { role?: string } | null)?.role;
      router.push(redirectByRole(role))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setSaving(false)
    }
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none"
              placeholder="e.g. Alex Reyes"
            />
          </div>

          {/* One-liner */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Short bio
            </label>
            <textarea
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none h-24"
              placeholder="What do you do best?"
            />
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white/90">
                Skills (pick up to 3)
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SKILLS.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`rounded-full px-3 py-2 text-xs ring-1 transition ${
                    selectedSkills.includes(skill)
                      ? 'bg-white/15 ring-white/30 text-white'
                      : 'bg-white/5 ring-white/10 text-white/70 hover:bg-white/8'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Rate (optional)
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none"
              placeholder="e.g. 75"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Instagram (or handle)
            </label>
            <InstaField value={instagram} onChange={setInstagram} />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none"
              placeholder="City, Country"
            />
          </div>

          {/* Niches */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Niches (comma separated)
            </label>
            <input
              type="text"
              value={niches}
              onChange={(e) => setNiches(e.target.value)}
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none"
              placeholder="beauty, wellness, travel"
            />
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Avatar URL (optional)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none"
              placeholder="https://..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-xs text-white/60 hover:text-white transition"
            >
              Why this info?
            </button>
            <button
              onClick={handleContinue}
              disabled={saving}
              className="rounded-full px-6 py-2 text-sm bg-white/10 ring-1 ring-white/10 hover:bg-white/15 transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save and continue"}
            </button>
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}

          {showTooltip && (
            <div className="text-xs text-white/50">
              We use this to surface you in discovery and help agencies evaluate fit.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
