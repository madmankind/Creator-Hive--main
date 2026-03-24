import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { buildInvoiceData, generateInvoiceNumber, CH_ISSUER } from "@/lib/invoice";
import { sendPaymentInstructions } from "@/lib/email";

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const body = await req.json().catch(() => ({}));
  const {
    campaignId, amount, description, clientName, clientAddress,
    clientTRN, advanceNote, daysUntilDue = 0, sendEmail = true,
  } = body;

  if (!amount || !description || !clientName) {
    return NextResponse.json({ error: "amount, description, clientName required" }, { status: 400 });
  }

  // Generate sequential invoice number
  const count = await db.invoice.count();
  const invoiceNumber = generateInvoiceNumber(count + 1);

  const invoiceData = buildInvoiceData({
    invoiceNumber,
    clientName,
    clientAddress: clientAddress || "United Arab Emirates",
    clientTRN,
    description,
    amount: Number(amount),
    advanceNote,
    daysUntilDue,
  });

  // Find or create a placeholder talent profile for the invoice FK
  // (Invoice schema requires talentId — we use the agency owner's profile as issuer)
  let talentId: string | null = null;
  try {
    const profile = await db.creatorProfile.findFirst({ where: { userId: user.id } });
    talentId = profile?.id ?? null;
    if (!talentId) {
      // Create minimal issuer profile
      const newProfile = await db.creatorProfile.create({
        data: { userId: user.id, name: user.name || "Creator Hive", instagram: "" },
      });
      talentId = newProfile.id;
    }
  } catch { /* non-fatal */ }

  if (!talentId) {
    return NextResponse.json({ error: "Could not resolve issuer profile" }, { status: 500 });
  }

  const invoice = await db.invoice.create({
    data: {
      invoiceNumber,
      campaignId: campaignId || null,
      talentId,
      amount: Math.round(invoiceData.untaxedAmount * 100), // store in fils
      currency: "AED",
      status: "SENT",
      dueDate: daysUntilDue === 0 ? new Date() : new Date(Date.now() + daysUntilDue * 86400000),
      notes: [description, advanceNote].filter(Boolean).join("\n"),
    },
  });

  // Send payment instructions email
  if (sendEmail && user.email) {
    void sendPaymentInstructions(user.email, {
      invoiceNumber,
      amount: invoiceData.untaxedAmount,
      vatAmount: invoiceData.vatAmount,
      total: invoiceData.total,
      clientName,
      method: "bank_transfer",
    });
  }

  return NextResponse.json({ ok: true, invoice, invoiceData });
}
