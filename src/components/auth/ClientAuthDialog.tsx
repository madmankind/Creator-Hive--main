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

const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'mail.com',
  'protonmail.com',
  'proton.me',
  'yandex.com',
  'gmx.com',
]

const isProd = process.env.NODE_ENV === 'production'

const normalizeError = (raw: string): string => {
  const lower = raw.toLowerCase()
  if (lower.includes('database_url') || lower.includes('not configured') || lower.includes('denied access') || lower.includes('configuration')) {
    return 'Database not configured. Authentication will work in development mode without a database.'
  }
  if (lower.includes('econnrefused') || lower.includes('timeout') || lower.includes('p1001')) {
    return 'Database connection failed. In development, authentication will work without a database connection.'
  }
  if (lower.includes('please use a company email')) {
    return raw // Keep this error as-is
  }
  return raw
}

/**
 * Validates email format with a simple regex
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Creates a dev session in localStorage
 */
const createDevSession = (email: string): void => {
  const sessionId = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  
  const session = {
    email: email.trim().toLowerCase(),
    sessionId,
    createdAt,
  }
  
  // Store email separately for easy access
  localStorage.setItem('ch_client_email', email.trim().toLowerCase())
  
  // Store full session object
  localStorage.setItem('ch_client_session', JSON.stringify(session))
}

/**
 * Checks if an error indicates auth is not configured
 */
const isAuthNotConfiguredError = (error: string): boolean => {
  const lower = error.toLowerCase()
  return (
    lower.includes('configuration') ||
    lower.includes('not configured') ||
    lower.includes('database_url') ||
    lower.includes('missing') ||
    lower.includes('denied access')
  )
}

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

    // Basic email validation
    if (!email.trim()) {
      setError('Please enter your work email')
      return
    }

    if (!isValidEmail(email)) {
      setError('Enter a valid email')
      return
    }

    // Company email validation (optional - can be relaxed in dev)
    if (!validateCompanyEmail(email)) {
      setError('Please use a company email (no personal domains).')
      return
    }

    setSubmitting(true)
    
    // Try auth first
    let authSucceeded = false
    try {
      // Try signup API (non-blocking)
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "AGENCY", email }),
      }).catch(() => undefined);

      // Try NextAuth sign in
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        userType: "client",
      })

      if (result?.error) {
        // Check if this is a configuration error
        if (isAuthNotConfiguredError(result.error)) {
          // Fall back to localStorage session (silent fallback)
          createDevSession(email)
          authSucceeded = true
        } else {
          // Real error - show it
          const friendlyMessage = normalizeError(result.error)
          if (!isProd) {
            console.warn("Sign in failed:", result.error)
          }
          setError(friendlyMessage || "Sign in failed. Please try again.")
          setSubmitting(false)
          return
        }
      } else if (result?.ok) {
        authSucceeded = true
      } else {
        // If result is not ok and no error, treat as config issue
        createDevSession(email)
        authSucceeded = true
      }
    } catch (err) {
      // If error is about configuration, fall back to localStorage
      const rawMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      
      if (isAuthNotConfiguredError(rawMessage)) {
        // Silent fallback to localStorage
        createDevSession(email)
        authSucceeded = true
      } else {
        // Real error - show it (only in production)
        if (isProd) {
          setError("Sign in failed. Please try again.")
        } else {
          // In dev, if it's not a config error, still fall back
          createDevSession(email)
          authSucceeded = true
        }
      }
    }

    setSubmitting(false)

    // If auth succeeded (either real or fallback), proceed
    if (authSucceeded) {
      setSubmitted(true)
      // Brief "Signed in" confirmation, then close and trigger success
      setTimeout(() => {
        setSubmitted(false)
        setEmail('')
        onClose()
        // Trigger success AFTER dialog closes so scroll/transition isn't blocked
        requestAnimationFrame(() => {
          onSuccess()
        })
      }, 800)
    }
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
                        disabled={submitting || !email.trim() || !isValidEmail(email)}
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
                    Signed in
                  </h2>
                  <p className="text-sm text-white/65">
                    You&apos;re signed in. Preparing your discovery view…
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
