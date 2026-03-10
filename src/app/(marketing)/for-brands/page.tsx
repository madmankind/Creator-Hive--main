import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Brands — Creator Hive",
  description: "Book vetted creative talent across the GCC. Pre-built campaign teams, contract-to-payment in one flow.",
};

export default function ForBrandsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#07070B', color: 'rgba(255,255,255,0.88)' }}>
      <section className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] ring-1 ring-white/[0.10] text-[11px] text-white/40 mb-8">
          For brands &amp; agencies
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold tracking-[-0.03em] leading-[1.1] text-white/92 mb-6">
          Creative execution,<br />without the overhead.
        </h1>
        <p className="text-[17px] text-white/40 font-light max-w-[520px] leading-relaxed mb-10">
          Browse pre-vetted talent across every creative discipline. Build your team, define deliverables, lock scope — then track delivery in real time.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.90)' }}
        >
          Start discovering talent →
        </a>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          { title: "Vetted teams, deployed fast", body: "Every creator is manually reviewed. You get quality signal before you hire — not after." },
          { title: "From brief to delivery", body: "Set deliverables, approve submissions, release payment. One platform, no email chains." },
          { title: "Transparent pricing", body: "No markups, no surprises. Know the full cost before you commit to a single post." },
        ].map(({ title, body }) => (
          <div key={title} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[14px] font-medium mb-2" style={{ color: 'rgba(255,255,255,0.80)' }}>{title}</div>
            <div className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>{body}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
