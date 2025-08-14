"use client";
import { AccountCard } from "./page.client";
import { buttonVariants } from "@/components/ui/button-variants";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MarketingHome() {
  return (
    <main className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center noise-bg">
        <div className="container grid md:grid-cols-2 gap-12 items-center py-20">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-gradient font-extrabold leading-tight"
              style={{ fontSize: "var(--h1-size)" }}
            >
              Change the way you create & get paid.
            </motion.h1>
            <motion.p className="mt-6 text-lg text-[color:var(--color-muted-foreground)]" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              Smart contracts, milestone payouts, scope control, and compliance for the GCC creator economy.
            </motion.p>
            <motion.div className="mt-8 flex gap-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Link className={buttonVariants({ variant: "gradient" })} href="/signup">Get Started</Link>
              <Link className={buttonVariants({ variant: "outline" })} href="#how">See how it works</Link>
            </motion.div>
          </div>
          <div className="flex justify-center md:justify-end">
            <AccountCard />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-24">
        <motion.h2 className="text-3xl font-bold" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>How Creator Pay Works</motion.h2>
        <p className="mt-4 text-[color:var(--color-muted-foreground)]">Brief → Contract → Milestones → Delivery → Instant Payout.</p>
        <div className="mt-10 grid md:grid-cols-5 gap-4">
          {[
            ["Brief", "Share scope and budget"],
            ["Contract", "Lock scope and terms"],
            ["Milestones", "Split and approve work"],
            ["Delivery", "Upload and gate revisions"],
            ["Payout", "Instant rail-based payouts"],
          ].map(([title, desc], i) => (
            <motion.div key={title} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--grey-900)] p-5" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <div className="font-medium">{title}</div>
              <div className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">{desc}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}


