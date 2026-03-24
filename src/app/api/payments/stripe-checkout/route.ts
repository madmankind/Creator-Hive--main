import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { calcInvoiceTotals, generateInvoiceNumber } from "@/lib/invoice";
import { sendPaymentInstructions } from "@/lib/email";
import { db } from "@/server/db";

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const { amount, description, clientName, campaignId, successUrl, cancelUrl } = body;

  if (!amount || !description) {
    return NextResponse.json({ error: "amount and description required" }, { status: 400 });
  }

  const count = await db.invoice.count();
  const invoiceNumber = generateInvoiceNumber(count + 1);
  const { total } = calcInvoiceTotals(Number(amount));
  const totalFils = Math.round(total * 100); // Stripe uses smallest currency unit

  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://creatorhive.ae";

  // Create Stripe checkout session
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" as never });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "aed",
        unit_amount: totalFils,
        product_data: {
          name: description.substring(0, 100),
          description: `Invoice ${invoiceNumber} — Creator Hive FZE`,
        },
      },
    }],
    metadata: { invoiceNumber, campaignId: campaignId || "", userId: user.id },
    success_url: successUrl || `${appUrl}/dashboard/campaigns?mode=pay&payment=success&inv=${invoiceNumber}`,
    cancel_url: cancelUrl || `${appUrl}/dashboard/campaigns?mode=pay&payment=cancelled`,
    customer_email: user.email || undefined,
  });

  // Send email with Stripe link
  const email = user.email || body.email;
  if (email) {
    void sendPaymentInstructions(email, {
      invoiceNumber,
      amount: Number(amount),
      vatAmount: calcInvoiceTotals(Number(amount)).vatAmount,
      total,
      clientName: clientName || user.name || "Client",
      method: "stripe",
      stripeUrl: session.url || undefined,
    });
  }

  return NextResponse.json({ ok: true, checkoutUrl: session.url, invoiceNumber });
}
