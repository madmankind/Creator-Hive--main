import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Creator Hive",
  description: "How Creator Hive collects, uses, and protects your personal data.",
};

const sections = [
  {
    title: "1. Who We Are",
    body: `Creator Hive FZE ("Creator Hive", "we", "us") is registered at Sharjah Research Technology and Innovation Park, UAE. We operate the Creator Hive platform at creatorhive.ae.`,
  },
  {
    title: "2. What We Collect",
    body: `We collect: (a) Account data — name, email, company name, and Instagram handle where provided; (b) Usage data — pages visited, features used, campaign interactions; (c) Payment data — processed by Stripe; we do not store card details; (d) Content — briefs, deliverables, and communications you submit through the Platform.`,
  },
  {
    title: "3. How We Use Your Data",
    body: `We use your data to: provide and improve the Platform; match Clients with Creators; process payments; send campaign updates and service communications; comply with UAE legal obligations. We do not sell your data to third parties.`,
  },
  {
    title: "4. Data Sharing",
    body: `We share data only with: (a) other users where necessary for the campaign workflow (e.g. sharing a Creator's profile with a matched Client); (b) service providers (Stripe, Vercel, Supabase) under data processing agreements; (c) authorities when required by UAE law.`,
  },
  {
    title: "5. Data Retention",
    body: `We retain your account data for as long as your account is active plus 2 years, or as required by law. Campaign data is retained for 5 years for financial record purposes.`,
  },
  {
    title: "6. Your Rights",
    body: `Under UAE Personal Data Protection Law (PDPL) and applicable regulations, you have the right to access, correct, or delete your personal data. Submit requests to privacy@creatorhive.ae. We will respond within 30 days.`,
  },
  {
    title: "7. Cookies",
    body: `We use essential cookies for authentication and session management. We use analytics cookies (Vercel Analytics) to understand platform usage. You may disable non-essential cookies via your browser settings.`,
  },
  {
    title: "8. Security",
    body: `We implement industry-standard security measures including encryption in transit (TLS), encrypted storage, and access controls. No system is 100% secure. Report security concerns to security@creatorhive.ae.`,
  },
  {
    title: "9. Contact",
    body: `For privacy questions, contact privacy@creatorhive.ae. Creator Hive FZE, Sharjah Research Technology and Innovation Park, UAE.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-24">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] ring-1 ring-white/[0.10] text-[11px] text-white/40 mb-6">
            Legal
          </div>
          <h1 className="text-[36px] font-semibold tracking-[-0.025em] text-white/90 leading-[1.15] mb-3">
            Privacy Policy
          </h1>
          <p className="text-[14px] text-white/35">Last updated: January 2025</p>
        </div>

        <div className="space-y-10">
          {sections.map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-[15px] font-semibold text-white/75 mb-3">{title}</h2>
              <p className="text-[14px] text-white/45 leading-relaxed">{body}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.07]">
          <a
            href="/"
            className="text-[13px] text-white/35 hover:text-white/60 transition-colors"
          >
            ← Back to Creator Hive
          </a>
        </div>
      </div>
    </main>
  );
}
