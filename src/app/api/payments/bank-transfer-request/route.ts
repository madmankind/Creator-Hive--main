import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { sendPaymentInstructions } from "@/lib/email";
import { buildInvoiceData, generateInvoiceNumber, calcInvoiceTotals, CH_ISSUER } from "@/lib/invoice";
import { db } from "@/server/db";

async function resolveIssuerTalentId(user: { id: string; name?: string | null }) {
  const profile = await db.creatorProfile.findFirst({ where: { userId: user.id } });
  if (profile?.id) return profile.id;
  const created = await db.creatorProfile.create({
    data: { userId: user.id, name: user.name || "Creator Hive", instagram: "" },
  });
  return created.id;
}

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
  const invoiceData = buildInvoiceData({
    invoiceNumber,
    clientName: clientName || user.name || "Client",
    clientAddress: clientAddress || "United Arab Emirates",
    clientTRN,
    description: String(description),
    amount: Number(amount),
  });
  const { untaxedAmount, vatAmount, total } = invoiceData;
  const talentId = await resolveIssuerTalentId(user);

  await db.invoice.create({
    data: {
      invoiceNumber,
      campaignId: campaignId || null,
      talentId,
      amount: Math.round(untaxedAmount * 100),
      currency: "AED",
      status: "SENT",
      dueDate: new Date(),
      notes: description,
    },
  });

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
