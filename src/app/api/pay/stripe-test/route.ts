import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";

export async function POST() {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const hasStripeConfig = Boolean(process.env.STRIPE_SECRET_KEY);
  if (!hasStripeConfig) {
    return NextResponse.json({ warning: "Stripe not configured; test mode only." }, { status: 400 });
  }

  // Stub checkout URL for test mode
  return NextResponse.json({ checkoutUrl: "https://example.com/stripe-test-checkout" });
}
