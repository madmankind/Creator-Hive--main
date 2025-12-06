'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CuratedTalent } from '@/lib/curatedTalent'

interface BookingModalProps {
  talent: CuratedTalent
  onClose: () => void
}

type BookingType = 'short-term' | 'long-term'

export function BookingModal({ talent, onClose }: BookingModalProps) {
  const [bookingType, setBookingType] = useState<BookingType>('short-term')
  const [campaignDescription, setCampaignDescription] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [startDate, setStartDate] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      talentId: talent.id,
      talentName: talent.name,
      bookingType,
      campaignDescription,
      budgetRange,
      startDate,
      email,
    }

    console.log('Booking request:', payload)
    
    // Show success message
    setSubmitted(true)
    
    // Close modal after 2 seconds
    setTimeout(() => {
      onClose()
      setSubmitted(false)
      // Reset form
      setCampaignDescription('')
      setBudgetRange('')
      setStartDate('')
      setEmail('')
      setBookingType('short-term')
    }, 2000)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-[560px] rounded-2xl bg-[#0D1117] ring-1 ring-white/10 p-6 md:p-8 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white/90 mb-2">Request recorded</h3>
              <p className="text-sm text-white/60">Bookings are confirmed within 48 hours.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white/90 mb-1">Book {talent.name}</h2>
                  <p className="text-sm text-white/60">{talent.displayTitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Booking Type */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Select booking type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingType('short-term')}
                      className={`rounded-xl p-4 border transition text-left ${
                        bookingType === 'short-term'
                          ? 'bg-white/10 border-white/20 ring-1 ring-white/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/7'
                      }`}
                    >
                      <div className="text-sm font-medium text-white/90 mb-1">
                        Short term
                      </div>
                      <div className="text-xs text-white/60">
                        Per campaign/project
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType('long-term')}
                      className={`rounded-xl p-4 border transition text-left ${
                        bookingType === 'long-term'
                          ? 'bg-white/10 border-white/20 ring-1 ring-white/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/7'
                      }`}
                    >
                      <div className="text-sm font-medium text-white/90 mb-1">
                        Long term
                      </div>
                      <div className="text-xs text-white/60">
                        Monthly retainer (6–12 months)
                      </div>
                    </button>
                  </div>
                  <p className="text-xs text-white/50 mt-3">
                    {bookingType === 'short-term' ? (
                      <>We&apos;ll confirm your booking within 48 hours, with clear scope and deliverables.</>
                    ) : (
                      <>Long-term retainers are priced slightly lower per month vs project-only work, while keeping premium creator rates.</>
                    )}
                  </p>
                </div>

                {/* Campaign Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-white/90 mb-2">
                    Describe your campaign or role <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="description"
                    required
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                    placeholder="Tell us about your project, deliverables, timeline, and any specific requirements..."
                    className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 min-h-[120px] outline-none focus:ring-white/20 text-white placeholder:text-white/40 resize-none text-sm"
                  />
                </div>

                {/* Budget Range */}
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-white/90 mb-2">
                    Budget range
                  </label>
                  <input
                    id="budget"
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    placeholder="e.g., $5,000 - $10,000"
                    className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 outline-none focus:ring-white/20 text-white placeholder:text-white/40 text-sm"
                  />
                </div>

                {/* Preferred Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-white/90 mb-2">
                    Preferred start date
                  </label>
                  <select
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 outline-none focus:ring-white/20 text-white text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="asap">ASAP</option>
                    <option value="within-2-weeks">Within 2 weeks</option>
                    <option value="next-month">Next month</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 outline-none focus:ring-white/20 text-white placeholder:text-white/40 text-sm"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full bg-white/5 border border-white/10 px-5 py-2.5 hover:bg-white/10 transition text-sm text-white/90"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!campaignDescription.trim() || !email.trim()}
                    className="rounded-full bg-white text-sm text-slate-900 px-5 py-2.5 shadow-lg hover:shadow-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit request
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

