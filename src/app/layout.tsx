import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/Providers";
import { AppShell } from "@/components/AppShell";
import { MetaPixel } from "@/components/MetaPixel";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageView } from "@/components/PostHogPageView";
import { Suspense } from "react";
import clsx from 'clsx'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Creator Hive — UAE Creative Talent Marketplace',
    template: '%s — Creator Hive',
  },
  description: 'Book pre-vetted creative talent across the UAE and GCC. Campaign teams, deliverable tracking, and payments in one platform.',
  keywords: ['influencer marketing', 'UAE creators', 'GCC talent', 'content creators Dubai', 'influencer platform'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Creator Hive',
    startupImage: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Creator Hive — UAE Creative Talent Marketplace',
    description: 'Book pre-vetted creative talent across the UAE and GCC.',
    url: 'https://creatorhive.ae',
    siteName: 'Creator Hive',
    locale: 'en_AE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creator Hive',
    description: 'Book pre-vetted creative talent across the UAE and GCC.',
  },
  metadataBase: new URL('https://creatorhive.ae'),
  themeColor: '#07070B',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={clsx(inter.className, inter.variable)}>
      <body className="bg-[#0B0F14] text-white antialiased font-sans">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 mx-auto max-w-[980px]
                     bg-[radial-gradient(50%_40%_at_50%_0%,rgba(255,255,255,0.08),rgba(0,0,0,0)_60%)]
                     opacity-80"
        />
        <Providers>
          <PostHogProvider>
            <Suspense><PostHogPageView /></Suspense>
            <AppShell>
              {children}
            </AppShell>
          </PostHogProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
        <MetaPixel />
      </body>
    </html>
  )
}
