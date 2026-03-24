"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; match: (pathname: string) => boolean }[] = [
  {
    href: "/dashboard/hive",
    label: "Culture",
    match: (p) => p === "/dashboard/hive" || p === "/dashboard/hive/",
  },
  { href: "/dashboard/hive/shop", label: "Shop", match: (p) => p.startsWith("/dashboard/hive/shop") },
  { href: "/dashboard/hive/build", label: "Build", match: (p) => p.startsWith("/dashboard/hive/build") },
];

export function HiveTabRail() {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[44px] items-center gap-4 sm:gap-5">
      <p className="shrink-0 pl-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/80">Hive</p>
      <nav className="flex min-h-[44px] flex-1 items-center gap-2 sm:gap-2.5" aria-label="Hive">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch
              className={cn(
                "relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] transition sm:min-w-0 sm:px-5",
                active
                  ? "bg-white/[0.07] text-white/[0.95] ring-1 ring-white/[0.1] after:absolute after:bottom-1.5 after:left-5 after:right-5 after:h-px after:bg-amber-400/80 after:content-['']"
                  : "text-white/38 hover:bg-white/[0.04] hover:text-white/72",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
