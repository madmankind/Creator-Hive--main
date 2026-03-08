import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Creator Hive",
  description: "Creator Hive Terms of Service for brands, agencies, and creators.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using Creator Hive ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. Creator Hive is operated by Creator Hive FZE, registered at Sharjah Research Technology and Innovation Park, UAE.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 18 years old and have the legal capacity to enter into contracts to use the Platform. By creating an account, you represent that all information you provide is accurate.`,
  },
  {
    title: "3. Platform Use",
    body: `Creator Hive connects brands and agencies ("Clients") with creative talent ("Creators"). The Platform facilitates campaign briefs, deliverable management, contract generation, and payment processing. Creator Hive is not a party to any agreement between Clients and Creators.`,
  },
  {
    title: "4. User Accounts",
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately at hello@creatorhive.ae if you suspect unauthorised access.`,
  },
  {
    title: "5. Payments",
    body: `All payments are processed via Stripe Connect. Creator Hive charges a platform fee as set out in the Pricing page. Fees are non-refundable except as required by UAE consumer protection law or as expressly stated in these Terms.`,
  },
  {
    title: "6. Content & IP",
    body: `Creators retain intellectual property in their work until explicitly transferred to the Client via a signed contract on the Platform. Clients must not use creative deliverables outside the scope agreed in the campaign contract.`,
  },
  {
    title: "7. Prohibited Conduct",
    body: `You may not: (a) circumvent the Platform by contracting directly with matched talent outside Creator Hive within 12 months of introduction; (b) submit false information; (c) use the Platform for illegal purposes; (d) scrape, copy, or reverse-engineer the Platform.`,
  },
  {
    title: "8. Disclaimer & Limitation of Liability",
    body: `The Platform is provided "as is". Creator Hive makes no warranties regarding uninterrupted availability or fitness for a particular purpose. To the maximum extent permitted by UAE law, Creator Hive's total liability to you shall not exceed the fees paid by you in the prior three months.`,
  },
  {
    title: "9. Governing Law",
    body: `These Terms are governed by the laws of the United Arab Emirates. Any disputes shall be resolved by the courts of Sharjah, UAE.`,
  },
  {
    title: "10. Contact",
    body: `For any questions about these Terms, email us at hello@creatorhive.ae.`,
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-24">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] ring-1 ring-white/[0.10] text-[11px] text-white/40 mb-6">
            Legal
          </div>
          <h1 className="text-[36px] font-semibold tracking-[-0.025em] text-white/90 leading-[1.15] mb-3">
            Terms of Service
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
