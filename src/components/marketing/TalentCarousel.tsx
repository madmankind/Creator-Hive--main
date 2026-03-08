'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { CuratedTalent, TalentCategoryTag } from '@/lib/curatedTalent'
import { LandingTalentCard } from '@/components/marketing/LandingTalentCard'
import { useCampaignPodStore, type Talent as PodTalent } from '@/store/useCampaignPodStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PackageConfig } from '@/lib/packages'

const CARD_WIDTH = 380
const CARD_GAP = 20
const SNAP_STEP = CARD_WIDTH + CARD_GAP

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
  selectedPackage?: PackageConfig | null
}

export function TalentCarousel({ 
  talents, 
  query, 
  selectedRoles, 
  onTalentClick, 
  onAddToPod,
  onBook,
  selectedPodIds = [],
  selectedPackage = null,
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
    avatarUrl: talent.profileImageUrl ?? talent.avatarUrl,
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
    <section className={cn("relative", DEBUG_BOUNDS && "outline outline-1 outline-red-500/40")}>

      <div className={cn("relative z-10 w-full", DEBUG_BOUNDS && "outline outline-1 outline-red-500/40")}>
        {/* Header */}
        <div className="mb-6">
          {selectedPackage ? (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-white/30">Matched for</span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] ring-1 ring-white/[0.10] text-[11px] text-white/65 font-medium">
                  <span>{selectedPackage.emoji}</span>
                  <span>{selectedPackage.name}</span>
                </span>
              </div>
              <span className="text-[12px] text-white/25">·</span>
              <span className="text-[12px] text-white/35">{selectedPackage.idealFor}</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-3">
              <h2 className="text-[16px] font-medium tracking-tight text-white/80">
                Creative talent
              </h2>
              <span className="text-[12px] text-white/30">
                {groupedTalents.length} creators available
              </span>
            </div>
          )}
        </div>

        {/* Single Horizontal Carousel */}
        {groupedTalents.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <p className="text-[14px]">No perfect matches yet. Try adjusting your roles.</p>
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
              className="overflow-x-auto overflow-y-visible snap-x snap-mandatory scrollbar-hide pb-4"
              onScroll={checkScroll}
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
              <div className={cn("flex min-w-max", DEBUG_BOUNDS && "outline outline-1 outline-red-500/40")}
                style={{ gap: `${CARD_GAP}px` }}
              >
                {groupedTalents.map((item, index) => {
                  const prevRole = index > 0 ? groupedTalents[index - 1].primaryRole : null
                  const showGroupSeparator = prevRole !== null && prevRole !== item.primaryRole

                  const podTalent = convertToPodTalent(item)
                  const isAdded = selectedPodIds.includes(item.id)
                  
                  // Determine if this talent matches the selected package
                  const isPackageMatch = selectedPackage 
                    ? selectedPackage.roles.includes(item.primaryRole as TalentCategoryTag)
                    : false

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
                          packageMatch={isPackageMatch ? { packageName: selectedPackage!.name, packageEmoji: selectedPackage!.emoji } : undefined}
                        />
                      </motion.div>
                    </div>
                  )
                })}
                </div>
            </div>

            {/* Right vignette */}
            {canScrollRight && groupedTalents.length >= 4 && (
              <div className="absolute right-0 inset-y-0 w-16 pointer-events-none z-10 bg-gradient-to-l from-[#0B0F14]/70 via-[#0B0F14]/30 to-transparent" />
            )}
            {/* Left vignette */}
            {canScrollLeft && (
              <div className="absolute left-0 inset-y-0 w-8 pointer-events-none z-10 bg-gradient-to-r from-[#0B0F14]/50 to-transparent" />
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
