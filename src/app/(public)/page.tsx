import { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Logos } from '@/components/landing/Logos';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import { PWANudge } from '@/components/landing/PWANudge';

export const metadata: Metadata = {
  title: 'Creator Hive - Payments & Ops for Creators',
  description: 'The all-in-one platform for creator payments, invoicing, and talent management. Built for the next generation of digital entrepreneurs.',
  keywords: ['creator economy', 'payments', 'invoicing', 'freelance', 'talent management'],
  authors: [{ name: 'Creator Hive' }],
  creator: 'Creator Hive',
  publisher: 'Creator Hive',
  openGraph: {
    title: 'Creator Hive - Payments & Ops for Creators',
    description: 'The all-in-one platform for creator payments, invoicing, and talent management. Built for the next generation of digital entrepreneurs.',
    url: 'https://creatorhive.com',
    siteName: 'Creator Hive',
    images: [
      {
        url: '/og/creator-hive-hero.png',
        width: 1200,
        height: 630,
        alt: 'Creator Hive - Payments & Ops for Creators',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creator Hive - Payments & Ops for Creators',
    description: 'The all-in-one platform for creator payments, invoicing, and talent management.',
    images: ['/og/creator-hive-hero.png'],
    creator: '@creatorhive',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

/**
 * Landing Page - Public homepage with Fey-style hero and comprehensive sections
 */
export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />
      
      {/* Feature Grid */}
      <FeatureGrid />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Social Proof */}
      <Logos />
      
      {/* Final CTA */}
      <CTA />
      
      {/* Footer */}
      <Footer />
      
      {/* PWA Install Nudge */}
      <PWANudge />
    </>
  );
}