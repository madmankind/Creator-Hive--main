import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions — Creator Hive",
  description:
    "Creator Hive Terms and Conditions governing the use of our platform by brands, agencies, and creators across the UAE and GCC.",
};

const lastUpdated = "March 2026";

type Clause = { text: string; items?: string[] };
type Section = { id: string; title: string; clauses: Clause[] };

const sections: Section[] = [
  {
    id: "1",
    title: "Introduction",
    clauses: [
      {
        text: 'Creator Hive FZE-LLC ("Creator Hive", "we", "us") provides a curated marketplace and platform ("Platform") enabling brands ("Brands") and independent professionals ("Creators") to collaborate on marketing, content production, and related services (the "Services"). By using our Platform, you agree to these Terms and Conditions (the "Terms").',
      },
    ],
  },
  {
    id: "2",
    title: "Data Protection & Privacy",
    clauses: [
      {
        text: "Creator Hive processes personal data under UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL) and, where relevant, under GDPR, UK GDPR, or other applicable data protection laws.",
      },
      {
        text: "Roles: Creator Hive acts as controller of Platform account data. For campaign data, Creator Hive may act as processor or joint controller with Brands, depending on the nature of processing involved.",
      },
      {
        text: "Cross-border transfers may occur where required to deliver the Services. Appropriate lawful safeguards apply in all cases.",
      },
      {
        text: "Both parties must promptly notify Creator Hive of any actual or suspected data breach involving personal data processed through the Platform.",
      },
    ],
  },
  {
    id: "3",
    title: 'Platform & Services "As Is"',
    clauses: [
      {
        text: 'The Platform and Services are provided "as is" and "as available" without warranties of any kind, express or implied.',
      },
      {
        text: "Creator Hive does not guarantee uninterrupted or error-free access to the Platform, the suitability of any Creator for a specific campaign, or the outcomes of any campaign.",
      },
      {
        text: "Brands remain solely responsible for the accuracy of their product claims, compliance with applicable advertising regulations, and all campaign content published under their brand.",
      },
    ],
  },
  {
    id: "4",
    title: "Campaign Agreements",
    clauses: [
      {
        text: "Each campaign is governed by a Campaign Agreement that specifies deliverables, timelines, fees, exclusivity, usage rights, and reporting obligations.",
      },
      {
        text: "Creator Hive provides standard contract templates for convenience. Brands and Creators may use their own agreements at their own risk. Creator Hive bears no responsibility for the adequacy or enforceability of non-platform agreements.",
      },
      {
        text: "Creator Hive is not a law firm and does not provide legal advice. Nothing in these Terms or any template constitutes legal advice.",
      },
    ],
  },
  {
    id: "5",
    title: "Intellectual Property",
    clauses: [
      {
        text: "Creators retain ownership of their original content except where ownership is explicitly transferred in a signed Campaign Agreement.",
      },
      {
        text: "Subject to full payment, Brands and Creator Hive receive a limited, worldwide, royalty-free licence to use campaign deliverables for the agreed usage period. Where no period is specified, the default is 12 months from delivery.",
      },
      {
        text: "Brand IP (including trademarks, logos, and brand materials) remains the exclusive property of the Brand. No IP ownership transfers to Creator Hive or any Creator unless explicitly agreed in writing.",
      },
    ],
  },
  {
    id: "6",
    title: "Payments, Fees & Taxes",
    clauses: [
      {
        text: "Payments are processed via Creator Hive's designated payment processor. Creator Hive acts as the payment intermediary between Brands and Creators.",
      },
      {
        text: "Unless otherwise stated in the Campaign Agreement, payments are due net 30 days after campaign completion and submission of a compliant invoice.",
      },
      {
        text: "All fees are quoted in AED unless otherwise agreed in writing. VAT and all other applicable taxes are the sole responsibility of the receiving party.",
      },
      {
        text: "Creator Hive reserves the right to apply late payment fees of 1.5% per month on overdue Brand payments, calculated from the due date.",
      },
    ],
  },
  {
    id: "7",
    title: "Creator Responsibilities",
    clauses: [
      {
        text: "All content produced through the Platform must comply with UAE federal law, applicable global advertising standards, and the rules of the relevant publishing platform.",
      },
      {
        text: "Sponsored posts and paid partnerships must include clear, prominent disclosures in accordance with applicable regulations (including #ad, Paid Partnership labels, TikTok's branded content toggle, and equivalent platform tools).",
      },
      {
        text: "The following are strictly prohibited:",
        items: [
          "Producing content that is illegal, defamatory, infringing, or deceptive.",
          "Inflating or purchasing engagement metrics (followers, likes, views, or comments).",
          "Making unsubstantiated product claims that are misleading under UAE consumer protection or advertising laws.",
          "Running giveaways or contests through the Platform without prior written approval from Creator Hive.",
        ],
      },
    ],
  },
  {
    id: "8",
    title: "Confidentiality",
    clauses: [
      {
        text: "All non-public information exchanged through the Platform — including campaign briefs, agreed rates, deliverable drafts, and performance data — is confidential.",
      },
      {
        text: "You must not disclose confidential information to any third party without the prior written consent of the disclosing party, except where disclosure is required by applicable law or a competent authority.",
      },
    ],
  },
  {
    id: "9",
    title: "Indemnification",
    clauses: [
      {
        text: "Creators agree to indemnify and hold harmless Creator Hive, its affiliates, and the relevant Brand against any losses, claims, damages, or costs arising from: (a) content produced or published in connection with a campaign; (b) a Creator's conduct or breach of these Terms; or (c) any third-party claim relating to the Creator's content.",
      },
      {
        text: "Creator Hive agrees to indemnify Brands and Creators against losses arising directly from Creator Hive's own wilful misconduct or from infringement of a third party's intellectual property rights in the Platform itself.",
      },
    ],
  },
  {
    id: "10",
    title: "Limitation of Liability",
    clauses: [
      {
        text: "Neither party is liable to the other for indirect, incidental, special, or consequential damages of any kind, including loss of profit, loss of revenue, or loss of data, arising from use of the Platform or Services.",
      },
      {
        text: "Creator Hive's aggregate liability per campaign is capped at AED 5,000 or the total campaign fees paid in the preceding 12 months, whichever is higher.",
      },
      {
        text: "The liability cap in clause 10.2 does not apply to: (a) wilful misconduct or gross negligence; (b) indemnity obligations under clause 9; or (c) any liability that cannot be excluded or limited under applicable UAE law.",
      },
    ],
  },
  {
    id: "11",
    title: "Governing Law & Dispute Resolution",
    clauses: [
      {
        text: "These Terms are governed by the federal laws of the United Arab Emirates.",
      },
      {
        text: "Any dispute arising from or in connection with these Terms that is not resolved amicably within 30 days of written notice shall be referred to and finally resolved by arbitration under the Rules of the Dubai International Arbitration Centre (DIAC). Seat of arbitration: Dubai, UAE. Language: English.",
      },
      {
        text: "Either party may seek injunctive or urgent interim relief in the UAE courts without prejudice to the arbitration clause.",
      },
    ],
  },
  {
    id: "12",
    title: "Miscellaneous",
    clauses: [
      {
        text: "Updates: Creator Hive may update these Terms at any time with reasonable notice. Updated Terms apply to new campaigns immediately and to ongoing campaigns 10 days after notice, unless you object in writing within that period.",
      },
      {
        text: "Assignment: You may not assign your rights or obligations under these Terms without Creator Hive's prior written consent. Creator Hive may assign these Terms to an affiliate or successor without your consent.",
      },
      {
        text: "Entire Agreement: These Terms, together with any applicable Campaign Agreement, constitute the entire agreement between the parties with respect to their subject matter.",
      },
      {
        text: "Severability & Waiver: If any provision of these Terms is found invalid or unenforceable, it shall be modified to the minimum extent necessary to make it valid. The remainder of these Terms continues in full force. A failure to enforce any provision is not a waiver of the right to enforce it in the future.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#07070B] text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "70vw", height: "35vh",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.22) 0%, transparent 70%)",
          filter: "blur(120px)", opacity: 0.08,
        }} />
        <div style={{
          position: "absolute", top: "20%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw", height: "60vh",
          background: "radial-gradient(ellipse, #7c3aed 0%, #4c1d95 60%, transparent 100%)",
          filter: "blur(200px)", opacity: 0.07,
        }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-24 pb-28">

        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-[11px] font-medium text-white/40"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
            Legal
          </div>
          <h1 className="text-[38px] font-semibold tracking-[-0.03em] leading-[1.12] text-white/92 mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-[13px] text-white/28 mb-4">Last updated: {lastUpdated}</p>
          <a
            href="/legal/contracts/Creator_Hive_User_Agreement_FINAL.pdf"
            download="Creator_Hive_User_Agreement_FINAL.pdf"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 ring-1 ring-white/20 text-[13px] font-medium text-white/90 transition-colors"
          >
            Download PDF
          </a>
          <p className="text-[14px] text-white/42 leading-relaxed mt-4 max-w-[560px]">
            These Terms govern your use of the Creator Hive platform. Please read them carefully
            before creating an account or starting a campaign.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={`section-${section.id}`}>
              {/* Section heading */}
              <div className="flex items-center gap-3 mb-5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
                  style={{
                    background: "rgba(124,92,255,0.14)",
                    border: "1px solid rgba(124,92,255,0.30)",
                    color: "rgba(167,139,250,0.85)",
                  }}>
                  {section.id}
                </span>
                <h2 className="text-[16px] font-semibold text-white/82 tracking-tight">
                  {section.title}
                </h2>
              </div>

              {/* Clauses */}
              <div className="space-y-4 pl-9">
                {section.clauses.map((clause, ci) => (
                  <div key={ci}>
                    <p className="text-[14px] text-white/52 leading-[1.65]">
                      {clause.text}
                    </p>
                    {clause.items && clause.items.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {clause.items.map((item, ii) => (
                          <li key={ii} className="flex items-start gap-2.5">
                            <span className="mt-[7px] flex-shrink-0 w-1 h-1 rounded-full bg-purple-400/40" />
                            <span className="text-[13px] text-white/45 leading-[1.60]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Section divider */}
              <div className="mt-10 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
            </section>
          ))}
        </div>

        {/* Contact footer */}
        <div className="mt-14 rounded-2xl px-6 py-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[13px] font-medium text-white/65 mb-1">Questions about these Terms?</p>
          <p className="text-[13px] text-white/38 leading-relaxed">
            Email us at{" "}
            <a href="mailto:hello@creatorhive.ae"
              className="text-purple-400/80 hover:text-purple-400 transition-colors underline decoration-purple-400/30 underline-offset-2">
              hello@creatorhive.ae
            </a>
            {" "}— we aim to respond within 2 business days.
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          <Link href="/" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">
            ← Back to Creator Hive
          </Link>
          <Link href="/privacy" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </main>
  );
}
