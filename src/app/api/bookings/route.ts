import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";
import { requireUser } from "@/server/authz";
import { sendBookingConfirmation, sendAdminBookingAlert } from "@/lib/email";

// GET — return booking history for logged-in user
export async function GET() {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN", "CREATOR"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const bookings = await db.bookingRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ bookings });
}

// POST — create booking, campaign, fire confirmation emails
export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const agency = user.role === "AGENCY" ? await getOrCreateAgency(user) : null;

  let payload: {
    bookingType?: "short" | "long";
    startDate?: string;
    campaignDescription?: string;
    budgetRange?: string;
    email?: string;
    talentIds?: string[];
    packageId?: string;
    clientName?: string;
    clientCompany?: string;
  } = {};

  try { payload = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.campaignDescription || !payload.email) {
    return NextResponse.json({ error: "Description and contact email required" }, { status: 400 });
  }

  try {
    const { ensureCuratedCreatorProfile } = await import("@/server/curated");

    // Create campaign
    let campaignId: string | null = null;
    if (payload.talentIds && payload.talentIds.length > 0) {
      const agencyAccount = await getOrCreateAgency(user);
      const creators = await Promise.all(
        payload.talentIds.map((id) => ensureCuratedCreatorProfile(id))
      );
      const campaign = await db.campaign.create({
        data: {
          title: payload.campaignDescription.substring(0, 100),
          brief: payload.campaignDescription,
          agencyId: agencyAccount.id,
          status: "PROVISIONAL",
          budget: payload.budgetRange
            ? parseInt(payload.budgetRange.replace(/\D/g, "")) || undefined
            : undefined,
          startDate: payload.startDate ? new Date(payload.startDate) : undefined,
          talents: {
            create: creators.map((c) => ({ talentId: c.id, status: "ASSIGNED" })),
          },
        },
      });
      campaignId = campaign.id;
    }

    const booking = await db.bookingRequest.create({
      data: {
        userId: user.id,
        agencyId: agency?.id,
        bookingType: payload.bookingType === "long" ? "LONG" : "SHORT",
        startDate: payload.startDate,
        budgetRange: payload.budgetRange,
        description: payload.campaignDescription,
        contactEmail: payload.email,
        talentIds: payload.talentIds ?? [],
        status: "PENDING",
      },
    });

    // Fire emails non-blocking
    void Promise.allSettled([
      sendBookingConfirmation(payload.email, {
        bookingId: booking.id,
        description: payload.campaignDescription,
        budgetRange: payload.budgetRange,
        clientName: payload.clientName || user.name || payload.email?.split("@")[0] || "Client",
      }),
      sendAdminBookingAlert({
        bookingId: booking.id,
        description: payload.campaignDescription,
        email: payload.email,
        clientName: payload.clientName || user.name || undefined,
        budgetRange: payload.budgetRange,
        talentCount: (payload.talentIds ?? []).length,
        packageId: payload.packageId,
      }),
    ]);

    return NextResponse.json({
      data: {
        ...booking,
        campaignId,
        bookingOrder: {
          orderRef: booking.id.substring(0, 12).toUpperCase(),
          status: "PENDING",
          description: payload.campaignDescription,
          budgetRange: payload.budgetRange,
          startDate: payload.startDate,
          bookingType: payload.bookingType,
          talentCount: (payload.talentIds ?? []).length,
          talentIds: payload.talentIds ?? [],
          submittedAt: booking.createdAt,
          nextStep: "Our team will review your brief and confirm availability within 48 hours.",
        },
      }
    }, { status: 201 });

  } catch (error) {
    console.error("[bookings] Error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
