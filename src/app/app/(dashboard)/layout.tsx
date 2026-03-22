"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import {
  Home,
  FolderKanban,
  CreditCard,
  ShieldCheck,
  Settings2,
  Search,
  ArrowLeft,
} from "lucide-react";
import { ReactNode } from "react";

import { Providers } from "@/components/Providers";

/** Main Creator Hive shell (Track / Manage / Pay + dock) */
const MAIN_APP_HREF = "/dashboard/campaigns?mode=track";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen grid grid-cols-[260px_1fr] bg-[color:var(--bg)] text-[color:var(--text)]">
        <aside className="flex min-h-screen flex-col border-r border-[color:var(--color-border)] p-4">
          <div className="px-2 py-3 font-semibold">Creator Hive</div>
          <p className="mb-2 px-2 text-[11px] leading-snug text-[color:var(--color-muted-foreground)]">
            Legacy tools — return to the main app anytime.
          </p>
          <Link
            href={MAIN_APP_HREF}
            className="mx-2 mb-4 inline-flex items-center justify-center gap-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--grey-800)] px-3 py-2.5 text-sm font-medium text-[color:var(--text)] hover:opacity-90"
          >
            <ArrowLeft size={16} aria-hidden />
            Back to main workspace
          </Link>
          <nav className="mt-0 grid flex-1 gap-1">
            <Link
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[color:var(--grey-800)]"
              href="/app"
            >
              <Home size={18} /> Home
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[color:var(--grey-800)]"
              href="/app/projects"
            >
              <FolderKanban size={18} /> Projects
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[color:var(--grey-800)]"
              href="/app/payments"
            >
              <CreditCard size={18} /> Payments
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[color:var(--grey-800)]"
              href="/app/compliance"
            >
              <ShieldCheck size={18} /> Compliance
            </Link>
            <div
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 opacity-60"
              aria-disabled
            >
              <Search size={18} /> Discovery (Soon)
            </div>
            <Link
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[color:var(--grey-800)]"
              href="/dashboard/settings"
            >
              <Settings2 size={18} /> Settings
            </Link>
          </nav>
        </aside>
        <div className="grid grid-rows-[64px_1fr]">
          <header className="flex items-center justify-between border-b border-[color:var(--color-border)] px-6">
            <div className="flex min-w-0 items-center gap-4">
              <Link
                href={MAIN_APP_HREF}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm text-[color:var(--color-muted-foreground)] hover:text-[color:var(--text)]"
              >
                <ArrowLeft size={16} aria-hidden />
                <span className="hidden sm:inline">Main workspace</span>
                <span className="sm:hidden">Exit</span>
              </Link>
              <span
                className="hidden h-4 w-px bg-[color:var(--color-border)] sm:block"
                aria-hidden
              />
              <div className="truncate text-sm text-[color:var(--color-muted-foreground)]">
                Dashboard
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                className="rounded-lg bg-brand-gradient px-4 py-2 text-sm text-black"
                href="#"
              >
                Create Payment Link
              </Link>
              <Link
                className="rounded-lg border border-[color:var(--color-border)] px-4 py-2 text-sm"
                href="#"
              >
                Send Invoice
              </Link>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
