"use client";

import { useState, useEffect } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "./primitives/FeySurface";
import { CreditCard, Building2, Apple } from "lucide-react";

interface PaymentMethodsPanelProps {
  invoiceId?: string;
  amount: number;
  onMethodSelect?: (method: "bank" | "stripe" | "apple") => void;
}

export function PaymentMethodsPanel({ invoiceId, amount, onMethodSelect }: PaymentMethodsPanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<"bank" | "stripe" | "apple" | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);

  // Check if Stripe is configured (graceful degradation)
  useEffect(() => {
    fetch("/api/stripe/check-config")
      .then((res) => res.json())
      .then((data) => setStripeConfigured(data?.configured || false))
      .catch(() => setStripeConfigured(false));
  }, []);

  const handleMethodClick = (method: "bank" | "stripe" | "apple") => {
    setSelectedMethod(method);
    onMethodSelect?.(method);
  };

  return (
    <FeySurface variant="panel" mesh={true} padding="md" className="w-full">
      <div
        className="mb-4 text-xs font-semibold uppercase tracking-wider"
        style={{ color: feyTokens.colors.text.label }}
      >
        Payment Methods
      </div>

      <div className="space-y-2">
        {/* Bank Transfer */}
        <button
          onClick={() => handleMethodClick("bank")}
          className="flex w-full items-center justify-between rounded-lg border p-3 transition-all hover:border-white/10"
          style={{
            borderColor: selectedMethod === "bank" ? feyTokens.borders.active : feyTokens.borders.default,
            background: selectedMethod === "bank" ? feyTokens.glass.panel.background : "transparent",
          }}
        >
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5" style={{ color: feyTokens.colors.text.secondary }} />
            <div className="text-left">
              <div
                className="text-xs font-medium"
                style={{ color: feyTokens.colors.text.primary }}
              >
                Bank Transfer
              </div>
              <div
                className="text-[10px]"
                style={{ color: feyTokens.colors.text.muted }}
              >
                Manual reconciliation
              </div>
            </div>
          </div>
        </button>

        {/* Stripe */}
        <button
          onClick={() => stripeConfigured && handleMethodClick("stripe")}
          disabled={!stripeConfigured}
          className="flex w-full items-center justify-between rounded-lg border p-3 transition-all hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: selectedMethod === "stripe" ? feyTokens.borders.active : feyTokens.borders.default,
            background: selectedMethod === "stripe" ? feyTokens.glass.panel.background : "transparent",
          }}
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5" style={{ color: feyTokens.colors.text.secondary }} />
            <div className="text-left">
              <div
                className="text-xs font-medium"
                style={{ color: feyTokens.colors.text.primary }}
              >
                Stripe Payment Link
              </div>
              <div
                className="text-[10px]"
                style={{ color: feyTokens.colors.text.muted }}
              >
                {stripeConfigured ? "Card payments" : "Connect Stripe to enable"}
              </div>
            </div>
          </div>
        </button>

        {/* Apple Pay */}
        <button
          onClick={() => stripeConfigured && handleMethodClick("apple")}
          disabled={!stripeConfigured}
          className="flex w-full items-center justify-between rounded-lg border p-3 transition-all hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: selectedMethod === "apple" ? feyTokens.borders.active : feyTokens.borders.default,
            background: selectedMethod === "apple" ? feyTokens.glass.panel.background : "transparent",
          }}
        >
          <div className="flex items-center gap-3">
            <Apple className="h-5 w-5" style={{ color: feyTokens.colors.text.secondary }} />
            <div className="text-left">
              <div
                className="text-xs font-medium"
                style={{ color: feyTokens.colors.text.primary }}
              >
                Apple Pay
              </div>
              <div
                className="text-[10px]"
                style={{ color: feyTokens.colors.text.muted }}
              >
                {stripeConfigured ? "Via Stripe" : "Requires Stripe"}
              </div>
            </div>
          </div>
        </button>
      </div>

      {!stripeConfigured && (
        <div className="mt-4 rounded-lg border p-3" style={{ borderColor: feyTokens.borders.default }}>
          <div
            className="mb-2 text-xs font-medium"
            style={{ color: feyTokens.colors.text.secondary }}
          >
            Connect Stripe to enable payment links
          </div>
          <button
            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10"
            style={{
              borderColor: feyTokens.colors.red.glow,
              color: feyTokens.colors.red.glow,
            }}
          >
            Connect Stripe
          </button>
        </div>
      )}
    </FeySurface>
  );
}

