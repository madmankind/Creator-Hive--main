"use client";
import { motion } from "framer-motion";

export function Process() {
  const items = [
    ["Brief", "Share scope and budget"],
    ["Contract", "Lock scope and terms"],
    ["Milestones", "Split and approve work"],
    ["Delivery", "Upload and gate revisions"],
    ["Payout", "Instant, net-based payouts"],
  ];
  return (
    <section id="process" className="container py-24">
      <motion.h2 className="text-3xl font-bold" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>How Creator Hive Works</motion.h2>
      <p className="mt-4 text-[color:var(--color-muted-foreground)]">Discover → Book → Execute → Track.</p>
      <div className="mt-10 grid md:grid-cols-5 gap-4">
        {items.map(([title, desc], i) => (
          <motion.div key={title as string} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--grey-900)] p-5 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(102,123,255,0.15)] transition" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <div className="font-medium">{title}</div>
            <div className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">{desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


