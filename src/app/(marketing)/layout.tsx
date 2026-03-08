import { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import MobileNav from "../nav.mobile";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30 border-b border-[color:var(--color-border)]">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 focus-ring">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[color:var(--color-muted-foreground)]">
            <Link href="/for-brands">For Brands</Link>
            <Link href="/for-creators">For Creators</Link>
            <Link href="/pricing">Pricing</Link>
            <Link className="rounded-xl px-4 py-2 hover:bg-[color:var(--grey-800)]" href="/">Sign in</Link>
            <Link href="/" className={`${buttonVariants({ variant: "gradient" })} ml-2`}>
              Get Started
            </Link>
          </nav>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </header>
      {children}
      <Footer />
    </div>
  );
}


