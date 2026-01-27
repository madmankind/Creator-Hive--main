'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { CuratedTalent } from '@/lib/curatedTalent'
import { LandingTalentCard } from '@/components/marketing/LandingTalentCard'
import { GroupDividerCard } from '@/components/marketing/GroupDividerCard'
import { useCampaignPodStore, type Talent as PodTalent } from '@/store/useCampaignPodStore'

// Group order for segmentation
const GROUP_ORDER = [
  { 
    key: "Creators", 
    roles: ["UGC Creator", "Content Creator", "Influencer"],
    description: "Content creators and influencers ready for your campaigns"
  },
  { 
    key: "Production", 
    roles: ["Videographer", "Photographer", "Editor", "Producer"],
    description: "Video and photo production specialists"
  },
  { 
    key: "Design", 
    roles: ["Brand Designer", "Product Designer", "Motion Designer", "Designer"],
    description: "Visual design and brand identity experts"
  },
  { 
    key: "Strategy", 
    roles: ["Content Strategist", "Strategist", "Social Media Manager", "Copywriter"],
    description: "Strategic planning and content development"
  },
] as const;

type RailItem = 
  | { type: 'divider'; groupKey: string; description: string }
  | { type: 'talent'; talent: CuratedTalent };

interface TalentCarouselProps {
  talents: CuratedTalent[]
  query?: string
  selectedRoles?: string[]
  onTalentClick?: (talentId: string) => void
  onAddToPod?: (talentId: string) => void
  selectedPodIds?: string[]
  activeTalentId?: string | null
  onSelectTalent?: (talentId: string | null) => void
}

export function TalentCarousel({ 
  talents, 
  query, 
  selectedRoles, 
  onTalentClick, 
  onAddToPod, 
  selectedPodIds = [],
  activeTalentId,
  onSelectTalent,
}: TalentCarouselProps) {
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

  // Group and sort talents
  const railItems = useMemo(() => {
    const items: RailItem[] = []
    const groupedTalents: Record<string, CuratedTalent[]> = {}
    
    // Initialize groups
    GROUP_ORDER.forEach(group => {
      groupedTalents[group.key] = []
    })
    
    // Assign talents to first matching group
    filteredTalents.forEach(talent => {
      for (const group of GROUP_ORDER) {
        if (talent.roleTags.some(tag => group.roles.includes(tag as any))) {
          groupedTalents[group.key].push(talent)
          break
        }
      }
    })
    
    // Build rail items with dividers
    GROUP_ORDER.forEach(group => {
      const groupTalents = groupedTalents[group.key]
      if (groupTalents.length > 0) {
        // Add divider
        items.push({
          type: 'divider',
          groupKey: group.key,
          description: group.description,
        })
        
        // Sort talents in group by name
        const sorted = [...groupTalents].sort((a, b) => a.name.localeCompare(b.name))
        
        // Add talents
        sorted.forEach(talent => {
          items.push({
            type: 'talent',
            talent,
          })
        })
      }
    })
    
    return items
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

  const handleAddToPod = (talent: PodTalent) => {
    if (onAddToPod) {
      onAddToPod(talent.id)
    } else {
      addToPod(talent)
    }
  }

  const handleCardClick = (talent: PodTalent) => {
    if (onSelectTalent) {
      onSelectTalent(talent.id === activeTalentId ? null : talent.id)
    }
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

        {/* Single Horizontal Rail */}
        {railItems.length === 0 ? (
          <div className="text-center py-16 text-white/50">
            <p className="text-[15px]">No perfect matches yet. Try adjusting your roles or using a more general brief.</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide pb-4 -mx-6 px-6">
              <div className="flex gap-4 min-w-max">
                {railItems.map((item, index) => {
                  if (item.type === 'divider') {
                    return (
                      <div key={`divider-${item.groupKey}`} className="flex-shrink-0 snap-start">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.3 }}
                        >
                          <GroupDividerCard
                            groupKey={item.groupKey}
                            description={item.description}
                          />
                        </motion.div>
                      </div>
                    )
                  }
                  
                  const podTalent = convertToPodTalent(item.talent)
                  const isAdded = selectedPodIds.includes(item.talent.id)
                  const isSelected = activeTalentId === item.talent.id
                  
                  return (
                    <div key={item.talent.id} className="flex-shrink-0 snap-start">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.3 }}
                      >
                        <LandingTalentCard
                          talent={podTalent}
                          isAdded={isAdded}
                          onAdd={handleAddToPod}
                          onOpenProfile={handleCardClick}
                          isSelected={isSelected}
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
