"use client";
import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  as?: "div" | "section" | "article" | "span";
};

export function Reveal({ children, className = "", variants = defaultVariants }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}


