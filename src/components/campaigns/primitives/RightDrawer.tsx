"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { feyTokens } from "@/lib/fey-design-tokens";

interface RightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export function RightDrawer({
  isOpen,
  onClose,
  title,
  children,
  width = "480px",
}: RightDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full"
            style={{
              width,
              background: feyTokens.glass.panel.background,
              borderLeft: `1px solid ${feyTokens.borders.default}`,
              boxShadow: feyTokens.shadows.surface,
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: feyTokens.borders.default }}
            >
              <h2
                className="text-base font-semibold"
                style={{ color: feyTokens.colors.text.primary }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Content */}
            <div className="h-[calc(100%-73px)] overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

