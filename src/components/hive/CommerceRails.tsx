"use client";

import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const RAILS = [
  { id: "tiktok", name: "TikTok Shop", line: "Live + catalog connector", state: "Connect" },
  { id: "shopify", name: "Shopify", line: "Storefront rail", state: "Wire" },
  { id: "fourthwall", name: "Fourthwall", line: "Creator merch", state: "Wire" },
  { id: "gumroad", name: "Gumroad", line: "Digital SKUs", state: "Wire" },
] as const;

type CommerceRailsProps = { id?: string; layout?: "horizontal" | "responsive" };

export function CommerceRails({ id, layout = "horizontal" }: CommerceRailsProps) {
  const responsive = layout === "responsive";

  return (
    <section id={id} className={cn(!responsive && "border-t border-white/[0.05] pt-6")}>
      <div className="flex items-center justify-between gap-3 px-1 lg:px-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Rails</p>
      </div>

      {responsive ? (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 xl:gap-3 2xl:gap-3.5">
          {RAILS.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl bg-white/[0.03] px-3 py-3 ring-1 ring-white/[0.06] sm:px-4 sm:py-3.5"
            >
              <p className="text-[12px] font-semibold text-white/[0.9] xl:text-[13px]">{r.name}</p>
              <p className="mt-1 text-[11px] text-white/40">{r.line}</p>
              <button
                type="button"
                disabled
                className="mt-3 inline-flex min-h-[40px] items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35 sm:min-h-0 sm:mt-2"
              >
                {r.state}
                <ArrowUpRight className="h-3 w-3 opacity-50" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {RAILS.map((r) => (
            <div
              key={r.id}
              className="min-w-[148px] shrink-0 rounded-2xl bg-white/[0.03] px-3 py-3 ring-1 ring-white/[0.06]"
            >
              <p className="text-[12px] font-semibold text-white/[0.9]">{r.name}</p>
              <p className="mt-1 text-[11px] text-white/40">{r.line}</p>
              <button
                type="button"
                disabled
                className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35"
              >
                {r.state}
                <ArrowUpRight className="h-3 w-3 opacity-50" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
