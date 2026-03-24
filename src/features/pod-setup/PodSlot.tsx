"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PodSlotProps {
  isEmpty: boolean;
  children?: React.ReactNode;
}

export function PodSlot({ isEmpty, children }: PodSlotProps) {
  if (!isEmpty && children) {
    return <>{children}</>;
  }

  return (
    <motion.div
      animate={{
        opacity: [0.3, 0.5, 0.3],
        scale: [0.95, 1, 0.95],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        "w-[300px] h-[200px] rounded-2xl",
        "border-2 border-dashed border-white/5",
        "bg-gradient-to-br from-white/2 to-transparent",
        "backdrop-blur-sm",
        "flex items-center justify-center",
        "relative overflow-hidden"
      )}
    >
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
        backgroundSize: "16px 16px"
      }} />
      
      <div className="text-center relative z-10">
        <div className="text-[9px] text-white/15 uppercase tracking-widest mb-2 font-bold">
          Empty Slot
        </div>
        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-white/10 mx-auto flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg border border-white/5" />
        </div>
      </div>
    </motion.div>
  );
}

