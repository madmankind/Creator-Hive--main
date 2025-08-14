"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { Home, FolderKanban, CreditCard, ShieldCheck, Settings2, Search } from "lucide-react";
import { ReactNode } from "react";

import { Providers } from "@/components/Providers";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen grid grid-cols-[260px_1fr] bg-[color:var(--bg)] text-[color:var(--text)]">
      <aside className="border-r border-[color:var(--color-border)] p-4">
        <div className="px-2 py-3 font-semibold">Creator Hive</div>
        <nav className="mt-4 grid gap-1">
          <Link className="px-3 py-2 rounded-lg hover:bg-[color:var(--grey-800)] inline-flex items-center gap-2" href="/app">
            <Home size={18} /> Home
          </Link>
          <Link className="px-3 py-2 rounded-lg hover:bg-[color:var(--grey-800)] inline-flex items-center gap-2" href="/app/projects">
            <FolderKanban size={18} /> Projects
          </Link>
          <Link className="px-3 py-2 rounded-lg hover:bg-[color:var(--grey-800)] inline-flex items-center gap-2" href="/app/payments">
            <CreditCard size={18} /> Payments
          </Link>
          <Link className="px-3 py-2 rounded-lg hover:bg-[color:var(--grey-800)] inline-flex items-center gap-2" href="/app/compliance">
            <ShieldCheck size={18} /> Compliance
          </Link>
          <div className="px-3 py-2 rounded-lg opacity-60 inline-flex items-center gap-2" aria-disabled>
            <Search size={18} /> Discovery (Soon)
          </div>
          <Link className="px-3 py-2 rounded-lg hover:bg-[color:var(--grey-800)] inline-flex items-center gap-2" href="/app/settings">
            <Settings2 size={18} /> Settings
          </Link>
        </nav>
      </aside>
      <div className="grid grid-rows-[64px_1fr]">
        <header className="border-b border-[color:var(--color-border)] flex items-center justify-between px-6">
          <div className="text-sm text-[color:var(--color-muted-foreground)]">Dashboard</div>
          <div className="flex gap-2">
            <Link className="bg-brand-gradient text-black rounded-lg px-4 py-2 text-sm" href="#">Create Payment Link</Link>
            <Link className="rounded-lg px-4 py-2 text-sm border border-[color:var(--color-border)]" href="#">Send Invoice</Link>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
      </div>
    </Providers>
  );
}


