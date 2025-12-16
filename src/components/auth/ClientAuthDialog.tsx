'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { signIn } from 'next-auth/react'

type ClientAuthDialogProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'mail.com', 'protonmail.com', 'yandex.com', 'gmx.com']

export function ClientAuthDialog({ open, onClose, onSuccess }: ClientAuthDialogProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const validateCompanyEmail = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return false
    return !FREE_EMAIL_DOMAINS.includes(domain)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your work email')
      return
    }

    if (!validateCompanyEmail(email)) {
      setError('Please use a company email to sign up.')
      return
    }

    setSubmitting(true)
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        userType: "client",
      })
      setSubmitting(false)

      if (result?.error) {
        // Show the actual error message to help with debugging
        console.error("Sign in error:", result.error)
        
        // Provide more user-friendly error messages
        if (result.error.includes("Configuration") || result.error.includes("AUTH_SECRET")) {
          setError("Server configuration error. Please check server logs.")
        } else if (result.error.includes("Database")) {
          setError("Database connection error. Please check your DATABASE_URL.")
        } else if (result.error.includes("company email")) {
          setError(result.error)
        } else {
          // Show the actual error for debugging
          setError(result.error || "Sign in failed. Please try again.")
        }
        return
      }

      if (!result?.ok) {
        setError("Sign in failed. Please try again.")
        return
      }
    } catch (err) {
      setSubmitting(false)
      console.error("Sign in error:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      return
    }

    setSubmitted(true)
    setTimeout(() => {
      onSuccess()
      setSubmitted(false)
      setEmail('')
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
              {!submitted && (
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white/90 mb-2">
                      Sign up to discover talent
                    </h2>
                    <p className="text-sm text-white/60">
                      Enter your company email to get started
                    </p>
                  </div>

                  <div>
                    <div className="relative flex items-center rounded-full bg-white/5 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-white/20 transition">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError('')
                        }}
                        placeholder="work@company.com"
                        className="flex-1 bg-transparent px-5 py-3.5 outline-none text-white/90 placeholder:text-white/40 text-[15px]"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 transition disabled:opacity-50"
                      >
                        {submitting ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60"></span>
                        ) : (
                          <svg className="h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {error && (
                      <p className="mt-2 text-xs text-red-400">{error}</p>
                    )}
                  </div>

                  <p className="text-[11px] text-white/45 text-center">
                    By signing up, you agree to our{' '}
                    <a href="/terms" className="underline hover:text-white/70">
                      Terms of Service
                    </a>
                    .
                  </p>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <h2 className="text-xl font-semibold text-white/90 mb-2">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-white/65">
                    We&apos;ve sent a secure login link to your email.
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
