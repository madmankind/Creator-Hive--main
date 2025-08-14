"use client";
import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./card";
import { formatCurrency } from "@/lib/utils";

export function AccountCard() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" });
  const controls = useAnimation();
  const [value, setValue] = useState(0);
  const target = 6012;
  const delta = 2550;

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } });
      // Count up
      const durationMs = 1200;
      const startTime = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / durationMs);
        setValue(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, [inView, controls]);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={controls}>
      <Card className="w-full max-w-sm overflow-hidden">
        <CardContent>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">Total Earnings</div>
          <div className="mt-2 text-4xl font-semibold">
            {formatCurrency(value)}
          </div>
          <div className="mt-3 text-sm text-[color:var(--success)]">+{formatCurrency(delta)} <span className="text-[color:var(--color-muted-foreground)]">(Project: Campaign Shoot)</span></div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


