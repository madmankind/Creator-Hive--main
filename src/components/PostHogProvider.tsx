'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

function PostHogIdentify() {
  const { data: session } = useSession();
  useEffect(() => {
    if (!session?.user) return;
    const u = session.user as { id?: string; email?: string; name?: string; role?: string };
    if (u.id || u.email) {
      posthog.identify(u.id ?? u.email ?? 'unknown', {
        email: u.email,
        name: u.name,
        role: u.role,
      });
    }
  }, [session]);
  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: { password: true },
      },
    })
  }, [])

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return <>{children}</>

  return (
    <PHProvider client={posthog}>
      <PostHogIdentify />
      {children}
    </PHProvider>
  )
}
