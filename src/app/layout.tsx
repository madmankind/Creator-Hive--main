import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/components/Providers";
import { TopNav } from "@/components/nav/TopNav";

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
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <TopNav />
          <main className="min-h-screen pt-16 md:pt-16">
            {children}
          </main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
