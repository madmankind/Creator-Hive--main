import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

function getStripe() {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(stripeSecret, {
    apiVersion: "2024-11-20.acacia" as any,
  });
}

export async function POST() {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    return NextResponse.json({ error: "Missing APP_URL" }, { status: 500 });
  }

  const stripe = getStripe();

  const profile: any = await db.creatorProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  let accountId = profile?.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
    });
    accountId = account.id;
    await db.creatorProfile.update({
      where: { id: profile.id },
      data: { stripeAccountId: account.id, stripeOnboardingStatus: "PENDING" } as any,
    });
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard/payouts?status=refresh`,
    return_url: `${appUrl}/dashboard/payouts?status=return`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url, accountId });
}
