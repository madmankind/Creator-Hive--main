import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import MobileNav from "../nav.mobile";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30 border-b border-[color:var(--color-border)]">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 focus-ring">
            <Image
              src="/brand/creator-hive-logo.png"
              alt="Creator Hive"
              width={120}
              height={32}
              priority
              sizes="(max-width: 768px) 28px, 120px"
              className="h-7 w-auto"
            />
            <span className="font-semibold">Creator Hive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[color:var(--color-muted-foreground)]">
            <Link href="/">Home</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/for-creators">For Creators</Link>
            <Link href="/for-brands">For Brands</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/talent">Talent</Link>
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
    </div>
  );
}


