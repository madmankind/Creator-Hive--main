import Link from 'next/link';

export const metadata = {
  title: 'Join as a Creator — Creator Hive',
  description: 'Get vetted, get discovered, get booked. Join Creator Hive as a UAE creator.',
};

export default function TalentLandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#07070B', color: 'rgba(255,255,255,0.88)' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(900px 600px at 30% 15%, rgba(124,92,255,0.10) 0%, transparent 60%), radial-gradient(700px 500px at 70% 80%, rgba(0,220,255,0.05) 0%, transparent 60%)',
        zIndex: 0,
      }} />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">

        {/* Nav */}
        <header className="flex items-center justify-between mb-20">
          <Link href="/" className="text-[13px] font-medium opacity-30 hover:opacity-60 transition-opacity select-none">
            Creator Hive
          </Link>
          <Link
            href="/?continueTalentOnboarding=1"
            className="text-[13px] px-4 py-2 rounded-lg transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)' }}
          >
            Apply now
          </Link>
        </header>

        {/* Hero */}
        <div className="mb-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-4"
            style={{ color: 'rgba(255,255,255,0.28)' }}>
            For Creators
          </p>
          <h1 className="text-[44px] font-light tracking-[-0.03em] leading-[1.08] mb-6">
            Get discovered by<br />UAE's top brands.
          </h1>
          <p className="text-[16px] font-light leading-relaxed max-w-md"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            Creator Hive vets, matches, and places talented creators into brand campaigns.
            No cold DMs. No rate negotiation. Just work.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/?continueTalentOnboarding=1"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.90)' }}
            >
              Start your application →
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-6"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            How it works
          </p>
          <div className="space-y-4">
            {[
              { n: '01', title: 'Take the Origin Story', body: 'A 4-question Prism assessment maps your creative style to one of 8 professional archetypes.' },
              { n: '02', title: 'Build your profile', body: 'Add your work, rates, and niches. Your Prism archetype is visible to brands for better matching.' },
              { n: '03', title: 'Get matched and booked', body: "When a brand's brief aligns with your archetype and skills, we surface you. You review, accept, execute." },
              { n: '04', title: 'Get paid on time', body: 'Structured payment schedules, clear deliverables, milestone-based releases. No chasing invoices.' },
            ].map((s) => (
              <div key={s.n} className="flex gap-5 rounded-2xl px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[11px] font-semibold flex-shrink-0 mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.22)' }}>{s.n}</span>
                <div>
                  <p className="text-[14px] font-medium mb-1">{s.title}</p>
                  <p className="text-[13px] font-light" style={{ color: 'rgba(255,255,255,0.42)' }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prism archetypes teaser */}
        <div className="mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            The Prism Compass
          </p>
          <p className="text-[13px] font-light mb-5" style={{ color: 'rgba(255,255,255,0.40)' }}>
            8 archetypes. One is yours.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { name: 'The Maverick', accent: 'rgba(229,72,77,0.7)' },
              { name: 'The Auteur', accent: 'rgba(251,146,60,0.7)' },
              { name: 'The Architect', accent: 'rgba(99,102,241,0.7)' },
              { name: 'The Amplifier', accent: 'rgba(34,211,238,0.7)' },
              { name: 'The Conductor', accent: 'rgba(167,139,250,0.7)' },
              { name: 'The Pathfinder', accent: 'rgba(0,220,255,0.7)' },
              { name: 'The Alchemist', accent: 'rgba(234,179,8,0.7)' },
              { name: 'The Translator', accent: 'rgba(52,211,153,0.7)' },
            ].map((a) => (
              <div key={a.name}
                className="rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${a.accent}20` }}>
                <div className="w-1.5 h-1.5 rounded-full mb-2" style={{ background: a.accent }} />
                <p className="text-[12px] font-medium">{a.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl px-6 py-6 text-center"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-[22px] font-light tracking-[-0.02em] mb-2">Ready to join?</h2>
          <p className="text-[13px] font-light mb-5" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Applications take 5 minutes. We review and respond within 3 business days.
          </p>
          <Link
            href="/?continueTalentOnboarding=1"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.90)' }}
          >
            Start application →
          </Link>
        </div>

      </div>
    </main>
  );
}
