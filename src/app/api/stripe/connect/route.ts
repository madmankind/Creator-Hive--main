import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/server/prisma";

export async function POST(req: NextRequest) {
  const { userId, refreshUrl, returnUrl } = await req.json();
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { stripe: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Stripe key missing" }, { status: 500 });
  const stripe = new Stripe(secret);

  let accountId = user.stripe?.accountId;
  if (!accountId) {
    const acct = await stripe.accounts.create({ type: "express", country: "AE", capabilities: { transfers: { requested: true } } });
    await prisma.stripeAccount.create({ data: { userId: user.id, accountId: acct.id } });
    accountId = acct.id;
  }

  const link = await stripe.accountLinks.create({ account: accountId!, refresh_url: refreshUrl, return_url: returnUrl, type: "account_onboarding" });
  return NextResponse.json({ url: link.url });
}

