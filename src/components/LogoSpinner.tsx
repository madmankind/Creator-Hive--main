"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

export function LogoSpinner({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{
              scale: [0.95, 1.05, 0.95],
              opacity: 1,
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.55),_transparent_65%)] blur-xl" />
            <Image
              src="/brand/ch-icon.svg"
              alt="Creator Hive"
              width={50}
              height={56}
              className="relative rounded-2xl shadow-lg"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

