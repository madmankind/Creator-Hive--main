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
            animate={{ scale: [0.95, 1.05, 0.95], opacity: 1 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            {/* Ambient glow */}
            <div className="absolute -inset-8 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(124,58,237,0.40) 0%, transparent 70%)", filter: "blur(20px)" }} />
            {/* Logo circle container */}
            <div className="relative flex items-center justify-center rounded-full"
              style={{ width: 64, height: 64, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <Image
                src="/logo-mark.png"
                alt="Creator Hive"
                width={38}
                height={38}
                className="object-contain"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
