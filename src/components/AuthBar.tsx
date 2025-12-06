'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthBar() {
  const r = useRouter()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const maskUAE = (v: string) =>
    '+971 ' + v.replace(/[^\d]/g, '').slice(0, 9)
      .replace(/^(\d{2})(\d{3})(\d{4})$/, '$1 $2 $3') // xx xxx xxxx

  return (
    <div className="flex items-center gap-3">
      <div className="w-[50vw] max-w-[720px] flex items-center gap-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="work@company.com"
          className="flex-1 rounded-full bg-white/5 text-white/90 placeholder-white/40
                     outline-none ring-1 ring-white/10 focus:ring-[0.8px]
                     focus:ring-[rgb(var(--ring))] transition px-5 py-3.5"
        />
        <input
          inputMode="tel"
          value={phone}
          onChange={e => setPhone(maskUAE(e.target.value))}
          placeholder="+971 xx xxx xxxx"
          className="w-[220px] rounded-full bg-white/5 text-white/90 placeholder-white/40
                     outline-none ring-1 ring-white/10 focus:ring-[0.8px]
                     focus:ring-[rgb(var(--ring))] transition px-5 py-3.5"
        />
      </div>

      <button
        aria-label="Sign up with Google"
        className="size-11 rounded-full bg-white/8 ring-1 ring-white/10 hover:bg-white/12"
        onClick={() => r.push('/onboarding/step-1')}
      >
        <svg viewBox="0 0 48 48" className="mx-auto my-auto size-5 fill-white/90">
          <path d="M44.5 20H24v8.5h11.8C34.8 34.6 30.2 37.5 24 37.5 15.9 37.5 9.5 31.1 9.5 23S15.9 8.5 24 8.5c4.1 0 7.4 1.6 9.9 3.8l6-6C36.7 2.3 30.8 0 24 0 10.7 0 0 10.7 0 24s10.7 24 24 24c12.4 0 23-9 23-24 0-1.6-.2-3.2-.5-4.5z"/>
        </svg>
      </button>

      <button
        aria-label="Sign in with Apple"
        className="size-11 rounded-full bg-white/8 ring-1 ring-white/10 hover:bg-white/12"
        onClick={() => r.push('/onboarding/step-1')}
      >
        <svg viewBox="0 0 24 24" className="mx-auto my-auto size-5 fill-white/90">
          <path d="M16.365 1.43c0 1.14-.47 2.184-1.208 2.93-.748.758-1.92 1.33-3.05 1.247-.136-1.077.494-2.255 1.21-2.97.77-.769 2.02-1.321 3.048-1.207zM21.5 17.64c-.57 1.33-.84 1.9-1.57 3.06-1.02 1.66-2.45 3.72-4.23 3.74-1.6.016-2.02-1.084-4.21-1.074-2.19.01-2.65 1.09-4.25 1.074-1.78-.02-3.15-1.88-4.17-3.54C.6 18.86-.92 14.37.56 11.23c.86-1.82 2.41-2.97 4.07-2.99 1.59-.03 3.1 1.1 4.21 1.1 1.11 0 2.9-1.34 4.9-1.15.84.04 3.2.34 4.72 2.58-3.98 2.27-3.34 8.21.99 9.87z"/>
        </svg>
      </button>

      <button
        onClick={() => r.push('/onboarding/step-1')}
        className="rounded-full px-5 py-3 text-[14px] bg-white/10 ring-1 ring-white/10 hover:bg-white/15 transition"
      >
        Continue
      </button>
    </div>
  )
}







