import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { sendPaymentInstructions } from "@/lib/email";
import { generateInvoiceNumber, calcInvoiceTotals } from "@/lib/invoice";
import { CH_ISSUER } from "@/lib/invoice";

// POST /api/bookings/confirm
// Admin-only: confirms a booking, emails client with payment instructions
export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const body = await req.json().catch(() => ({}));
  const { bookingId, amount, notes } = body;

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  }

  const booking = await db.bookingRequest.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Update status to CONFIRMED
  const updated = await db.bookingRequest.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  });

  // Generate invoice number
  const count = await db.invoice.count();
  const invoiceNumber = generateInvoiceNumber(count + 1);
  const confirmedAmount = amount || 0;

  // Send payment instructions email to client
  if (booking.contactEmail && confirmedAmount > 0) {
    const { untaxedAmount, vatAmount, total } = calcInvoiceTotals(confirmedAmount);
    void sendPaymentInstructions(booking.contactEmail, {
      invoiceNumber,
      amount: untaxedAmount,
      vatAmount,
      total,
      clientName: booking.contactEmail.split("@")[0],
      method: "bank_transfer",
    });
  }

  return NextResponse.json({
    ok: true,
    booking: updated,
    invoiceNumber,
    message: `Booking ${bookingId} confirmed. Payment instructions sent to ${booking.contactEmail}.`,
  });
}
