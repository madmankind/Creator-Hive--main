"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GroupDividerCardProps = {
  groupKey: string;
  description: string;
};

export function GroupDividerCard({ groupKey, description }: GroupDividerCardProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col justify-center items-start rounded-2xl",
        "bg-white/5 px-5 py-4 ring-1 ring-white/10",
        "w-[360px] min-h-[240px] flex-shrink-0"
      )}
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-white/90">
          {groupKey}
        </h3>
        <p className="text-xs text-white/60 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
