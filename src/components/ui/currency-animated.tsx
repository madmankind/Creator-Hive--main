"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { formatCurrency } from "@/lib/podPricing";

interface CurrencyAnimatedProps {
  value: number;
  className?: string;
}

export function CurrencyAnimated({ value, className }: CurrencyAnimatedProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 50,
    damping: 30,
  });
  const display = useTransform(spring, (latest) => formatCurrency(Math.round(latest)));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span className={["tabular-nums", className].filter(Boolean).join(" ")}>{display}</motion.span>;
}

