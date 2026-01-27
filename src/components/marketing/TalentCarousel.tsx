'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CuratedTalent } from '@/lib/curatedTalent'
import { LandingTalentCard } from '@/components/marketing/LandingTalentCard'
import { useCampaignPodStore, type Talent as PodTalent } from '@/store/useCampaignPodStore'
import { cn } from '@/lib/utils'

// Role priority order for clustering (similar roles grouped together)
const ROLE_PRIORITY: Record<string, number> = {
  "UGC Creator": 1,
  "Content Creator": 2,
  "Videographer": 3,
  "Photographer": 4,
  "Editor": 5,
  "Designer": 6,
  "Copywriter": 7,
  "Strategist": 8,
  "Social Media Manager": 9,
  "Influencer": 10,
  "Producer": 11,
  "Other": 12,
}

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
  const { addToPod } = useCampaignPodStore()

  // Filter talents based on query and selected roles
  const filteredTalents = useMemo(() => {
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

  // Sort by role similarity (cluster similar roles together)
  const sortedTalents = useMemo(() => {
    return [...filteredTalents].sort((a, b) => {
      // Get primary role (first role tag) priority
      const aPrimary = a.roleTags[0] ? (ROLE_PRIORITY[a.roleTags[0]] || 999) : 999
      const bPrimary = b.roleTags[0] ? (ROLE_PRIORITY[b.roleTags[0]] || 999) : 999
      
      // Primary sort by role priority
      if (aPrimary !== bPrimary) {
        return aPrimary - bPrimary
      }
      
      // Secondary sort by name for stability
      return a.name.localeCompare(b.name)
    })
  }, [filteredTalents])

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
    ? sortedTalents.find(t => t.id === activeTalentId)
    : null

  const handleAddToPod = (talent: PodTalent) => {
    if (onAddToPod) {
      onAddToPod(talent.id)
    } else {
      addToPod(talent)
    }
  }

  const handleToggleProfile = (talent: PodTalent) => {
    setActiveTalentId(talent.id === activeTalentId ? null : talent.id)
  }

  return (
    <section className="relative py-16 md:py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-white/90 mb-3">
            Among the brightest minds
          </h2>
          <p className="text-[14px] md:text-[15px] text-white/70 max-w-2xl mx-auto">
            From UGC specialists to full-stack creative teams, explore curated talent ready to plug into your campaigns.
          </p>
        </div>

        {/* Single Horizontal Carousel */}
        {sortedTalents.length === 0 ? (
          <div className="text-center py-16 text-white/50">
            <p className="text-[15px]">No perfect matches yet. Try adjusting your roles or using a more general brief.</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6">
              <div className="flex gap-4 min-w-max">
                {sortedTalents.map((talent, index) => {
                  const podTalent = convertToPodTalent(talent)
                  const isAdded = selectedPodIds.includes(talent.id)
                  const isExpanded = activeTalentId === talent.id
                  
                  return (
                    <div key={talent.id} className="flex-shrink-0 snap-start flex flex-col">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <LandingTalentCard
                          talent={podTalent}
                          isAdded={isAdded}
                          onAdd={handleAddToPod}
                          onOpenProfile={handleToggleProfile}
                          isExpanded={isExpanded}
                        />
                      </motion.div>
                      
                      {/* Inline Expansion Panel */}
                      <AnimatePresence>
                        {isExpanded && talent && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="w-[280px]"
                          >
                            <div className="rounded-2xl bg-[#0D1117] ring-1 ring-white/10 p-5">
                              {/* Full Bio */}
                              {talent.shortBio && (
                                <p className="text-[13px] leading-relaxed text-white/70 mb-4">
                                  {talent.shortBio}
                                </p>
                              )}
                              
                              {/* Platform Icons */}
                              <div className="flex items-center gap-3 mb-4">
                                {talent.instagramUrl && (
                                  <a
                                    href={talent.instagramUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-white/60 hover:text-white/90 transition"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                  </a>
                                )}
                                {talent.tiktokUrl && (
                                  <a
                                    href={talent.tiktokUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-white/60 hover:text-white/90 transition"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.26-4.61 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                    </svg>
                                  </a>
                                )}
                                {talent.platformTags.includes('YouTube') && (
                                  <a
                                    href={`https://youtube.com/@${talent.instagramHandle}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-white/60 hover:text-white/90 transition"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                  </a>
                                )}
                              </div>
                              
                              {/* Portfolio Link (if available) */}
                              {talent.featuredVideoUrl && (
                                <a
                                  href={talent.featuredVideoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-white/60 hover:text-white/80 transition underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View portfolio →
                                </a>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
