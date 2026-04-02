import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { generateBookingOrderPdf } from "@/lib/pdf/booking-order-pdf";
import { sendBookingOrder } from "@/lib/email";
import { calcInvoiceTotals } from "@/lib/invoice";
import crypto from "crypto";

const BUCKET = "booking-orders";

async function uploadPdf(pdfBytes: Uint8Array, path: string): Promise<string | null> {
  try {
    const { createSupabaseServiceClient } = await import("@/lib/supabase");
    const supabase = createSupabaseServiceClient();
    await supabase.storage.from(BUCKET).upload(path, pdfBytes, {
      contentType: "application/pdf", upsert: true,
    });
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  let body: {
    bookingRequestId?: string;
    clientName?: string;
    clientEmail?: string;
    clientCompany?: string;
    packageLabel?: string;
    budgetAed?: number;
    paymentSchedule?: string;
    scope?: string[];
    campaignId?: string;
  } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { bookingRequestId, clientName, clientEmail, budgetAed } = body;
  if (!bookingRequestId || !clientName || !clientEmail || !budgetAed) {
    return NextResponse.json({ error: "bookingRequestId, clientName, clientEmail, budgetAed required" }, { status: 400 });
  }

  const agency = await getOrCreateAgency(user);

  // Derive invoice sequence for orderRef
  const today = new Date();
  const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const count = await (db as any).bookingOrder.count();
  const orderRef = `CH${ymd}${String(count + 1).padStart(3, "0")}`;

  const { vatAmount, total } = calcInvoiceTotals(budgetAed);
  const vatAed = Math.round(vatAmount);
  const totalAed = Math.round(total);

  const packageLabel = body.packageLabel ?? "Creative Campaign Package";
  const scope = body.scope ?? [
    "Creative strategy and campaign planning",
    "Talent coordination and brief delivery",
    "Content production oversight",
    "Delivery, reporting, and performance review",
  ];
  const paymentSchedule = body.paymentSchedule ?? "milestone_50_50";
  const scheduleLabel = paymentSchedule === "upfront_100"
    ? "100% advance payment due on order confirmation."
    : paymentSchedule === "monthly"
    ? "Monthly retainer — invoiced at the start of each month."
    : "50% advance on booking confirmation. Remaining 50% on delivery and approval.";

  // Generate PDF
  const pdfBytes = generateBookingOrderPdf({
    orderRef,
    issueDate: today,
    clientName,
    clientCompany: body.clientCompany,
    packageLabel,
    scope,
    budgetAed,
    vatAed,
    totalAed,
    paymentSchedule: scheduleLabel,
    advanceNote: paymentSchedule !== "upfront_100"
      ? `Contracted amount: AED ${budgetAed.toLocaleString()}. ${scheduleLabel}`
      : undefined,
  });

  // Upload to Supabase storage
  const pdfPath = `orders/${agency.id}/${orderRef}.pdf`;
  const pdfPublicUrl = await uploadPdf(pdfBytes, pdfPath);

  // Generate client action token (for approve/replace/cancel links)
  const clientActionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(today.getTime() + 48 * 60 * 60 * 1000);

  // Persist BookingOrder
  const bookingOrder = await (db as any).bookingOrder.create({
    data: {
      bookingRequestId,
      orderRef,
      campaignId: body.campaignId ?? null,
      clientName,
      clientEmail,
      clientCompany: body.clientCompany ?? null,
      packageLabel,
      budgetAed,
      vatAed,
      totalAed,
      paymentSchedule,
      scope,
      pdfStoragePath: pdfPath,
      pdfPublicUrl,
      status: "SENT",
      clientActionToken,
      expiresAt,
      sentAt: today,
    },
  });

  // Send email with PDF attached (non-blocking)
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://creatorhive.ae";
  void sendBookingOrder(clientEmail, {
    orderRef,
    clientName,
    packageLabel,
    totalAed,
    paymentSchedule: scheduleLabel,
    dashboardUrl: `${base}/dashboard`,
    pdfBytes,
  });

  return NextResponse.json({ ok: true, bookingOrder }, { status: 201 });
}

export async function GET(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const agency = await getOrCreateAgency(user);

  const orders = await (db as any).bookingOrder.findMany({
    where: { bookingRequest: { agencyId: agency.id } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ orders });
}
