import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
import Image from "next/image";
import { Providers } from "@/components/Providers";
import { buttonVariants } from "@/components/ui/button-variants";
import MobileNav from "./nav.mobile";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://creator-hive.vercel.app"),
  title: {
    default: "Creator Hive",
    template: "%s · Creator Hive",
  },
  description: "Change the way you create & get paid.",
  openGraph: {
    type: "website",
    siteName: "Creator Hive",
    title: "Creator Hive",
    description: "Change the way you create & get paid.",
    url: "https://creator-hive.vercel.app",
    images: [
      {
        url: "/brand/creator-hive-logo.png",
        width: 1200,
        height: 630,
        alt: "Creator Hive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Hive",
    description: "Change the way you create & get paid.",
    images: ["/brand/creator-hive-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-background text-foreground`}>
        <Providers>
          <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30 border-b border-[color:var(--color-border)]">
            <div className="container flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-3 focus-ring">
                <Image src="/brand/creator-hive-logo.png" alt="Creator Hive" width={28} height={28} />
                <span className="font-semibold">Creator Hive</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm text-[color:var(--color-muted-foreground)]">
                <Link href="/#how">Product</Link>
                <Link href="/pricing">Pricing</Link>
                <Link href="/#creators">For Creators</Link>
                <Link href="/#brands">For Brands</Link>
                <Link href="/#docs">Docs</Link>
                <Link href="/app">Sign in</Link>
                <Link href="/signup" className={`${buttonVariants({ variant: "gradient" })} ml-2`}>
                  Get Started
                </Link>
              </nav>
              <div className="md:hidden">
                <MobileNav />
              </div>
            </div>
          </header>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
