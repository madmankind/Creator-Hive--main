"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const STATS = [
  { value: "48h", label: "Avg. booking time" },
  { value: "1,000+", label: "Vetted creators" },
  { value: "UAE & Global", label: "Coverage" },
];

export function JoinClient() {
  const router = useRouter();
  const [hovering, setHovering] = useState(false);

  const handleApply = () => {
    router.push("/talent/signup?ref=instagram&type=brand");
  };

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: "#07070B", color: "#fff" }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(800px 600px at 50% 20%, rgba(124,92,255,0.18) 0%, transparent 65%), radial-gradient(600px 400px at 80% 70%, rgba(0,220,255,0.06) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full max-w-[440px] mx-auto text-center space-y-10">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-[0.12em] uppercase"
            style={{
              background: "rgba(124,92,255,0.12)",
              border: "1px solid rgba(124,92,255,0.28)",
              color: "rgba(167,139,250,0.9)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "rgba(124,92,255,0.9)" }}
            />
            Applications open
          </span>
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <h1
            className="text-[42px] sm:text-[52px] font-light tracking-[-0.04em] leading-[1.0]"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Creator Hive
          </h1>
          <p
            className="text-[16px] font-light leading-relaxed max-w-[340px] mx-auto"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Book world-class creative talent for your next campaign.
            Vetted. Fast. On demand.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center gap-8"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p
                className="text-[18px] font-medium tracking-[-0.02em]"
                style={{ color: "rgba(255,255,255,0.88)" }}
              >
                {s.value}
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.10em] mt-0.5"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ height: "1px", background: "rgba(255,255,255,0.06)" }}
        />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-4"
        >
          <p
            className="text-[13px]"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            For brands, agencies, and founders ready to book top-tier talent.
          </p>
          <motion.button
            onClick={handleApply}
            onHoverStart={() => setHovering(true)}
            onHoverEnd={() => setHovering(false)}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-2xl text-[15px] font-medium flex items-center justify-center gap-2.5 transition-all duration-200"
            style={{
              background: hovering
                ? "rgba(255,255,255,1)"
                : "rgba(255,255,255,0.92)",
              color: "#07070B",
              boxShadow: hovering
                ? "0 0 40px rgba(124,92,255,0.25), 0 4px 20px rgba(0,0,0,0.4)"
                : "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            Book talent now
            <ArrowRight size={16} />
          </motion.button>
          <p
            className="text-[11px]"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Creator? <a href="/talent/signup" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>Apply to join the talent roster →</a>
          </p>
        </motion.div>

      </div>
    </div>
  );
}
