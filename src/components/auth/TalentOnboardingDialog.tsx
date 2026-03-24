'use client'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!open) {
      setStep('email');
      setEmail('');
      setWhatsapp('');
      setUseWhatsapp(false);
      setInstagramHandle('');
      setSubmitting(false);
      setError('');
    }
  }, [open])

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

    if (result?.error) {
      setSubmitting(false)
      setError(result.error)
      return
    }

    setStep('instagram')
    setSubmitting(false)
  }

  const handleInstagramSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!instagramHandle.trim()) {
      setError('Please enter your Instagram handle')
      return
    }

    setSubmitting(true)
    try {
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "CREATOR",
          email: useWhatsapp ? undefined : email,
          whatsapp: useWhatsapp ? whatsapp.replace(/[^\d]/g, "") : undefined,
          instagram: instagramHandle,
        }),
      });
    } catch {
      // ignore write failures in dev
    }

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
    }, 1500)
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
                    <div className="inline-flex items-center gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setUseWhatsapp(false)
                          setError('')
                        }}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-[12px] font-medium transition",
                          !useWhatsapp ? "bg-white/10 text-white ring-1 ring-white/15" : "text-white/60 hover:text-white"
                        )}
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUseWhatsapp(true)
                          setError('')
                        }}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-[12px] font-medium transition",
                          useWhatsapp ? "bg-white/10 text-white ring-1 ring-white/15" : "text-white/60 hover:text-white"
                        )}
                      >
                        WhatsApp
                      </button>
                    </div>

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
                  </div>

                  {error && (
                    <p className="text-xs text-red-400">{error}</p>
                  )}

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={submitting || (!email.trim() && !whatsapp.trim())}
                      className={cn(
                        "w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 transition",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {submitting ? 'Signing you in…' : 'Continue'}
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
                    Under review
                  </h2>
                  <p className="text-sm text-white/65">
                    We&apos;ll confirm within 48 hours.
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
