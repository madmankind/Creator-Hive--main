import { NextResponse } from "next/server";

export async function POST() {
  const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);
  if (!hasStripe) {
    return NextResponse.json(
      { warning: "Stripe not configured. Enable STRIPE_SECRET_KEY to proceed." },
      { status: 400 }
    );
  }

  // Stub checkout URL for now.
  const checkoutUrl = "https://example.com/stripe-test-checkout";
  return NextResponse.json({ ok: true, checkoutUrl });
}
