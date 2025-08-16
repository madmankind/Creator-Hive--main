"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { AccountCard } from "@/app/(marketing)/page.client";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center noise-bg overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grain" />
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
            Create with the best. Get paid without friction.
          </motion.h1>
          <motion.p className="mt-6 text-lg text-[color:var(--color-muted-foreground)]" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Hire top creators fast. Contracts, milestones, and payouts—handled.
          </motion.p>
          <div className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">Discover → Book → Execute → Track.</div>
          <motion.div className="mt-8 flex gap-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Link className={buttonVariants({ variant: "gradient" })} href="/signup">Get Started</Link>
            <Link className={buttonVariants({ variant: "outline" })} href="#process">See how it works</Link>
          </motion.div>
        </div>
        <div className="flex justify-center md:justify-end">
          <AccountCard />
        </div>
      </div>
    </section>
  );
}


