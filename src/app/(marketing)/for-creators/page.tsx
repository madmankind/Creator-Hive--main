import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Creators — Creator Hive",
  description: "Get discovered by top GCC brands. Manage bookings, deliverables, and payments — all in one place.",
};

export default function ForCreatorsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#07070B', color: 'rgba(255,255,255,0.88)' }}>
      <section className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] ring-1 ring-white/[0.10] text-[11px] text-white/40 mb-8">
          For creators &amp; freelancers
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold tracking-[-0.03em] leading-[1.1] text-white/92 mb-6">
          Your work.<br />Your rate.<br />Zero chasing.
        </h1>
        <p className="text-[17px] text-white/40 font-light max-w-[520px] leading-relaxed mb-10">
          Join a curated network of UAE and GCC-based creators. Get matched with brands that fit your niche, negotiate scope once, then get paid on time.
        </p>
        <a
          href="/onboarding/step-1"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.90)' }}
        >
          Apply to join →
        </a>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          { title: "Get found by real brands", body: "Your profile is matched against active brand briefs across the GCC. No cold pitching needed." },
          { title: "Scope protection built in", body: "Deliverables and revision limits are locked in before work starts. No scope creep by design." },
          { title: "Payments on time, every time", body: "Milestones release funds automatically on approval. No invoicing, no chasing, no delays." },
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
