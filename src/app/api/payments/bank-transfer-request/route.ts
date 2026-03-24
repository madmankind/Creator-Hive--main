import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { sendPaymentInstructions } from "@/lib/email";
import { buildInvoiceData, generateInvoiceNumber, calcInvoiceTotals, CH_ISSUER } from "@/lib/invoice";
import { db } from "@/server/db";

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const body = await req.json().catch(() => ({}));
  const { amount, description, clientName, clientAddress, clientTRN, campaignId } = body;

  if (!amount || !description) {
    return NextResponse.json({ error: "amount and description required" }, { status: 400 });
  }

  const count = await db.invoice.count();
  const invoiceNumber = generateInvoiceNumber(count + 1);
  const { untaxedAmount, vatAmount, total } = calcInvoiceTotals(Number(amount));

  // Send payment instructions email
  const email = user.email || body.email;
  if (email) {
    void sendPaymentInstructions(email, {
      invoiceNumber,
      amount: untaxedAmount,
      vatAmount,
      total,
      clientName: clientName || user.name || "Client",
      method: "bank_transfer",
    });
  }

  return NextResponse.json({
    ok: true,
    invoiceNumber,
    paymentRef: invoiceNumber,
    bankDetails: {
      accountName: CH_ISSUER.accountName,
      bankName: CH_ISSUER.bankName,
      accountNumber: CH_ISSUER.accountNumber,
      swiftCode: CH_ISSUER.swiftCode,
      iban: CH_ISSUER.iban,
    },
    amounts: { untaxedAmount, vatAmount, total },
    message: `Payment instructions sent to ${email}. Reference: ${invoiceNumber}`,
  });
}
