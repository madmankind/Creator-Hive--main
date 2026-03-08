import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Creator Hive",
  description: "Transparent pricing for brands and creators. No hidden fees.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <section className="max-w-4xl mx-auto px-6 pt-28 pb-16 text-center">
        <h1 className="text-[40px] md:text-[52px] font-semibold tracking-[-0.03em] leading-[1.1] text-white/92 mb-4">
          Simple pricing
        </h1>
        <p className="text-[16px] text-white/35 font-light max-w-[440px] mx-auto leading-relaxed">
          No platform tax. No hidden markups. You pay the talent directly.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          {
            plan: "Starter",
            price: "0%",
            sub: "Platform fee",
            features: ["Up to 5 active campaigns", "Direct talent booking", "Deliverable tracking", "Basic contract generation"],
            cta: "Start for free",
            href: "/",
          },
          {
            plan: "Pro",
            price: "8%",
            sub: "Per campaign managed",
            features: ["Unlimited campaigns", "Priority talent matching", "Auto SOW generation", "Payment escrow & milestones", "WhatsApp campaign alerts"],
            cta: "Get started",
            href: "/",
            highlight: true,
          },
          {
            plan: "Enterprise",
            price: "Custom",
            sub: "Volume & agency pricing",
            features: ["Dedicated account manager", "Custom workflows", "SLA guarantees", "Bulk talent booking", "API access"],
            cta: "Talk to us",
            href: "mailto:hello@creatorhive.ae",
          },
        ].map(({ plan, price, sub, features, cta, href, highlight }) => (
          <div
            key={plan}
            className={`rounded-2xl border p-7 flex flex-col gap-5 ${
              highlight
                ? "border-white/[0.18] bg-white/[0.05]"
                : "border-white/[0.07] bg-white/[0.02]"
            }`}
          >
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-white/35 mb-2">{plan}</div>
              <div className="text-[36px] font-semibold tracking-[-0.03em] text-white/90">{price}</div>
              <div className="text-[12px] text-white/30 mt-0.5">{sub}</div>
            </div>
            <ul className="space-y-2 flex-1">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-white/45">
                  <span className="text-white/25 mt-0.5">—</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={href}
              className={`block text-center px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                highlight
                  ? "bg-white text-[#0B0F14] hover:bg-white/90"
                  : "border border-white/[0.12] text-white/60 hover:bg-white/[0.06]"
              }`}
            >
              {cta}
            </a>
          </div>
        ))}
      </section>
    </main>
  );
}
