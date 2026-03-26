"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CultureStory } from "@/lib/editorial/queries";
import { CULTURE_CATEGORIES } from "@/lib/editorial/queries";

/* ── primitives ─────────────────────────────────────────── */

function MaybeLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  if (!href) return <div className={className}>{children}</div>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={`block ${className ?? ""}`}>{children}</a>;
}

function StoryImage({ src, alt, className, sizes, priority, fill }: {
  src: string; alt: string; className?: string; sizes?: string; priority?: boolean; fill?: boolean;
}) {
  const isExternal = !src.includes("unsplash.com") && !src.includes("creatorhive.ae");
  if (isExternal) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`${className ?? ""} ${fill ? "absolute inset-0 h-full w-full" : ""}`} loading={priority ? "eager" : "lazy"} />;
  }
  return <Image src={src} alt={alt} fill={fill} priority={priority} className={className} sizes={sizes} />;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : `${Math.floor(d / 7)}w ago`;
}

const FALLBACKS = [
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80&auto=format&fit=crop",
];

const CAP = "rounded-sm bg-[#f4f1eb]/[0.97] text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.04)] border border-stone-300/30";

type Card = { id: string; cat: string; title: string; meta: string; image: string; url: string; summary: string | null };

function toCard(s: CultureStory, i: number): Card {
  return {
    id: s.id, cat: s.displayCategory,
    title: s.title, meta: `${s.sourceName} · ${s.publishedAt ? timeAgo(s.publishedAt) : "recently"}`,
    image: s.imageUrl ?? FALLBACKS[i % FALLBACKS.length], url: s.canonicalUrl, summary: s.aiSummary,
  };
}

/* ── MAIN COMPONENT ─────────────────────────────────────── */

type Props = { dbStories?: CultureStory[]; activeCategory?: string };

export function HiveCulture({ dbStories = [], activeCategory = "Global" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cards = dbStories.length > 0 ? dbStories.map(toCard) : [];
  const hasContent = cards.length > 0;

  // Slots: hero(1), trending rail(up to 8), grid(rest)
  const hero = cards[0];
  const trending = cards.slice(1, 9);
  const grid = cards.slice(9);

  // Scroller refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = useCallback((dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  }, []);

  const setCategory = useCallback((cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "Global") params.delete("category");
    else params.set("category", cat);
    router.push(`/dashboard/hive${params.toString() ? `?${params}` : ""}`);
  }, [router, searchParams]);

  if (!hasContent) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-[13px] text-white/30">No stories yet — run ingestion to populate Culture.</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-10">
      {/* ── Header ── */}
      <header className="mb-6 max-w-3xl lg:mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Culture</p>
        <h1 className="mt-2 text-[clamp(1.75rem,3.8vw,2.35rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-white/[0.97]">
          What&apos;s moving in culture now
        </h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-white/44">
          Fashion, beauty, creator brands, and the commerce reshaping taste.
        </p>
      </header>

      {/* ── Hero — full bleed cover story ── */}
      <section className="relative left-1/2 mb-8 w-screen max-w-[100vw] -translate-x-1/2 lg:mb-9">
        <MaybeLink href={hero.url}>
          <div className="relative aspect-[21/9] min-h-[200px] w-full overflow-hidden sm:aspect-[21/8] lg:aspect-[3.2/1]">
            <StoryImage src={hero.image} alt={hero.title} fill priority className="object-cover object-[center_35%]" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 sm:p-7 lg:p-8">
              <span className={`inline-block w-fit px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-600 ${CAP}`}>
                {hero.cat}
              </span>
              <h2 className="mt-3 max-w-3xl text-[clamp(1.45rem,2.8vw,2rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-white">{hero.title}</h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/50">{hero.summary ?? hero.meta}</p>
            </div>
          </div>
        </MaybeLink>
      </section>

      {/* ── Trending scroller with arrow nav ── */}
      {trending.length > 0 && (
        <section className="mb-8 lg:mb-9">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/40">Trending now</h2>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => scroll("left")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/50 transition hover:bg-white/[0.08] hover:text-white/80">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={() => scroll("right")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/50 transition hover:bg-white/[0.08] hover:text-white/80">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div ref={scrollRef}
            className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 scroll-smooth sm:-mx-5 sm:px-5 lg:-mx-8 lg:gap-4 lg:px-8 xl:-mx-12 xl:px-12 2xl:-mx-16 2xl:px-16"
            style={{ scrollSnapType: "x mandatory" }}>
            {trending.map((t) => (
              <MaybeLink key={t.id} href={t.url} className="w-[280px] shrink-0 snap-start sm:w-[300px] lg:w-[320px]">
                <article className="group overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02] transition hover:border-white/[0.12]">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900/20">
                    <StoryImage src={t.image} alt="" fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="320px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-2.5 left-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70">{t.cat}</span>
                  </div>
                  <div className="px-3.5 py-3">
                    <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.01em] text-white/[0.92]">{t.title}</h3>
                    <p className="mt-1.5 text-[10px] text-white/35">{t.meta}</p>
                  </div>
                </article>
              </MaybeLink>
            ))}
          </div>
        </section>
      )}

      {/* ── Category tabs — real filters ── */}
      <nav className="mb-7 flex flex-wrap gap-x-5 gap-y-2.5 border-b border-white/[0.06] pb-3.5" aria-label="Culture categories">
        {CULTURE_CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button key={cat} type="button" onClick={() => setCategory(cat)}
              className={`relative pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${active ? "text-white/92" : "text-white/30 hover:text-white/55"}`}>
              {cat}
              {active && <span className="absolute -bottom-[1px] left-0 right-0 h-px bg-amber-400/80" aria-hidden />}
            </button>
          );
        })}
      </nav>

      {/* ── Editorial grid — dense 3-col, no dead space ── */}
      <section className="mb-10">
        <h2 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/40">
          {activeCategory === "Global" ? "Latest stories" : activeCategory}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {grid.map((s) => (
            <MaybeLink key={s.id} href={s.url}>
              <article className="group overflow-hidden rounded-sm border border-white/[0.06] bg-[#0a0a0f] transition hover:border-white/[0.12]">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900/20">
                  <StoryImage src={s.image} alt="" fill className="object-cover transition duration-300 group-hover:scale-[1.02]" sizes="(max-width:1024px) 50vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className={`${CAP} px-4 py-3`}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400/70">{s.cat}</p>
                  <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-stone-900">{s.title}</h3>
                  <p className="mt-1.5 text-[10px] text-stone-400">{s.meta}</p>
                </div>
              </article>
            </MaybeLink>
          ))}
        </div>

        {grid.length === 0 && (
          <p className="py-8 text-center text-[12px] text-white/25">No more stories in this category.</p>
        )}
      </section>


      {/* ── Drops bridge to Shop ── */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/45">Featured drops</h2>
          <Link href="/dashboard/hive/shop" className="text-[11px] font-semibold text-white/38 underline-offset-4 hover:text-white/65">Open Shop →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { name: "Archive crew", price: "AED 420", status: "Limited" },
            { name: "Studio cap", price: "AED 280", status: "New" },
            { name: "Field notes tee", price: "AED 310", status: "Restock" },
          ].map((d) => (
            <div key={d.name} className={`${CAP} flex flex-col justify-between p-4 sm:p-5`}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">{d.status}</p>
                <p className="mt-2 text-[16px] font-semibold tracking-[-0.02em] text-stone-900">{d.name}</p>
              </div>
              <p className="mt-4 text-[12px] font-medium text-stone-600">{d.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
