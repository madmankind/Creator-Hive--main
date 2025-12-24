import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2024-11-20.acacia" as any,
});

export async function GET() {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const profile: any = await db.creatorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile?.stripeAccountId) {
    return NextResponse.json({ status: "NOT_STARTED", accountId: null });
  }

  const account = await stripe.accounts.retrieve(profile.stripeAccountId);
  const submitted = account.details_submitted && account.charges_enabled && account.payouts_enabled;
  const status = submitted ? "COMPLETE" : "PENDING";

  if (profile.stripeOnboardingStatus !== status) {
    await db.creatorProfile.update({
      where: { id: profile.id },
      data: { stripeOnboardingStatus: status as any } as any,
    });
  }

  return NextResponse.json({ status, accountId: profile.stripeAccountId });
}
