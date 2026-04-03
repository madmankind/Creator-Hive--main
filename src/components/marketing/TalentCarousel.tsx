'use client'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CuratedTalent, TalentCategoryTag } from '@/lib/curatedTalent'
import { getTalentDisplayName, SHOW_SIGNATURE_TALENT } from '@/lib/curatedTalent'
import { LandingTalentCard } from '@/components/marketing/LandingTalentCard'
import { HiveRoleCard } from '@/components/marketing/HiveRoleCard'
import { hiveRoles } from '@/lib/hiveRoles'
import type { InfluencerTier } from '@/lib/hiveRoles'
import { CurrencyToggle } from '@/components/ui/CurrencyToggle'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { useCampaignPodStore, type Talent as PodTalent } from '@/store/useCampaignPodStore'
import { ChevronLeft, ChevronRight, Search, X, Sparkles, SlidersHorizontal, Globe, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PackageConfig } from '@/lib/packages'

const CARD_WIDTH = 380
const CARD_GAP = 20
const SNAP_STEP = CARD_WIDTH + CARD_GAP

// Role display order — defines horizontal grouping sequence
const ROLE_ORDER: TalentCategoryTag[] = [
  "UGC Creator",
  "Content Creator",
  "Influencer",
  "Videographer",
  "Photographer",
  "Creative Director",
  "Designer",
  "Editor",
  "Strategist",
  "Social Media Manager",
  "Copywriter",
  "Producer",
  "Project Manager",
  "Account Director",
  "Talent Manager",
  // "Other" intentionally omitted — handled by leftover catch below
]

const ROLE_LABELS: Partial<Record<TalentCategoryTag, string>> = {
  "UGC Creator": "UGC",
  "Content Creator": "Content",
  "Videographer": "Video",
  "Photographer": "Photo",
  "Creative Director": "Creative Dir.",
  "Social Media Manager": "SMM",
}

type TierFilter = 'all' | 'signature' | 'select'
type LocationFilter = 'global' | 'uae'

function isInUAE(t: CuratedTalent): boolean {
  const loc = (t.location ?? '').toLowerCase()
  return loc.includes('uae') || loc.includes('dubai') || loc.includes('abu dhabi') || loc.includes('sharjah') || loc.includes('ajman') || loc.includes('ras al-khaimah') || loc.includes('fujairah')
}

function getTier(t: CuratedTalent): 'signature' | 'select' {
  if (t.tier === 'Tier 1') return 'signature'
  return (t.followers ?? 0) >= 50000 ? 'signature' : 'select'
}

// Fuzzy match: every word in query appears somewhere in target
function fuzzyMatch(query: string, target: string): boolean {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const t = target.toLowerCase()
  return words.every(w => t.includes(w))
}

interface TalentCarouselProps {
  talents: CuratedTalent[]
  query?: string
  selectedRoles?: string[]
  /** IDs returned by AI search — these float to front and get a highlight ring */
  aiHighlightIds?: string[]
  onTalentClick?: (talentId: string) => void
  onAddToPod?: (talentId: string) => void
  onRemoveFromPod?: (talentId: string) => void
  onBook?: (talent: PodTalent) => void
  selectedPodIds?: string[]
  selectedPackage?: PackageConfig | null
  /** Called when a client requests a generic Hive Role */
  onRoleRequest?: (roleId: string, roleTitle: string) => void
}


export function TalentCarousel({
  talents,
  query: externalQuery,
  selectedRoles: externalRoles,
  aiHighlightIds = [],
  onTalentClick,
  onAddToPod,
  onRemoveFromPod,
  onBook,
  selectedPodIds = [],
  selectedPackage = null,
  onRoleRequest,
}: TalentCarouselProps) {
  const { addToPod, removeFromPod } = useCampaignPodStore()
  const { currency } = useCurrencyStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [showArrows, setShowArrows] = useState(false)
  // Multi-add: track how many times each role has been added (for influencer multi-add)
  const [roleAddCounts, setRoleAddCounts] = useState<Record<string, number>>({})
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [internalQuery, setInternalQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [roleFilter, setRoleFilter] = useState<TalentCategoryTag | null>(null)
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('global')
  const [roleDropOpen, setRoleDropOpen] = useState(false)

  const effectiveQuery = externalQuery ?? internalQuery
  const effectiveRoles = externalRoles ?? (roleFilter ? [roleFilter] : [])

  // Close role dropdown on outside click
  useEffect(() => {
    if (!roleDropOpen) return
    const h = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('[data-role-drop]')) setRoleDropOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [roleDropOpen])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [searchOpen])

  const filtered = useMemo(() => {
    // Signature talent visibility toggle — flip SHOW_SIGNATURE_TALENT in curatedTalent.ts to restore
    let list = SHOW_SIGNATURE_TALENT ? talents : []

    // Tier filter
    if (tierFilter === 'signature') list = list.filter(t => getTier(t) === 'signature')
    else if (tierFilter === 'select') list = list.filter(t => getTier(t) === 'select')

    // Role filter
    if (effectiveRoles.length > 0)
      list = list.filter(t => effectiveRoles.includes(t.primaryRole) || t.roleTags.some(r => effectiveRoles.includes(r as string)))

    // Location filter
    if (locationFilter === 'uae')
      list = list.filter(isInUAE)

    // Fuzzy search across name + bio + roles + location + brands
    if (effectiveQuery.trim()) {
      const searchable = (t: CuratedTalent) => [
        t.name, t.displayName, t.shortBio, t.nicheSummary, t.displayTitle,
        t.primaryRole, t.instagramHandle ?? '',
        ...(t.roleTags ?? []), ...(t.platformTags ?? []),
        t.location ?? '', ...(t.brandPartners ?? []),
      ].join(' ')
      list = list.filter(t => fuzzyMatch(effectiveQuery, searchable(t)))
    }

    return list
  }, [talents, tierFilter, effectiveRoles, effectiveQuery, locationFilter])

  // Group by primaryRole in defined order, roles as section headers
  const grouped = useMemo(() => {
    const result: Array<{ role: TalentCategoryTag; items: CuratedTalent[] }> = []
    const seen = new Set<string>()
    ROLE_ORDER.forEach(role => {
      const items = filtered.filter(t => !seen.has(t.id) && t.primaryRole === role)
      items.forEach(t => seen.add(t.id))
      if (items.length > 0) result.push({ role, items })
    })
    // Catch any with unrecognised/unlisted primaryRole — merge into existing Other group or create one
    const leftover = filtered.filter(t => !seen.has(t.id))
    if (leftover.length > 0) {
      const existing = result.find(g => g.role === 'Other')
      if (existing) {
        existing.items.push(...leftover)
      } else {
        result.push({ role: 'Other', items: leftover })
      }
    }
    return result
  }, [filtered])

  // Flat ordered list for carousel — AI results float to front
  const flat = useMemo(() => {
    const all = grouped.flatMap(g => g.items)
    if (aiHighlightIds.length === 0) return all
    const aiSet = new Set(aiHighlightIds)
    const highlighted = aiHighlightIds.map(id => all.find(t => t.id === id)).filter(Boolean) as CuratedTalent[]
    const rest = all.filter(t => !aiSet.has(t.id))
    return [...highlighted, ...rest]
  }, [grouped, aiHighlightIds])

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const id = requestAnimationFrame(() => { el.scrollTo({ left: 0, behavior: 'auto' }); checkScroll() })
    return () => cancelAnimationFrame(id)
  }, [flat, checkScroll])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => ro.disconnect()
  }, [checkScroll])

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / SNAP_STEP)
    const max = Math.round((el.scrollWidth - el.clientWidth) / SNAP_STEP)
    el.scrollTo({ left: Math.max(0, Math.min(max, idx + dir * 2)) * SNAP_STEP, behavior: 'smooth' })
    setTimeout(checkScroll, 350)
  }

  const toPod = (t: CuratedTalent): PodTalent => ({
    id: t.id, name: t.displayName ?? getTalentDisplayName(t.name) ?? t.name, headline: t.displayTitle,
    avatarUrl: t.profileImageUrl ?? t.avatarUrl,
    roles: t.roleTags, platforms: t.platformTags,
    availabilityTags: t.availability, bio: t.shortBio,
  })

  const handleAdd = (t: PodTalent, role?: string) => { onAddToPod ? onAddToPod(t.id) : addToPod(t, role) }
  const handleRemove = (t: PodTalent, role?: string) => { onRemoveFromPod ? onRemoveFromPod(t.id) : removeFromPod(t.id, role) }
  const handleBook = (t: PodTalent) => { onBook ? onBook(t) : onTalentClick?.(t.id) }

  const activeFilters = tierFilter !== 'all' || roleFilter !== null || locationFilter !== 'global' || internalQuery.trim() !== ''
  const roleOptions = useMemo(() => [...new Set(talents.map(t => t.primaryRole))].sort(), [talents])

  return (
    <section className="relative">
      {/* ── Filter bar ── */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {/* Count */}
        <div className="flex items-baseline gap-2 mr-1">
          <h2 className="text-[15px] font-medium text-white/80 tracking-tight">Creative talent</h2>
          <span className="text-[12px] text-white/30">{SHOW_SIGNATURE_TALENT ? `${flat.length} signature · ` : ''}{hiveRoles.length} Hive Select roles</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Currency toggle */}
          <CurrencyToggle compact />
          {/* Tier filter — Signature glow */}
          <div className="flex items-center gap-1 rounded-full p-0.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setTierFilter('all')}
              className={cn('px-3 py-1.5 rounded-full text-[11px] font-medium transition-all',
                tierFilter === 'all' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'text-white/40 hover:text-white/65')}
            >All</button>
            <button
              onClick={() => setTierFilter('signature')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all relative',
                tierFilter === 'signature'
                  ? 'text-amber-300 ring-1 ring-amber-400/50'
                  : 'text-white/40 hover:text-amber-300/70')}
              style={tierFilter === 'signature' ? {
                background: 'rgba(251,191,36,0.12)',
                boxShadow: '0 0 16px rgba(251,191,36,0.25), 0 0 32px rgba(251,191,36,0.10)',
              } : undefined}
            >
              <span className="text-[10px]">🔶</span> Signature
              {tierFilter === 'signature' && (
                <span className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: '0 0 12px rgba(251,191,36,0.35)', borderRadius: 'inherit' }} />
              )}
            </button>
            <button
              onClick={() => setTierFilter('select')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all',
                tierFilter === 'select'
                  ? 'text-purple-300 ring-1 ring-purple-400/50'
                  : 'text-white/40 hover:text-purple-300/70')}
              style={tierFilter === 'select' ? {
                background: 'rgba(167,139,250,0.12)',
                boxShadow: '0 0 16px rgba(167,139,250,0.20)',
              } : undefined}
            >
              <span className="text-[10px]">🟣</span> Select
            </button>
          </div>

          {/* Location filter — Global / UAE */}
          <div className="flex items-center gap-1 rounded-full p-0.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setLocationFilter('global')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all',
                locationFilter === 'global' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'text-white/40 hover:text-white/65')}
            >
              <Globe className="w-3 h-3" />
              Global
            </button>
            <button
              onClick={() => setLocationFilter('uae')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all',
                locationFilter === 'uae' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'text-white/40 hover:text-white/65')}
            >
              <MapPin className="w-3 h-3" />
              UAE
            </button>
          </div>

          {/* Role dropdown */}
          <div className="relative" data-role-drop="">
            <button
              onClick={() => setRoleDropOpen(p => !p)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all',
                roleFilter
                  ? 'bg-white/10 text-white ring-1 ring-white/25'
                  : 'text-white/40 hover:text-white/65',
              )}
              style={{ background: roleFilter ? undefined : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <SlidersHorizontal className="w-3 h-3" />
              {roleFilter ? (ROLE_LABELS[roleFilter] ?? roleFilter) : 'Role'}
              {roleFilter && (
                <span onClick={e => { e.stopPropagation(); setRoleFilter(null) }} className="ml-0.5 text-white/40 hover:text-white/80">
                  <X className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
            <AnimatePresence>
              {roleDropOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-xl overflow-hidden"
                  style={{ background: 'rgba(15,18,24,0.97)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
                >
                  {roleOptions.map(r => (
                    <button key={r} onClick={() => { setRoleFilter(r === roleFilter ? null : r as TalentCategoryTag); setRoleDropOpen(false) }}
                      className={cn('w-full text-left px-4 py-2 text-[12px] transition-colors',
                        roleFilter === r ? 'text-white bg-white/10' : 'text-white/55 hover:text-white hover:bg-white/05'
                      )}>
                      {r}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <div className="relative flex items-center">
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.div key="open" initial={{ width: 28, opacity: 0 }} animate={{ width: 180, opacity: 1 }}
                  exit={{ width: 28, opacity: 0 }} transition={{ duration: 0.18 }}
                  className="flex items-center rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
                  <Search className="w-3.5 h-3.5 text-white/40 ml-3 shrink-0" />
                  <input ref={searchRef} value={internalQuery}
                    onChange={e => setInternalQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && (setSearchOpen(false), setInternalQuery(''))}
                    placeholder="Search talent…"
                    className="flex-1 bg-transparent outline-none text-[12px] text-white/85 placeholder:text-white/30 px-2 py-1.5 min-w-0" />
                  {internalQuery && (
                    <button onClick={() => setInternalQuery('')} className="pr-2 text-white/35 hover:text-white/65">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={() => { setSearchOpen(false); setInternalQuery('') }}
                    className="px-2.5 py-1.5 text-white/35 hover:text-white/65">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.button key="closed" onClick={() => setSearchOpen(true)}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Search className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Clear all filters */}
          {activeFilters && (
            <button onClick={() => { setTierFilter('all'); setRoleFilter(null); setLocationFilter('global'); setInternalQuery(''); setSearchOpen(false) }}
              className="text-[11px] text-white/30 hover:text-white/60 transition-colors px-1">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Role group labels above carousel ── */}
      {grouped.length > 1 && !roleFilter && (
        <div className="flex items-center gap-4 mb-3 overflow-x-auto scrollbar-hide pb-1">
          {grouped.map(g => (
            <button key={g.role} onClick={() => setRoleFilter(g.role as TalentCategoryTag)}
              className="flex items-center gap-1.5 shrink-0 text-[11px] text-white/35 hover:text-white/65 transition-colors">
              <span className="font-medium">{ROLE_LABELS[g.role] ?? g.role}</span>
              <span className="rounded-full px-1.5 py-0.5 text-[10px]"
                style={{ background: 'rgba(255,255,255,0.06)' }}>{g.items.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Carousel ── */}
      {flat.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[14px] text-white/35">No matches. Try adjusting your filters.</p>
          {activeFilters && (
            <button onClick={() => { setTierFilter('all'); setRoleFilter(null); setLocationFilter('global'); setInternalQuery('') }}
              className="mt-3 text-[12px] text-purple-400/70 hover:text-purple-400 transition-colors">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="relative"
          onMouseEnter={() => setShowArrows(true)}
          onMouseLeave={() => setShowArrows(false)}>

          <div ref={scrollRef}
            className="overflow-x-auto overflow-y-visible snap-x snap-mandatory scrollbar-hide pb-4"
            onScroll={checkScroll}
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
            <div className="flex min-w-max" style={{ gap: `${CARD_GAP}px` }}>
              {flat.map((item, idx) => {
                const prevRole = idx > 0 ? flat[idx - 1].primaryRole : null
                const isGroupStart = prevRole !== null && prevRole !== item.primaryRole
                const pod = toPod(item)
                const isAdded = selectedPodIds.includes(item.id)
                const pkgMatch = selectedPackage?.roles.includes(item.primaryRole as TalentCategoryTag)
                const isAiMatch = aiHighlightIds.length > 0 && aiHighlightIds.includes(item.id)

                return (
                  <div key={item.id}
                    className={cn(
                      'flex-shrink-0 snap-start py-2 relative transition-opacity duration-300',
                      'w-[calc(100vw-32px)] sm:w-auto',
                      isGroupStart && 'before:content-[\'\'] before:absolute before:left-[-12px] before:top-[15%] before:bottom-[15%] before:w-px before:bg-white/[0.06] before:pointer-events-none'
                    )}>
                    {isAiMatch && (
                      <div className="absolute -top-1 left-0 right-0 flex justify-center z-10 pointer-events-none">
                        <span className="flex items-center gap-1 text-[10px] font-medium text-purple-300 bg-purple-500/15 ring-1 ring-purple-400/25 rounded-full px-2 py-0.5">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.9 5.8h6.1l-4.9 3.6 1.9 5.8L12 15l-4.9 3.3 1.9-5.8L4.1 8.8h6.1z"/></svg>
                          AI pick
                        </span>
                      </div>
                    )}
<motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.025, duration: 0.28 }}>
                      <LandingTalentCard
                        talent={pod} isAdded={isAdded}
                        onAdd={handleAdd} onRemove={handleRemove} onBook={handleBook}
                        curatedTalent={item}
                        packageMatch={pkgMatch ? { packageName: selectedPackage!.name, packageEmoji: selectedPackage!.emoji } : undefined}
                      />
                    </motion.div>
                  </div>
                )
              })}

              {/* ── Hive Role Cards — Hive Select: unnamed vetted talent matched within 48h ── */}
              {tierFilter !== 'signature' && !internalQuery.trim() && (
                <>
                  {/* Divider with label */}
                  <div className="flex-shrink-0 snap-start flex flex-col items-center justify-center py-2"
                    style={{ width: "60px" }}>
                    <div style={{ width: "1px", height: "60%", background: "rgba(255,255,255,0.06)" }} />
                    <span style={{
                      writingMode: "vertical-rl", textOrientation: "mixed",
                      fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.18)", margin: "8px 0",
                    }}>Hive Select</span>
                    <div style={{ width: "1px", height: "60%", background: "rgba(255,255,255,0.06)" }} />
                  </div>

                  {hiveRoles
                    .filter(r => !roleFilter || r.primaryRole === roleFilter)
                    .map((role, idx) => {
                      const count = roleAddCounts[role.id] ?? 0;
                      return (
                        <motion.div key={`${role.id}-${count}`}
                          className="flex-shrink-0 snap-start py-2 w-[calc(100vw-32px)] sm:w-auto"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (flat.length + idx) * 0.018, duration: 0.28 }}>
                          <HiveRoleCard
                            role={role}
                            currency={currency}
                            isAdded={count > 0}
                            onAddToPod={(r, tier) => {
                              // Add a synthetic pod talent for this role slot
                              const slotIdx = (roleAddCounts[r.id] ?? 0) + 1;
                              const tierLabel = tier ? ` (${tier})` : "";
                              addToPod({
                                id: `${r.id}::${slotIdx}`,
                                name: `${r.title}${tierLabel}`,
                                headline: r.tagline,
                                roles: [r.primaryRole],
                                platforms: r.platforms,
                                bookedRole: r.primaryRole,
                              }, r.primaryRole);
                              setRoleAddCounts(prev => ({ ...prev, [r.id]: slotIdx }));
                            }}
                            onBook={(r, tier) => {
                              // Book now = add to pod + open campaign brief
                              const slotIdx = (roleAddCounts[r.id] ?? 0) + 1;
                              const tierLabel = tier ? ` (${tier})` : "";
                              addToPod({
                                id: `${r.id}::${slotIdx}`,
                                name: `${r.title}${tierLabel}`,
                                headline: r.tagline,
                                roles: [r.primaryRole],
                                platforms: r.platforms,
                                bookedRole: r.primaryRole,
                              }, r.primaryRole);
                              setRoleAddCounts(prev => ({ ...prev, [r.id]: slotIdx }));
                              onRoleRequest?.(r.id, r.title);
                            }}
                          />
                        </motion.div>
                      );
                    })
                  }
                </>
              )}
            </div>
          </div>

          {/* Vignettes */}
          {canRight && <div className="absolute right-0 inset-y-0 w-16 pointer-events-none z-10 bg-gradient-to-l from-[#0B0F14]/70 via-[#0B0F14]/30 to-transparent" />}
          {canLeft  && <div className="absolute left-0  inset-y-0 w-8  pointer-events-none z-10 bg-gradient-to-r from-[#0B0F14]/50 to-transparent" />}

          {/* Nav arrows */}
          {canLeft && (
            <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20">
              <button onClick={() => scrollBy(-1)}
                className={cn('w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/20 hover:ring-white/40 hover:bg-white/15 flex items-center justify-center text-white/80 transition-all',
                  showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
          {canRight && (
            <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20">
              <button onClick={() => scrollBy(1)}
                className={cn('w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/20 hover:ring-white/40 hover:bg-white/15 flex items-center justify-center text-white/80 transition-all',
                  showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
