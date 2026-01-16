"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check } from "lucide-react";
import { signIn } from "next-auth/react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeyMeshLayer } from "@/components/campaigns/primitives/FeyMeshLayer";

type TalentOnboardingDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function TalentOnboardingDialogFey({ open, onClose, onSuccess }: TalentOnboardingDialogProps) {
  const [step, setStep] = useState<"email" | "check-inbox">("email");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setStep("email");
      setEmail("");
      setSubmitting(false);
      setError("");
    }
  }, [open]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setSubmitting(true);

    const result = await signIn("credentials", {
      redirect: false,
      email: email.trim(),
      userType: "talent",
      displayName: email.trim().split("@")[0],
    });

    if (result?.error) {
      setSubmitting(false);
      setError(result.error);
      return;
    }

    setSubmitting(false);
    setStep("check-inbox");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Spotlight background (Fey-style) */}
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="h-[50vh] w-[70vw] max-w-[800px] blur-3xl opacity-[0.08] rounded-full"
              style={{
                background: `radial-gradient(circle, ${feyTokens.colors.red.bloom} 0%, transparent 70%)`,
              }}
            />
          </div>

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <FeyMeshLayer variant="background" intensity="subtle" className="relative w-full max-w-md">
              <div
                className="relative w-full rounded-[22px] border p-8"
                style={{
                  background: `${feyTokens.colors.base.darker}EE`,
                  borderColor: feyTokens.borders.default,
                  backdropFilter: "blur(20px)",
                  boxShadow: feyTokens.shadows.modal,
                }}
              >
                {step === "email" && (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                      style={{ color: feyTokens.colors.text.muted }}
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                      <div className="text-center">
                        <h2
                          className="mb-2 text-2xl font-semibold"
                          style={{ color: feyTokens.colors.text.primary }}
                        >
                          Apply to join Creator Hive
                        </h2>
                        <p
                          className="text-sm"
                          style={{ color: feyTokens.colors.text.muted }}
                        >
                          Enter your email to get started
                        </p>
                      </div>

                      <div>
                        {/* Pill input (Fey-style) */}
                        <div
                          className="flex items-center gap-2 rounded-full border px-5 py-3.5 transition-all focus-within:border-white/20"
                          style={{
                            borderColor: error ? feyTokens.colors.status.error : feyTokens.borders.default,
                            background: feyTokens.glass.panel.background,
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setError("");
                            }}
                            placeholder="account email"
                            className="flex-1 bg-transparent outline-none text-sm"
                            style={{ color: feyTokens.colors.text.primary }}
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={submitting || !email.trim()}
                            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-50"
                            style={{
                              background: submitting
                                ? "transparent"
                                : email.trim()
                                  ? feyTokens.colors.red.glow
                                  : feyTokens.glass.panel.background,
                              color: "white",
                            }}
                          >
                            {submitting ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                              <ArrowRight className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {error && (
                          <p
                            className="mt-2 text-xs"
                            style={{ color: feyTokens.colors.status.error }}
                          >
                            {error}
                          </p>
                        )}
                      </div>

                      <div
                        className="text-center text-xs"
                        style={{ color: feyTokens.colors.text.label }}
                      >
                        By signing up, you agree to our{" "}
                        <a
                          href="#"
                          className="underline hover:no-underline"
                          style={{ color: feyTokens.colors.text.secondary }}
                        >
                          Terms of Service
                        </a>
                        .
                      </div>
                    </form>
                  </>
                )}

                {step === "check-inbox" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                  >
                    <div className="flex justify-center">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-full"
                        style={{
                          background: `${feyTokens.colors.status.success}20`,
                        }}
                      >
                        <Check
                          className="h-8 w-8"
                          style={{ color: feyTokens.colors.status.success }}
                        />
                      </div>
                    </div>
                    <div>
                      <h2
                        className="mb-2 text-2xl font-semibold"
                        style={{ color: feyTokens.colors.text.primary }}
                      >
                        Check your inbox
                      </h2>
                      <p
                        className="text-sm"
                        style={{ color: feyTokens.colors.text.secondary }}
                      >
                        We have sent you a secure login link. Please click the link to authenticate your account.
                      </p>
                    </div>
                    <div
                      className="rounded-lg border p-3"
                      style={{
                        borderColor: feyTokens.borders.default,
                        background: feyTokens.glass.panel.background,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm"
                          style={{ color: feyTokens.colors.text.primary }}
                        >
                          {email}
                        </span>
                        <Check
                          className="h-4 w-4"
                          style={{ color: feyTokens.colors.status.success }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-sm underline hover:no-underline"
                      style={{ color: feyTokens.colors.text.muted }}
                    >
                      Back to Signup
                    </button>
                  </motion.div>
                )}
              </div>
            </FeyMeshLayer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}







