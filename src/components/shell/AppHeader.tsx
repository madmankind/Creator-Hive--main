"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useTheme";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Search } from "lucide-react";

export function AppHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { mode, setMode, accent, setAccent } = useThemeStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors",
        "border-b border-[color:var(--color-border)]",
        scrolled ? "glass" : "bg-transparent"
      )}
    >
      <div className="container h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 focus-ring">
          <Image src="/brand/creator-hive-logo.png" alt="Creator Hive" width={28} height={28} />
          <span className="font-semibold">Creator Hive</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[color:var(--text-secondary)]">
          <Link href="/creators">Creators</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/docs">Docs</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button aria-label="Search" className="h-9 w-9 grid place-items-center rounded-md focus-ring glass">
            <Search size={16} />
          </button>
          <button
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center rounded-md focus-ring glass"
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          >
            {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Button
            variant="gradient"
            onClick={() => setAccent(accent === "purple" ? "cyan" : "purple")}
            className="hidden sm:inline-flex"
          >
            Accent: {accent}
          </Button>
        </div>
      </div>
    </header>
  );
}

