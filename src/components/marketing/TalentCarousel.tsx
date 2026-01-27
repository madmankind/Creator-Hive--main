'use client'
import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import type { CuratedTalent, TalentCategoryTag } from '@/lib/curatedTalent'
import { LandingTalentCard } from '@/components/marketing/LandingTalentCard'
import { useCampaignPodStore, type Talent as PodTalent } from '@/store/useCampaignPodStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  // Insert subtle gaps between groups
  const railItems = useMemo(() => {
    const items: (CuratedTalent | 'gap')[] = []
    let lastPrimaryRole: TalentCategoryTag | null = null
    
    groupedTalents.forEach((talent, index) => {
      // Insert gap if primaryRole changed
      if (lastPrimaryRole && lastPrimaryRole !== talent.primaryRole && index > 0) {
        items.push('gap')
      }
      
      items.push(talent)
      lastPrimaryRole = talent.primaryRole
    })
    
    return items
  }, [groupedTalents])

  // Check scroll position for arrows
  const checkScroll = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    )
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
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const cardWidth = 400 // w-[400px]
      const gap = 16 // gap-4
      const scrollAmount = (cardWidth + gap) * 2
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      setTimeout(checkScroll, 300)
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const cardWidth = 400
      const gap = 16
      const scrollAmount = (cardWidth + gap) * 2
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <section className="relative py-16 md:py-24">
      {/* Deep purple Fey gradient background */}
      <div 
        className="pointer-events-none absolute inset-0 bg-hive-radial opacity-70"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
        }}
      />
      
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
        {railItems.length === 0 ? (
          <div className="text-center py-16 text-white/50">
            <p className="text-[15px]">No perfect matches yet. Try adjusting your roles or using a more general brief.</p>
          </div>
        ) : (
          <div 
            className="relative w-full"
            onMouseEnter={() => setShowArrows(true)}
            onMouseLeave={() => setShowArrows(false)}
            onScroll={checkScroll}
          >
            {/* Left vignette fade */}
            <div className="absolute left-0 top-0 h-full w-24 pointer-events-none bg-gradient-to-r from-[#0B0F14] via-[#0B0F14]/80 to-transparent z-10" />
            
            {/* Right vignette fade */}
            <div className="absolute right-0 top-0 h-full w-24 pointer-events-none bg-gradient-to-l from-[#0B0F14] via-[#0B0F14]/80 to-transparent z-10" />
            
            {/* Left arrow */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 z-20",
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
            )}
            
            {/* Right arrow */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 z-20",
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
            )}

            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide pb-4 -mx-6 px-6"
              onScroll={checkScroll}
            >
              <div className="flex gap-4 min-w-max">
                {railItems.map((item, index) => {
                  if (item === 'gap') {
                    return (
                      <div key={`gap-${index}`} className="w-10 shrink-0 flex items-center justify-center">
                        <div className="w-px h-[70%] bg-white/5 blur-[0.5px]" />
                      </div>
                    )
                  }
                  
                  const podTalent = convertToPodTalent(item)
                  const isAdded = selectedPodIds.includes(item.id)
                  
                  return (
                    <div key={item.id} className="flex-shrink-0 snap-start">
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
          </div>
        )}
      </div>
    </section>
  )
}
