'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { CuratedTalent, TalentCategoryTag } from '@/lib/curatedTalent'
import { LandingTalentCard } from '@/components/marketing/LandingTalentCard'
import { useCampaignPodStore, type Talent as PodTalent } from '@/store/useCampaignPodStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const CARD_WIDTH = 380
const CARD_GAP = 24
const PEEK = 64
const SNAP_STEP = CARD_WIDTH + CARD_GAP
// Inner viewport = 3*380 + 2*24 + PEEK = 1252; outer = 1252 + 96 = 1348

// Ordered list of primary roles for grouping
const PRIMARY_ROLE_ORDER: TalentCategoryTag[] = [
  "UGC Creator",
  "Content Creator",
  "Videographer",
  "Photographer",
  "Editor",
  "Designer",
  "Strategist",
  "Copywriter",
  "Producer",
  "Influencer",
  "Social Media Manager",
  "Other",
]

interface TalentCarouselProps {
  talents: CuratedTalent[]
  query?: string
  selectedRoles?: string[]
  onTalentClick?: (talentId: string) => void
  onAddToPod?: (talentId: string) => void
  onBook?: (talent: PodTalent) => void
  selectedPodIds?: string[]
}

export function TalentCarousel({ 
  talents, 
  query, 
  selectedRoles, 
  onTalentClick, 
  onAddToPod,
  onBook,
  selectedPodIds = [],
}: TalentCarouselProps) {
  const DEBUG_BOUNDS = false; // Set to true to visualize container bounds
  
  const { addToPod } = useCampaignPodStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showArrows, setShowArrows] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Filter talents based on query and selected roles
  const filteredTalents = useMemo(() => {
    let filtered = talents

    // Filter by selected roles (check primaryRole)
    if (selectedRoles && selectedRoles.length > 0) {
      filtered = filtered.filter(talent =>
        selectedRoles.includes(talent.primaryRole)
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

  // Group by primaryRole and sort
  const groupedTalents = useMemo(() => {
    const grouped: CuratedTalent[] = []
    const seen = new Set<string>()
    
    // Group by primaryRole in order
    PRIMARY_ROLE_ORDER.forEach(role => {
      filteredTalents.forEach(talent => {
        if (!seen.has(talent.id) && talent.primaryRole === role) {
          grouped.push(talent)
          seen.add(talent.id)
        }
      })
    })
    
    // Add any remaining talents (shouldn't happen if primaryRole is set correctly)
    filteredTalents.forEach(talent => {
      if (!seen.has(talent.id)) {
        grouped.push(talent)
        seen.add(talent.id)
      }
    })
    
    return grouped
  }, [filteredTalents])

  // Rest carousel to start when talents/filter change; then update arrow state
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = scrollContainerRef.current
      if (el) {
        el.scrollTo({ left: 0, behavior: 'auto' })
        checkScroll()
      }
    })
    return () => cancelAnimationFrame(id)
  }, [groupedTalents])

  // ResizeObserver to update arrows/vignette when viewport or talent list changes
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => checkScroll())
    ro.observe(el)
    return () => ro.disconnect()
  }, [groupedTalents])

  // Check scroll position for arrows; use threshold so tiny scrollLeft doesn't show left arrow
  const SCROLL_THRESHOLD = 4
  const checkScroll = () => {
    if (!scrollContainerRef.current) return
    const el = scrollContainerRef.current
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > SCROLL_THRESHOLD)
    setCanScrollRight(el.scrollLeft < maxScroll - SCROLL_THRESHOLD)
  }

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

  const handleAddToPod = (talent: PodTalent) => {
    if (onAddToPod) {
      onAddToPod(talent.id)
    } else {
      addToPod(talent)
    }
  }

  const handleBook = (talent: PodTalent) => {
    if (onBook) {
      onBook(talent)
    } else if (onTalentClick) {
      onTalentClick(talent.id)
    }
  }

  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (!container) return
    const currentIndex = Math.round(container.scrollLeft / SNAP_STEP)
    const targetIndex = Math.max(0, currentIndex - 2)
    container.scrollTo({ left: targetIndex * SNAP_STEP, behavior: 'smooth' })
    setTimeout(checkScroll, 350)
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (!container) return
    const currentIndex = Math.round(container.scrollLeft / SNAP_STEP)
    const maxScroll = container.scrollWidth - container.clientWidth
    const maxIndex = Math.round(maxScroll / SNAP_STEP)
    const targetIndex = Math.min(maxIndex, currentIndex + 2)
    container.scrollTo({ left: targetIndex * SNAP_STEP, behavior: 'smooth' })
    setTimeout(checkScroll, 350)
  }

  return (
    <section className={cn("relative py-16 md:py-24", DEBUG_BOUNDS && "outline outline-1 outline-red-500/40")}>
      {/* Top-concentrated purple glow — no band edge, fades into dark */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] blur-3xl opacity-100 bg-[radial-gradient(60%_55%_at_50%_0%,rgba(139,92,246,0.22),transparent_70%)]"
        aria-hidden
      />

      <div className={cn("relative z-10 mx-auto max-w-[1348px] px-12", DEBUG_BOUNDS && "outline outline-1 outline-red-500/40")}>
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
        {groupedTalents.length === 0 ? (
          <div className="text-center py-16 text-white/50">
            <p className="text-[15px]">No perfect matches yet. Try adjusting your roles or using a more general brief.</p>
          </div>
        ) : (
          <div
            className={cn("relative w-full", DEBUG_BOUNDS && "outline outline-1 outline-red-500/40")}
            onMouseEnter={() => setShowArrows(true)}
            onMouseLeave={() => setShowArrows(false)}
            onScroll={checkScroll}
          >
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth scrollbar-hide pb-4 pr-0"
              onScroll={checkScroll}
            >
              <div className={cn("flex gap-6 min-w-max", DEBUG_BOUNDS && "outline outline-1 outline-red-500/40")}>
                {groupedTalents.map((item, index) => {
                  const prevRole = index > 0 ? groupedTalents[index - 1].primaryRole : null
                  const showGroupSeparator = prevRole !== null && prevRole !== item.primaryRole

                  const podTalent = convertToPodTalent(item)
                  const isAdded = selectedPodIds.includes(item.id)

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex-shrink-0 snap-start py-2 relative",
                        showGroupSeparator && "before:content-[''] before:absolute before:left-[-12px] before:top-[15%] before:bottom-[15%] before:w-px before:bg-white/5 before:pointer-events-none"
                      )}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.3 }}
                      >
                        <LandingTalentCard
                          talent={podTalent}
                          isAdded={isAdded}
                          onAdd={handleAddToPod}
                          onBook={handleBook}
                          curatedTalent={item}
                        />
                      </motion.div>
                    </div>
                  )
                })}
                </div>
            </div>

            {/* Right vignette — w-16 (PEEK), lighter gradient, only when 4+ talents and canScrollRight */}
            {canScrollRight && groupedTalents.length >= 4 && (
              <div className="absolute right-0 inset-y-0 w-16 pointer-events-none z-10 bg-gradient-to-l from-[#0B0F14]/60 via-[#0B0F14]/25 to-transparent" />
            )}

            {/* Arrows in gutters (relative to max-w container), show on hover md+ */}
            {canScrollLeft && (
              <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20">
                <button
                  onClick={scrollLeft}
                  className={cn(
                    "w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm",
                    "ring-1 ring-white/20 hover:ring-white/40 hover:bg-white/15",
                    "flex items-center justify-center text-white/80 hover:text-white",
                    "transition-all duration-200",
                    showArrows ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                  title="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
            {canScrollRight && (
              <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20">
                <button
                  onClick={scrollRight}
                  className={cn(
                    "w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm",
                    "ring-1 ring-white/20 hover:ring-white/40 hover:bg-white/15",
                    "flex items-center justify-center text-white/80 hover:text-white",
                    "transition-all duration-200",
                    showArrows ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                  title="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
