"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useCallback, useState, useEffect } from "react";
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

// ── Showreel clips — swap these for your own videos anytime ─────────────────
// Drop MP4s into /public/showreel/ and update this list.
// Current: curated Pexels free videos (fashion / beauty / creator aesthetic)
const SHOWREEL: { src: string; poster?: string }[] = [
  {
    src: "https://videos.pexels.com/video-files/3196154/3196154-uhd_2560_1440_30fps.mp4",
    poster: "https://images.pexels.com/videos/3196154/free-video-3196154.jpg?auto=compress&cs=tinysrgb&w=1280",
  },
  {
    src: "https://videos.pexels.com/video-files/3209045/3209045-uhd_2560_1440_25fps.mp4",
    poster: "https://images.pexels.com/videos/3209045/free-video-3209045.jpg?auto=compress&cs=tinysrgb&w=1280",
  },
  {
    src: "https://videos.pexels.com/video-files/3191593/3191593-uhd_2560_1440_25fps.mp4",
    poster: "https://images.pexels.com/videos/3191593/free-video-3191593.jpg?auto=compress&cs=tinysrgb&w=1280",
  },
  {
    src: "https://videos.pexels.com/video-files/5704720/5704720-hd_1920_1080_25fps.mp4",
    poster: "https://images.pexels.com/videos/5704720/free-video-5704720.jpg?auto=compress&cs=tinysrgb&w=1280",
  },
  {
    src: "https://videos.pexels.com/video-files/3249539/3249539-uhd_2560_1440_25fps.mp4",
    poster: "https://images.pexels.com/videos/3249539/free-video-3249539.jpg?auto=compress&cs=tinysrgb&w=1280",
  },
];

const CLIP_DURATION = 8000; // ms per clip before crossfade

function ShowreelBg() {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const currentRef = useRef<HTMLVideoElement>(null);
  const nextRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    const n = (current + 1) % SHOWREEL.length;
    setNext(n);
    setFading(true);
    setTimeout(() => { setCurrent(n); setNext(null); setFading(false); }, 900);
  }, [current]);

  useEffect(() => {
    timerRef.current = setTimeout(advance, CLIP_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, advance]);

  useEffect(() => {
    const v = currentRef.current;
    if (!v) return;
    v.play().catch(() => setVideoFailed(true));
  }, [current]);

  useEffect(() => {
    if (next !== null) nextRef.current?.play().catch(() => {});
  }, [next]);

  const clip = SHOWREEL[current];

  return (
    <>
      {/* Poster image fallback — always shown, video renders on top when it loads */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={clip.poster}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ opacity: videoFailed ? 1 : 0.6 }}
      />

      {/* Video layer — muted autoplay, crossOrigin for broad compatibility */}
      {!videoFailed && (
        <video
          ref={currentRef}
          key={`cur-${current}`}
          src={clip.src}
          poster={clip.poster}
          autoPlay muted loop playsInline
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ opacity: fading ? 0 : 1, transition: "opacity 900ms ease" }}
          onError={() => setVideoFailed(true)}
        />
      )}
      {next !== null && !videoFailed && (
        <video
          ref={nextRef}
          key={`nxt-${next}`}
          src={SHOWREEL[next].src}
          poster={SHOWREEL[next].poster}
          autoPlay muted loop playsInline
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ opacity: fading ? 1 : 0, transition: "opacity 900ms ease" }}
        />
      )}

      {/* Clip dots */}
      <div className="absolute bottom-5 right-6 flex items-center gap-1.5 z-10">
        {SHOWREEL.map((_, i) => (
          <button key={i} type="button"
            onClick={() => { setCurrent(i); setNext(null); setFading(false); setVideoFailed(false); }}
            className="rounded-full transition-all duration-300"
            style={{ width: i === current ? "18px" : "5px", height: "5px", background: i === current ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.28)" }} />
        ))}
      </div>
    </>
  );
}

// ── Spotlight feature — manually curated, swapped weekly ─────────────────────
// This is the hero slot. Swap this object to feature a creator, campaign, or brand collab.
// For paid publisher content, set isPaid: true and add partnerName.
const SPOTLIGHT: {
  label: string;
  headline: string;
  subline: string;
  cta?: { text: string; href: string };
  isPaid?: boolean;
  partnerName?: string;
} = {
  label: "In the Spotlight",
  headline: "UAE Creative Talent, Front and Centre",
  subline: "Each week we feature creators, campaigns, and collaborations shaping the regional scene. This is their space.",
  cta: { text: "Explore talent →", href: "/dashboard/campaigns?mode=discover" },
  isPaid: false,
};


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

      {/* ── Spotlight hero — full bleed, decoupled from RSS ── */}
      <section className="relative left-1/2 mb-10 w-screen max-w-[100vw] -translate-x-1/2">
        <div className="relative aspect-[21/9] min-h-[240px] w-full overflow-hidden sm:aspect-[21/8] lg:aspect-[3.2/1]">
          <ShowreelBg />
          {/* Rich gradient — heavier at bottom for text legibility */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(5,5,8,0.96) 0%, rgba(5,5,8,0.55) 40%, rgba(5,5,8,0.10) 100%)" }} />
          {/* Left edge vignette */}
          <div className="absolute inset-y-0 left-0 w-1/3"
            style={{ background: "linear-gradient(to right, rgba(5,5,8,0.60), transparent)" }} />

          {/* Spotlight content */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-6 pb-7 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10">
            {/* Label row */}
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{ background: "rgba(251,176,36,0.15)", border: "1px solid rgba(251,176,36,0.35)", color: "rgba(251,176,36,0.90)" }}>
                ✦ {SPOTLIGHT.label}
              </span>
              {SPOTLIGHT.isPaid && SPOTLIGHT.partnerName && (
                <span className="text-[10px] text-white/30 tracking-wide">
                  Presented by <span className="text-white/50">{SPOTLIGHT.partnerName}</span>
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 className="max-w-2xl text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-white">
              {SPOTLIGHT.headline}
            </h1>

            {/* Subline */}
            <p className="mt-2.5 max-w-xl text-[13px] leading-relaxed text-white/48">
              {SPOTLIGHT.subline}
            </p>

            {/* CTA */}
            {SPOTLIGHT.cta && (
              <Link href={SPOTLIGHT.cta.href}
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)"; }}>
                {SPOTLIGHT.cta.text}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── News feed header ── */}
      <header className="mb-6 max-w-3xl lg:mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">News Feed</p>
        <h2 className="mt-1.5 text-[clamp(1.3rem,2.4vw,1.65rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white/90">
          What&apos;s moving in culture now
        </h2>
        <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/38">
          Fashion, beauty, creator brands, and the commerce reshaping taste.
        </p>
      </header>

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
