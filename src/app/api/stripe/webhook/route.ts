import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe: any = require("stripe");
import { db } from "@/server/db";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecret) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}
if (!webhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET");
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2024-11-20.acacia" as any,
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await handleEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}

async function upsertLedger(opts: {
  userId: string;
  creatorProfileId?: string | null;
  agencyAccountId?: string | null;
  campaignId?: string | null;
  type: "PAYMENT_INTENT" | "TRANSFER" | "PAYOUT" | "REFUND" | "ADJUSTMENT";
  direction: "CREDIT" | "DEBIT";
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  stripeObjectType: string;
  stripeObjectId: string;
  metadata?: unknown;
}) {
  await (db as any).walletTransaction.upsert({
    where: { stripeObjectId: opts.stripeObjectId },
    update: {
      userId: opts.userId,
      creatorProfileId: opts.creatorProfileId ?? null,
      agencyAccountId: opts.agencyAccountId ?? null,
      campaignId: opts.campaignId ?? null,
      type: opts.type,
      direction: opts.direction,
      amount: opts.amount,
      currency: opts.currency,
      status: opts.status,
      stripeObjectType: opts.stripeObjectType,
      metadata: opts.metadata as any,
    },
    create: {
      userId: opts.userId,
      creatorProfileId: opts.creatorProfileId ?? null,
      agencyAccountId: opts.agencyAccountId ?? null,
      campaignId: opts.campaignId ?? null,
      type: opts.type,
      direction: opts.direction,
      amount: opts.amount,
      currency: opts.currency,
      status: opts.status,
      stripeObjectType: opts.stripeObjectType,
      stripeObjectId: opts.stripeObjectId,
      metadata: opts.metadata as any,
    },
  });
}

async function handleEvent(event: any) {
  switch (event.type) {
    case "account.updated": {
      const account = event.data.object as any;
      const status =
        account.details_submitted && account.charges_enabled && account.payouts_enabled
          ? "COMPLETE"
          : "PENDING";
      if (account.id) {
        await db.creatorProfile.updateMany({
          where: { stripeAccountId: account.id } as any,
          data: { stripeOnboardingStatus: status as any } as any,
        });
      }
      break;
    }
    case "payment_intent.succeeded": {
      const pi = event.data.object as any;
      await upsertLedger({
        userId: pi.metadata?.userId || "unknown",
        creatorProfileId: pi.metadata?.creatorProfileId || null,
        agencyAccountId: pi.metadata?.agencyAccountId || null,
        campaignId: pi.metadata?.campaignId || null,
        type: "PAYMENT_INTENT",
        direction: "CREDIT",
        amount: pi.amount_received,
        currency: pi.currency.toUpperCase(),
        status: "SUCCEEDED",
        stripeObjectType: "payment_intent",
        stripeObjectId: pi.id,
        metadata: { eventId: event.id },
      });
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object as any;
      await upsertLedger({
        userId: pi.metadata?.userId || "unknown",
        creatorProfileId: pi.metadata?.creatorProfileId || null,
        agencyAccountId: pi.metadata?.agencyAccountId || null,
        campaignId: pi.metadata?.campaignId || null,
        type: "PAYMENT_INTENT",
        direction: "CREDIT",
        amount: pi.amount || pi.amount_received || 0,
        currency: pi.currency?.toUpperCase?.() || "USD",
        status: "FAILED",
        stripeObjectType: "payment_intent",
        stripeObjectId: pi.id,
        metadata: { eventId: event.id },
      });
      break;
    }
    case "payout.paid": {
      const payout = event.data.object as any;
      await upsertLedger({
        userId: payout.metadata?.userId || "unknown",
        creatorProfileId: payout.metadata?.creatorProfileId || null,
        agencyAccountId: payout.metadata?.agencyAccountId || null,
        campaignId: payout.metadata?.campaignId || null,
        type: "PAYOUT",
        direction: "DEBIT",
        amount: payout.amount,
        currency: payout.currency.toUpperCase(),
        status: "SUCCEEDED",
        stripeObjectType: "payout",
        stripeObjectId: payout.id,
        metadata: { eventId: event.id },
      });
      break;
    }
    case "transfer.created": {
      const transfer = event.data.object as any;
      await upsertLedger({
        userId: transfer.metadata?.userId || "unknown",
        creatorProfileId: transfer.metadata?.creatorProfileId || null,
        agencyAccountId: transfer.metadata?.agencyAccountId || null,
        campaignId: transfer.metadata?.campaignId || null,
        type: "TRANSFER",
        direction: "DEBIT",
        amount: transfer.amount,
        currency: transfer.currency.toUpperCase(),
        status: "PENDING",
        stripeObjectType: "transfer",
        stripeObjectId: transfer.id,
        metadata: { eventId: event.id },
      });
      break;
    }
    default:
      break;
  }
}
