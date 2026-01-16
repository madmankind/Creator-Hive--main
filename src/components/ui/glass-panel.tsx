"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  blur?: boolean;
}

export function GlassPanel({ children, className, blur = true }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[#0F141A]/95 border border-white/10",
        blur && "backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}












<<<<<<< Current (Your changes)

=======
>>>>>>> Incoming (Background Agent changes)
