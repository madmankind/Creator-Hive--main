"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CreatorShopProjectMode, CreatorShopProjectStatus } from "@prisma/client";
import { ArrowRight, Link2 } from "lucide-react";
import { BUILD_CAPABILITIES, BUILD_STAGE_LINES } from "@/lib/hive/buildJourney";
import { STUDIO_PIPELINE, studioStageIndex } from "@/lib/creator-shop/pipelineLegend";
import { CommerceRails } from "@/components/hive/CommerceRails";

export type BuildProjectRow = {
  id: string;
  title: string;
  mode: CreatorShopProjectMode;
  productType: string;
  status: CreatorShopProjectStatus;
  updatedAt: string;
  latestUpdateAt: string | null;
};

const PRIMARY_ACTIONS = [
  {
    id: "research",
    eyebrow: "Research",
    title: "Research a product opportunity",
    line: "Market read, PMF signals, and opportunity areas — before you lock a SKU.",
    cta: "Request research",
    hrefQuery: "?intent=validate",
    emphasis: true as const,
  },
  {
    id: "new",
    eyebrow: "Define",
    title: "Start a new product",
    line: "Concept → brief → drop — with human review at every gate.",
    cta: "Start brief",
    hrefQuery: "?intent=build",
    emphasis: false as const,
  },
  {
    id: "grow",
    eyebrow: "Design & execute",
    title: "Develop an existing product",
    line: "Refine positioning, assortment, and execution on what already ships.",
    cta: "Improve product",
    hrefQuery: "?intent=grow",
    emphasis: false as const,
  },
];

export function BuildPageClient({ projects }: { projects: BuildProjectRow[] }) {
  const router = useRouter();
  const hasProjects = projects.length > 0;

  const scrollRails = () => {
    document.getElementById("build-rails")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="w-full pb-10 pt-0">
      <header className="mb-8 max-w-3xl lg:mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Build</p>
        <h1 className="mt-2 text-[clamp(1.6rem,3.4vw,2.2rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-white/[0.97]">
          Build a product with Hive
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/44">
          A premium studio for creator-led brands — from first market read through launch.
        </p>
        <p className="mt-3 text-[11px] font-medium leading-relaxed text-white/35">
          {BUILD_CAPABILITIES.map((c) => c.label).join(" · ")}
        </p>
      </header>

      {/* 3 service doors — primary actions */}
      <section className="mb-10">
        <div className="grid gap-4 sm:grid-cols-3 lg:gap-5">
          {PRIMARY_ACTIONS.map((a) => (
            <div
              key={a.id}
              className={
                a.emphasis
                  ? "flex flex-col rounded-2xl border border-amber-400/35 bg-gradient-to-b from-amber-400/[0.09] to-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(251,176,36,0.12)] sm:p-6"
                  : "flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 sm:p-6"
              }
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-400/80">{a.eyebrow}</p>
              <h2 className="mt-3 text-[18px] font-semibold leading-snug tracking-[-0.02em] text-white/[0.96] sm:text-[19px]">{a.title}</h2>
              <p className="mt-2 flex-1 text-[12px] leading-relaxed text-white/40">{a.line}</p>
              <button
                type="button"
                onClick={() => router.push(`/dashboard/hive/build/new${a.hrefQuery}`)}
                className={
                  a.emphasis
                    ? "mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-amber-400/15 px-4 text-[11px] font-semibold text-amber-100 ring-1 ring-amber-400/35 transition hover:bg-amber-400/22"
                    : "mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-white/[0.1] px-4 text-[11px] font-semibold text-white/92 ring-1 ring-white/[0.14] transition hover:bg-white/[0.14]"
                }
              >
                {a.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Process band — guided horizontal flow */}
      <section className="mb-10 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-5 sm:px-6 sm:py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">How we work</p>
        <div className="mt-4 flex flex-wrap items-start gap-y-3 sm:flex-nowrap">
          {BUILD_STAGE_LINES.map((s, i) => (
            <div key={s.label} className="flex flex-1 items-start">
              <div className="min-w-0">
                <p className={`text-[12px] font-semibold tracking-[-0.01em] ${i === 0 ? "text-amber-400/90" : "text-white/60"}`}>{s.label}</p>
                <p className="mt-1 text-[11px] leading-snug text-white/35">{s.line}</p>
              </div>
              {i < BUILD_STAGE_LINES.length - 1 && (
                <span className="mx-2 mt-0.5 hidden shrink-0 text-[11px] text-white/20 sm:inline lg:mx-3">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {!hasProjects ? (
        <section className="mb-8 rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-6 sm:px-7">
          <p className="text-[15px] font-semibold text-white/[0.90]">Your studio is empty</p>
          <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-white/38">
            Start with a research brief or a product concept — we qualify before deeper studio work begins.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => router.push("/dashboard/hive/build/new?intent=validate")}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-amber-400/14 px-6 text-[11px] font-semibold text-amber-50 ring-1 ring-amber-400/35 transition hover:bg-amber-400/22"
            >
              Request research
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/hive/build/new?intent=build")}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full px-5 text-[11px] font-semibold text-white/55 ring-1 ring-white/[0.08] transition hover:bg-white/[0.04] hover:text-white/70"
            >
              New product brief
            </button>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10 2xl:gap-12">
          <section id="projects" className="scroll-mt-28 lg:col-span-8 2xl:col-span-9">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/42">Active projects</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/hive/build/new?intent=validate"
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/38 hover:text-white/58"
                >
                  New research
                </Link>
                <button
                  type="button"
                  onClick={scrollRails}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/38 hover:text-white/58"
                >
                  <Link2 className="h-3.5 w-3.5 opacity-60" />
                  Connect rail
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 sm:px-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Delivery pipeline</p>
              <div className="mt-1.5 overflow-x-auto [scrollbar-width:thin]">
                <div className="flex min-w-min flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
                  {STUDIO_PIPELINE.map((s, i) => (
                    <span key={s.short} className="inline-flex items-center gap-2">
                      {i > 0 ? <span className="text-white/15">·</span> : null}
                      <span>{s.short}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <ul className="mt-3 space-y-2 sm:space-y-2.5">
              {projects.map((p) => {
                const stage = STUDIO_PIPELINE[studioStageIndex(p.status)]?.short ?? "—";
                return (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/hive/build/${p.id}`}
                      className="group flex min-h-[56px] items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 transition hover:bg-white/[0.04] sm:min-h-0 sm:py-3 lg:px-5 lg:py-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-white/[0.92]">{p.title}</p>
                        <p className="mt-1 text-[11px] text-white/40">
                          {p.productType} · {p.mode === "LAUNCH" ? "Launch" : "Grow"} · <span className="text-white/55">{stage}</span>
                        </p>
                        <p className="mt-1 text-[10px] text-white/30">
                          {new Date(p.latestUpdateAt ?? p.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-white/20 transition group-hover:text-white/45" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className="lg:col-span-4 2xl:col-span-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-1 lg:border-0 lg:bg-transparent lg:p-0">
              <CommerceRails id="build-rails" layout="responsive" />
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
