import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/server/prisma";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return new NextResponse("Missing Stripe key", { status: 500 });
  const stripe = new Stripe(secret);

  const body = await req.text();
  const sig = (await headers()).get("stripe-signature")!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const e = err as Error;
    return new NextResponse(`Webhook Error: ${e.message}`, { status: 400 });
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await prisma.stripeAccount.updateMany({
      where: { accountId: account.id },
      data: { chargesEnabled: Boolean(account.charges_enabled), payoutsEnabled: Boolean(account.payouts_enabled) },
    });
  }
  return NextResponse.json({ received: true });
}

