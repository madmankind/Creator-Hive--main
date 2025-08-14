"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

export default function ForCreatorsPage() {
  return (
    <main>
      <section className="container py-20">
        <motion.h1 initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5}} className="text-4xl md:text-5xl font-extrabold text-gradient">Tools creators actually need.</motion.h1>
        <p className="mt-4 text-[color:var(--color-muted-foreground)]">Discover → Book → Execute → Track.</p>
        <div className="mt-8">
          <Link href="/signup" className={buttonVariants({variant:"gradient"})}>Get Started</Link>
        </div>
      </section>
      <section className="container grid md:grid-cols-3 gap-6 pb-20">
        {[
          ["Instant Payouts","Local rails across the GCC"],
          ["Scope & Contracts","Change-order gates, no scope creep"],
          ["Compliance & VAT","Stay on top of permits and thresholds"],
        ].map(([t,d])=> (
          <div key={t} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--grey-900)] p-6">
            <div className="font-medium">{t}</div>
            <div className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">{d}</div>
          </div>
        ))}
      </section>
    </main>
  );
}


