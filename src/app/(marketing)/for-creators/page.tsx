import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Creators — Creator Hive",
  description: "Get discovered by top GCC brands. Manage bookings, deliverables, and payments — all in one place.",
};

export default function ForCreatorsPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
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
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0B0F14] rounded-xl text-[14px] font-medium hover:bg-white/90 transition-all"
        >
          Apply to join the Hive →
        </a>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          { title: "Get found by real brands", body: "Your profile is matched against active brand briefs across the GCC. No cold pitching needed." },
          { title: "Scope protection built in", body: "Deliverables and revision limits are locked in before work starts. No scope creep by design." },
          { title: "Payments on time, every time", body: "Milestones release funds automatically on approval. No invoicing, no chasing, no delays." },
        ].map(({ title, body }) => (
          <div key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
            <div className="text-[14px] font-medium text-white/80 mb-2">{title}</div>
            <div className="text-[13px] text-white/35 leading-relaxed">{body}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
