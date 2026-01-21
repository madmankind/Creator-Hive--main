import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/components/Providers";
import { AppShell } from "@/components/AppShell";
import clsx from 'clsx'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Creator Hive',
  description: 'Book Top 1% talent seamlessly.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={clsx(inter.className, inter.variable)}>
      <body className="bg-[#0B0F14] text-white antialiased font-sans">
        {/* Spotlight column (Fey style) */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 mx-auto max-w-[980px]
                     bg-[radial-gradient(50%_40%_at_50%_0%,rgba(255,255,255,0.08),rgba(0,0,0,0)_60%)]
                     opacity-80"
        />
        <Providers>
          {/* App shell with route transition tracking */}
          <AppShell>
            {children}
          </AppShell>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
