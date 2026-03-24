"use client";

import Image from "next/image";
import Link from "next/link";

const SNIPPET = "rounded-sm bg-[#f4f1eb]/[0.97] text-stone-900 border border-stone-300/35";

const FEATURED = {
  title: "Hive Select — Winter edit",
  line: "Creator-led pieces with retail-grade presentation. Limited runs.",
  image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&q=80&auto=format&fit=crop",
  alt: "Fashion collection",
};

const PRODUCTS = [
  { name: "Merino crew", brand: "Studio A", price: "AED 360", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80&auto=format&fit=crop" },
  { name: "Field jacket", brand: "North lane", price: "AED 890", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80&auto=format&fit=crop" },
  { name: "Glass skin set", brand: "Lab 04", price: "AED 240", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80&auto=format&fit=crop" },
  { name: "Ceramic mug", brand: "Objects", price: "AED 120", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80&auto=format&fit=crop" },
  { name: "Waxed flight pants", brand: "Lab 04", price: "AED 560", image: "https://images.unsplash.com/photo-1541099649105-f69ad21ef324?w=600&q=80&auto=format&fit=crop" },
  { name: "14k drip necklace", brand: "North lane", price: "AED 1,500", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80&auto=format&fit=crop" },
];

const BRAND_RAIL = [
  { name: "North Lane", line: "Tasteful jewelry", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80&auto=format&fit=crop" },
  { name: "Lab 04", line: "Noir essentials", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80&auto=format&fit=crop" },
  { name: "Archive", line: "Inspired objects", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format&fit=crop" },
];

export function HiveShopStorefront() {
  const latest = PRODUCTS.slice(0, 4);
  const curated = PRODUCTS.slice(4, 6);

  return (
    <div className="w-full pb-10">
      <header className="mb-7 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Shop</p>
        <h1 className="mt-2 text-[clamp(1.6rem,3.4vw,2.15rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-white/[0.97]">
          Curated creator-led drops
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-white/42">Drops, collections, and houses — retail-native, taste-forward.</p>
      </header>

      {/* 1) Featured collection */}
      <section className="relative left-1/2 mb-9 w-screen max-w-[100vw] -translate-x-1/2 lg:mb-10">
        <div className="relative aspect-[16/9] min-h-[180px] w-full overflow-hidden sm:min-h-[200px] lg:aspect-[3.4/1] lg:min-h-0">
          <Image src={FEATURED.image} alt={FEATURED.alt} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/55 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-6 sm:max-w-2xl sm:p-9">
            <div className={`inline-flex w-fit px-3 py-1.5 ${SNIPPET}`}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-600">Featured collection</span>
            </div>
            <h2 className="mt-4 text-[clamp(1.35rem,2.65vw,1.9rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">{FEATURED.title}</h2>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-white/65">{FEATURED.line}</p>
            <button
              type="button"
              className="mt-6 w-fit rounded-full bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-900 transition hover:bg-stone-100"
            >
              View collection
            </button>
          </div>
        </div>
      </section>

      {/* 2) Creator brands */}
      <section className="mb-9">
        <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/45">Creator brands</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
          {BRAND_RAIL.map((b) => (
            <Link
              key={b.name}
              href="/dashboard/hive/shop"
              className="group relative overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] transition hover:border-amber-400/30 hover:bg-white/[0.04]"
            >
              <div className="relative aspect-[16/10] w-full">
                <Image src={b.image} alt="" fill className="object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100" sizes="(max-width:1024px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-[#050508]/25 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[14px] font-semibold tracking-[-0.02em] text-white">{b.name}</p>
                <p className="mt-0.5 text-[12px] text-white/55">{b.line}</p>
                <p className="mt-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-400/80 transition group-hover:text-amber-400 group-hover:gap-1.5">
                  Shop brand <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3) Latest products */}
      <section className="mb-9">
        <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/45">Latest products</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {latest.map((p) => (
            <ProductCard key={p.name + p.brand} product={p} />
          ))}
        </div>
      </section>

      {/* 4) Curated drop / seasonal */}
      <section className="mb-9">
        <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/45">Curated drop</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {curated.map((p) => (
            <article key={p.name + p.brand} className="group overflow-hidden rounded-lg border border-amber-400/15 bg-white/[0.02]">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-white/[0.03]">
                <Image src={p.image} alt="" fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(max-width:1024px) 50vw, 50vw" />
              </div>
              <div className="border-t border-white/[0.06] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-400/55">Curated</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/38">{p.brand}</p>
                <p className="mt-1 text-[15px] font-semibold leading-tight tracking-[-0.02em] text-white/[0.94]">{p.name}</p>
                <p className="mt-1 text-[12px] font-medium tabular-nums text-white/50">{p.price}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5) Build with Hive */}
      <section className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-5 py-5 sm:flex sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-[16px] font-semibold tracking-[-0.02em] text-white/[0.90]">Build your next drop with Hive</p>
          <p className="mt-1 text-[12px] text-white/38">Research → brief → production rails.</p>
        </div>
        <Link
          href="/dashboard/hive/build"
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-white/[0.1] px-5 text-[11px] font-semibold text-white/90 ring-1 ring-white/[0.12] transition hover:bg-white/[0.14] sm:mt-0"
        >
          Open Build
        </Link>
      </section>
    </div>
  );
}

function ProductCard({
  product: p,
}: {
  product: { name: string; brand: string; price: string; image: string };
}) {
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-white/[0.06] bg-[#0a0a0f] ring-0 ring-amber-400/0 transition duration-300 group-hover:border-white/[0.12] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] group-hover:ring-1 group-hover:ring-amber-400/12">
        <Image src={p.image} alt="" fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(max-width:1024px) 50vw, 25vw" />
      </div>
      <div className="mt-2 space-y-0.5 px-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">{p.brand}</p>
        <p className="text-[15px] font-semibold leading-tight tracking-[-0.02em] text-white/[0.94]">{p.name}</p>
        <p className="pt-0.5 text-[12px] font-semibold tabular-nums text-white/55">{p.price}</p>
      </div>
    </article>
  );
}
