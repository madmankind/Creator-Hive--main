"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const items: {
  href: string;
  label: string;
  match: (pathname: string, intent: string | null, mode: string | null) => boolean;
}[] = [
  {
    href: "/dashboard/hive/shop",
    label: "Shopfront",
    match: (p) => p === "/dashboard/hive/shop" || p === "/dashboard/hive/shop/",
  },
  {
    href: "/dashboard/hive/build/new?intent=validate",
    label: "Validate",
    match: (p, intent) => p.startsWith("/dashboard/hive/build/new") && (intent === "validate" || intent === null),
  },
  {
    href: "/dashboard/hive/build/new?intent=build",
    label: "Build",
    match: (p, intent) => p.startsWith("/dashboard/hive/build/new") && intent === "build",
  },
  {
    href: "/dashboard/hive/build/new?intent=grow",
    label: "Grow",
    match: (p, intent, mode) => p.startsWith("/dashboard/hive/build/new") && (intent === "grow" || mode === "grow"),
  },
  {
    href: "/dashboard/hive/build#projects",
    label: "Projects",
    match: () => false,
  },
];

export function HiveShopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");
  const mode = searchParams.get("mode");

  return (
    <nav className="flex flex-wrap gap-1 border-b border-white/[0.06] pb-3" aria-label="Hive commerce">
      {items.map((item) => {
        const active = item.match(pathname, intent, mode);
        return (
          <Link
            key={item.label}
            href={item.href}
            scroll={!item.href.includes("#")}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-medium transition",
              active ? "bg-white/[0.1] text-white/[0.92]" : "text-white/45 hover:bg-white/[0.05] hover:text-white/75",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
