'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'

type TalentOnboardingDialogProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function TalentOnboardingDialog({ open, onClose, onSuccess }: TalentOnboardingDialogProps) {
  const [step, setStep] = useState<'email' | 'instagram' | 'confirmation'>('email')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [useWhatsapp, setUseWhatsapp] = useState(false)
  const [instagramHandle, setInstagramHandle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const maskUAE = (v: string) => {
    const digits = v.replace(/[^\d]/g, '').slice(0, 9)
    if (digits.length === 0) return '+971 '
    if (digits.length <= 2) return `+971 ${digits}`
    if (digits.length <= 5) return `+971 ${digits.slice(0, 2)} ${digits.slice(2)}`
    return `+971 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
  }

  const contactEmail = () => {
    if (useWhatsapp) {
      const digits = whatsapp.replace(/[^\d]/g, '')
      if (!digits) return ''
      return `wa-${digits}@talent.creatorhive.local`
    }
    return email.trim()
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!useWhatsapp && !email.trim()) {
      setError('Please enter your email')
      return
    }

    if (useWhatsapp && !whatsapp.trim()) {
      setError('Please enter your WhatsApp number')
      return
    }

    setSubmitting(true)
    const loginEmail = contactEmail()
    if (!loginEmail) {
      setError('Please provide valid contact details')
      setSubmitting(false)
      return
    }

    const result = await signIn("credentials", {
      redirect: false,
      email: loginEmail,
      userType: "talent",
      displayName: email || `Talent ${loginEmail.slice(0, 4)}`,
    })

    setSubmitting(false)

    if (result?.error) {
      setError(result.error)
      return
    }

    setStep('instagram')
  }

  const handleInstagramSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!instagramHandle.trim()) {
      setError('Please enter your Instagram handle')
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setStep('confirmation')
      setTimeout(() => {
        onSuccess()
        setStep('email')
        setEmail('')
        setWhatsapp('')
        setInstagramHandle('')
        setUseWhatsapp(false)
        onClose()
      }, 2500)
    }, 600)
  }

  const handleGoogleSignup = () => {
    // TODO: Wire to Google OAuth
    console.log('Google signup')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Spotlight background */}
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
            <div className="h-[40vh] w-[60vw] max-w-[600px] blur-3xl opacity-[0.12] bg-gradient-to-b from-white/20 via-white/10 to-transparent rounded-full"></div>
          </div>

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative w-full max-w-md rounded-3xl bg-[#0F141A]/95 ring-1 ring-white/10 p-8 shadow-2xl">
              {step !== 'confirmation' && (
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {step === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white/90 mb-2">
                      Join Creator Hive
                    </h2>
                    <p className="text-sm text-white/60">
                      Sign up to showcase your work and get discovered
                    </p>
                  </div>

                  <div className="space-y-3">
                    {!useWhatsapp ? (
                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            setError('')
                          }}
                          placeholder="Work email"
                          className="w-full rounded-full bg-white/5 ring-1 ring-white/10 px-5 py-3.5 outline-none text-white/90 placeholder:text-white/40 text-[15px] focus:ring-2 focus:ring-white/20 transition"
                        />
                      </div>
                    ) : (
                      <div>
                        <input
                          type="tel"
                          value={whatsapp}
                          onChange={(e) => {
                            setWhatsapp(maskUAE(e.target.value))
                            setError('')
                          }}
                          placeholder="+971 xx xxx xxxx"
                          className="w-full rounded-full bg-white/5 ring-1 ring-white/10 px-5 py-3.5 outline-none text-white/90 placeholder:text-white/40 text-[15px] focus:ring-2 focus:ring-white/20 transition"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setUseWhatsapp(!useWhatsapp)
                          setError('')
                        }}
                        className="text-xs text-white/60 hover:text-white/80 transition"
                      >
                        {useWhatsapp ? 'Use email instead' : 'Use WhatsApp instead'}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-400">{error}</p>
                  )}

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-5 py-3 hover:bg-white/10 transition"
                    >
                      <svg viewBox="0 0 48 48" className="h-5 w-5 fill-white/90">
                        <path d="M44.5 20H24v8.5h11.8C34.8 34.6 30.2 37.5 24 37.5 15.9 37.5 9.5 31.1 9.5 23S15.9 8.5 24 8.5c4.1 0 7.4 1.6 9.9 3.8l6-6C36.7 2.3 30.8 0 24 0 10.7 0 0 10.7 0 24s10.7 24 24 24c12.4 0 23-9 23-24 0-1.6-.2-3.2-.5-4.5z"/>
                      </svg>
                      <span className="text-sm text-white/90">Sign up with Google</span>
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || (!email.trim() && !whatsapp.trim())}
                      className={cn(
                        "w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 transition",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {submitting ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                </form>
              )}

              {step === 'instagram' && (
                <form onSubmit={handleInstagramSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white/90 mb-2">
                      Add your Instagram
                    </h2>
                    <p className="text-sm text-white/60">
                      We&apos;ll use this to showcase your work
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-5 py-3.5">
                      <span className="text-white/60">@</span>
                      <input
                        type="text"
                        value={instagramHandle}
                        onChange={(e) => {
                          setInstagramHandle(e.target.value.replace('@', ''))
                          setError('')
                        }}
                        placeholder="yourhandle"
                        className="flex-1 bg-transparent outline-none text-white/90 placeholder:text-white/40 text-[15px]"
                        autoFocus
                      />
                    </div>
                    {error && (
                      <p className="mt-2 text-xs text-red-400">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !instagramHandle.trim()}
                    className={cn(
                      "w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 transition",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {submitting ? 'Submitting...' : 'Submit application'}
                  </button>
                </form>
              )}

              {step === 'confirmation' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <h2 className="text-xl font-semibold text-white/90 mb-2">
                    Thanks for applying
                  </h2>
                  <p className="text-sm text-white/65">
                    Your profile is under review – we&apos;ll update you within 48 hours.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
