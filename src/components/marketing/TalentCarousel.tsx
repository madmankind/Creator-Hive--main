'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CuratedTalent } from '@/lib/curatedTalent'
import { BookingModal } from './BookingModal'

interface TalentCarouselProps {
  talents: CuratedTalent[]
  query?: string
  selectedRoles?: string[]
}

export function TalentCarousel({ talents, query, selectedRoles }: TalentCarouselProps) {
  const [activeTalentId, setActiveTalentId] = useState<string | null>(null)
  const [bookingTalentId, setBookingTalentId] = useState<string | null>(null)

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

  const activeTalent = activeTalentId
    ? filteredTalents.find(t => t.id === activeTalentId)
    : null

  const handleCardClick = (talentId: string, e: React.MouseEvent) => {
    // Don't expand if clicking the BOOK button
    if ((e.target as HTMLElement).closest('button[data-book-button]')) {
      return
    }
    setActiveTalentId(talentId === activeTalentId ? null : talentId)
  }

  const handleBookClick = (talentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setBookingTalentId(talentId)
  }

  return (
    <>
      <section className="relative py-16 md:py-24">
        {/* Spotlight background */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[60vh] w-[80vw] max-w-[1200px] blur-3xl opacity-[0.12] bg-gradient-to-b from-white/20 via-white/10 to-transparent rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-white/90 mb-3">
              Among the brightest minds
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/70 max-w-2xl mx-auto">
              From UGC specialists to full-stack creative teams, explore curated talent ready to plug into your campaigns.
            </p>
          </div>

          {/* Carousel */}
          {filteredTalents.length === 0 ? (
            <div className="text-center py-16 text-white/50">
              <p className="text-[15px]">No perfect matches yet. Try adjusting your roles or using a more general brief.</p>
            </div>
          ) : (
            <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6">
              <div className="flex gap-4 md:gap-6 min-w-max">
                {filteredTalents.map((talent, index) => (
                  <motion.div
                    key={talent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative flex-shrink-0 w-[320px] md:w-[380px] snap-start cursor-pointer"
                    onClick={(e) => handleCardClick(talent.id, e)}
                  >
                    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 md:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)] hover:bg-white/7 transition">
                      {/* Top row: Avatar, Name, Online indicator */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-white/10 ring-2 ring-white/20 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white/60 text-lg font-medium">
                              {talent.name.charAt(0)}
                            </div>
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 ring-2 ring-[#0B0F14]"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <a
                              href={talent.instagramUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[15px] font-medium text-white/90 hover:underline truncate"
                            >
                              {talent.name}
                            </a>
                          </div>
                          <div className="text-xs text-white/60 truncate">
                            {talent.displayTitle}
                          </div>
                        </div>
                        {/* Heart icon / BOOK button */}
                        <div className="flex-shrink-0">
                          <button
                            data-book-button
                            onClick={(e) => handleBookClick(talent.id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white text-[13px] text-slate-900 px-4 py-1.5 shadow-lg hover:shadow-xl font-medium"
                          >
                            BOOK
                          </button>
                          <div className="opacity-100 group-hover:opacity-0 transition-opacity absolute top-0 right-0 w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-[13px] leading-relaxed text-white/70 mb-4 line-clamp-3">
                        {talent.shortBio}
                      </p>

                      {/* Tags row */}
                      <div className="flex flex-wrap gap-2">
                        {/* Role tags */}
                        {talent.roleTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/8 text-[11px] px-3 py-1 border border-white/10 text-white/80"
                          >
                            {tag}
                          </span>
                        ))}
                        {/* Platform tags */}
                        {talent.platformTags.slice(0, 2).map((platform) => (
                          <span
                            key={platform}
                            className="rounded-full bg-white/5 text-[11px] px-3 py-1 border border-white/10 text-white/60"
                          >
                            {platform}
                          </span>
                        ))}
                        {/* Availability tags */}
                        {talent.availability.map((avail) => (
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
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
                      onClick={() => setBookingTalentId(activeTalent.id)}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Booking Modal */}
      {bookingTalentId && (
        <BookingModal
          talent={filteredTalents.find(t => t.id === bookingTalentId)!}
          onClose={() => setBookingTalentId(null)}
        />
      )}
    </>
  )
}

