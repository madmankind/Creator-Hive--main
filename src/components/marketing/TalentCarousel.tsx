'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CuratedTalent } from '@/lib/curatedTalent'
import { LandingTalentCard } from '@/components/marketing/LandingTalentCard'
import { useCampaignPodStore, type Talent as PodTalent } from '@/store/useCampaignPodStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { cn } from '@/lib/utils'
import { InstagramEmbed } from '@/components/social/InstagramEmbed'
import { TikTokEmbed } from '@/components/social/TikTokEmbed'

// Ordered role lanes for landing discovery
const LANDING_ROLE_LANES = [
  "UGC Creator",
  "Content Creator",
  "Videographer",
  "Photographer",
  "Editor",
  "Motion Designer",
  "Brand Designer",
  "Content Strategist",
] as const;

interface TalentCarouselProps {
  talents: CuratedTalent[]
  query?: string
  selectedRoles?: string[]
  onTalentClick?: (talentId: string) => void
  onAddToPod?: (talentId: string) => void
  selectedPodIds?: string[]
}

export function TalentCarousel({ talents, query, selectedRoles, onTalentClick, onAddToPod, selectedPodIds = [] }: TalentCarouselProps) {
  const [activeTalentId, setActiveTalentId] = useState<string | null>(null)
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'instagram' | 'tiktok'>('profile')
  const { addToPod } = useCampaignPodStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()

  // Filter talents based on query and selected roles (for search)
  const baseFilteredTalents = useMemo(() => {
    let filtered = talents

    // Filter by selected roles
    if (selectedRoles && selectedRoles.length > 0) {
      filtered = filtered.filter(talent =>
        talent.roleTags.some(tag => selectedRoles.includes(tag))
      )
    }

    // Filter by query
    if (query && query.trim()) {
      const q = query.toLowerCase().trim()
      filtered = filtered.filter(talent =>
        talent.name.toLowerCase().includes(q) ||
        talent.shortBio.toLowerCase().includes(q) ||
        talent.nicheSummary.toLowerCase().includes(q) ||
        talent.roleTags.some(tag => tag.toLowerCase().includes(q)) ||
        talent.platformTags.some(tag => tag.toLowerCase().includes(q))
      )
    }

    return filtered
  }, [talents, query, selectedRoles])

  // Group talents by role lanes
  const roleLanes = useMemo(() => {
    return LANDING_ROLE_LANES.map((role) => {
      // Filter talents that have this role tag AND pass base filters
      const laneTalents = baseFilteredTalents.filter((talent) =>
        talent.roleTags.includes(role as any)
      )
      return {
        role,
        talents: laneTalents,
      }
    }).filter((lane) => lane.talents.length > 0) // Only show lanes with results
  }, [baseFilteredTalents])

  // Legacy filteredTalents for detail panel (keep existing behavior)
  const filteredTalents = baseFilteredTalents

  // Convert CuratedTalent to PodTalent format
  const convertToPodTalent = (talent: CuratedTalent): PodTalent => ({
    id: talent.id,
    name: talent.name,
    headline: talent.displayTitle,
    avatarUrl: talent.avatarUrl,
    roles: talent.roleTags,
    platforms: talent.platformTags,
    availabilityTags: talent.availability,
    bio: talent.shortBio,
  })

  const activeTalent = activeTalentId
    ? filteredTalents.find(t => t.id === activeTalentId)
    : null

  // Get full CuratedTalent from activeTalentId for tabs (has tiktokUrl)
  const activeCuratedTalent = activeTalentId
    ? talents.find(t => t.id === activeTalentId)
    : null

  // Use activeCuratedTalent for tabs (has tiktokUrl)
  const talentForTabs = activeCuratedTalent || activeTalent

  const handleBook = (talent: PodTalent) => {
    // This will be handled by the parent component
    onTalentClick?.(talent.id)
  }

  const handleAddToPod = (talent: PodTalent) => {
    if (onAddToPod) {
      onAddToPod(talent.id)
    } else {
      // Fallback to store if prop not provided (backward compatibility)
      addToPod(talent)
    }
  }

  const handleOpenProfile = (talent: PodTalent) => {
    const newActiveId = talent.id === activeTalentId ? null : talent.id
    setActiveTalentId(newActiveId)
    if (newActiveId) {
      setActiveProfileTab('profile') // Reset to profile tab when opening
    }
  }

  return (
    <>
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* Purple gradient background - reverted to previous deeper purple with soft top edge */}
        <div 
          className="pointer-events-none absolute inset-0 bg-hive-radial opacity-70"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
          }}
        />
        
        {/* Spotlight background */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[60vh] w-[80vw] max-w-[1200px] blur-3xl opacity-[0.12] bg-gradient-to-b from-white/20 via-white/10 to-transparent rounded-full"></div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-6">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-white/90 mb-3">
              Among the brightest minds
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/70 max-w-2xl mx-auto">
              From UGC specialists to full-stack creative teams, explore curated talent ready to plug into your campaigns.
            </p>
          </div>

          {/* Role Lane Carousels */}
          {roleLanes.length === 0 ? (
            <div className="text-center py-16 text-white/50">
              <p className="text-[15px]">No perfect matches yet. Try adjusting your roles or using a more general brief.</p>
            </div>
          ) : (
            <div className="w-full space-y-8 md:space-y-10">
              {roleLanes.map((lane, laneIndex) => {
                const laneId = `lane-${lane.role.toLowerCase().replace(/\s+/g, '-')}`
                return (
                  <div key={lane.role} id={laneId} className="scroll-mt-20">
                    {/* Lane Header */}
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="text-lg font-semibold text-white/90">
                        {lane.role}
                        <span className="ml-2 text-sm font-normal text-white/50">
                          ({lane.talents.length})
                        </span>
                      </h3>
                    </div>

                    {/* Lane Carousel */}
                    <div className="w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6">
                      <div className="flex gap-4 md:gap-6 min-w-max">
                        {lane.talents.map((talent, cardIndex) => {
                          const podTalent = convertToPodTalent(talent)
                          const isAdded = selectedPodIds.includes(talent.id)
                          return (
                            <motion.div
                              key={talent.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (laneIndex * 0.1) + (cardIndex * 0.05), duration: 0.3 }}
                              className="flex-shrink-0 snap-start"
                            >
                              <LandingTalentCard
                                talent={podTalent}
                                isAdded={isAdded}
                                onAdd={handleAddToPod}
                                onOpenProfile={handleOpenProfile}
                              />
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {activeTalent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl mx-auto mt-10 mb-16 px-6"
            >
              <div className="rounded-3xl bg-[#0D1117] ring-1 ring-white/10 p-6 md:p-8">
                {/* Top row */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 ring-2 ring-white/20 overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white/60 text-2xl font-medium">
                        {activeTalent.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white/90 mb-1">
                        <a
                          href={activeTalent.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {activeTalent.name}
                        </a>
                      </h3>
                      <p className="text-sm text-white/60 mb-1">{activeTalent.displayTitle}</p>
                      <a
                        href={activeTalent.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-white/50 hover:text-white/70"
                      >
                        @{activeTalent.instagramHandle}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const podTalent = convertToPodTalent(activeTalent)
                        handleAddToPod(podTalent)
                      }}
                      className="rounded-full bg-[#7C3AED] text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] hover:bg-[#8B5CF6] hover:shadow-[0_0_32px_rgba(124,58,237,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/70 px-4 py-2 text-[13px] font-medium transition"
                    >
                      Add to pod
                    </button>
                    <button
                      onClick={() => {
                        const podTalent = convertToPodTalent(activeTalent)
                        handleBook(podTalent)
                      }}
                      className="rounded-full bg-white text-[14px] text-slate-900 px-5 py-2 shadow-lg hover:shadow-xl font-medium"
                    >
                      BOOK
                    </button>
                    <button
                      onClick={() => setActiveTalentId(null)}
                      className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Tab Carousel */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveProfileTab('profile')}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-medium transition",
                      activeProfileTab === 'profile'
                        ? "bg-white/10 text-white ring-1 ring-white/20"
                        : "bg-white/5 text-white/60 hover:bg-white/8"
                    )}
                  >
                    Profile
                  </button>
                  {talentForTabs?.instagramUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveProfileTab('instagram')}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-xs font-medium transition",
                        activeProfileTab === 'instagram'
                          ? "bg-white/10 text-white ring-1 ring-white/20"
                          : "bg-white/5 text-white/60 hover:bg-white/8"
                      )}
                    >
                      Instagram
                    </button>
                  )}
                  {(talentForTabs?.tiktokUrl || talentForTabs?.platformTags.includes('TikTok')) && (
                    <button
                      type="button"
                      onClick={() => setActiveProfileTab('tiktok')}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-xs font-medium transition",
                        activeProfileTab === 'tiktok'
                          ? "bg-white/10 text-white ring-1 ring-white/20"
                          : "bg-white/5 text-white/60 hover:bg-white/8"
                      )}
                    >
                      TikTok
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeProfileTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Video / Media */}
                      {activeTalent.featuredVideoUrl && (
                  <div className="mb-6 rounded-xl overflow-hidden bg-black/20">
                    <div className="aspect-video">
                      <iframe
                        src={activeTalent.featuredVideoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Niche Summary */}
                <div className="mb-6">
                  <p className="text-[15px] leading-relaxed text-white/70">
                    {activeTalent.nicheSummary}
                  </p>
                </div>

                {/* Project Overview */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-white/90 mb-3">Project overview</h4>
                  <p className="text-[14px] leading-relaxed text-white/60">
                    {activeTalent.nicheSummary}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {activeTalent.roleTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/8 text-[11px] px-3 py-1 border border-white/10 text-white/80"
                    >
                      {tag}
                    </span>
                  ))}
                  {activeTalent.platformTags.map((platform) => (
                    <span
                      key={platform}
                      className="rounded-full bg-white/5 text-[11px] px-3 py-1 border border-white/10 text-white/60"
                    >
                      {platform}
                    </span>
                  ))}
                  {activeTalent.availability.map((avail) => (
                    <span
                      key={avail}
                      className={`rounded-full text-[11px] px-3 py-1 border ${
                        avail === 'Monthly'
                          ? 'bg-emerald-500/10 border-emerald-400/40 text-emerald-300'
                          : 'bg-white/5 border-white/20 text-white/70'
                      }`}
                    >
                      {avail}
                    </span>
                  ))}
                  {activeTalent.location && (
                    <span className="rounded-full bg-white/5 text-[11px] px-3 py-1 border border-white/10 text-white/60">
                      📍 {activeTalent.location}
                    </span>
                  )}
                </div>
                    </motion.div>
                  )}

                  {activeProfileTab === 'instagram' && talentForTabs?.instagramUrl && (
                    <motion.div
                      key="instagram"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <InstagramEmbed
                        username={talentForTabs.instagramHandle}
                        url={talentForTabs.instagramUrl}
                      />
                    </motion.div>
                  )}

                  {activeProfileTab === 'tiktok' && (talentForTabs?.tiktokUrl || talentForTabs?.platformTags.includes('TikTok')) && (
                    <motion.div
                      key="tiktok"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TikTokEmbed
                        username={talentForTabs.tiktokHandle}
                        url={talentForTabs.tiktokUrl}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  )
}
