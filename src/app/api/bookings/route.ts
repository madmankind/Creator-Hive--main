import { NextResponse } from "next/server";
import { getOrCreateAgency } from "@/server/agency";
import { requireUser } from "@/server/authz";

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
  } = {};

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!payload.campaignDescription || !payload.email) {
    return NextResponse.json({ error: "Description and contact email are required" }, { status: 400 });
  }

  // Check if we're in dev mode with placeholder database
  const isDev = process.env.NODE_ENV !== "production";
  const databaseUrl = process.env.DATABASE_URL || "";
  const isPlaceholderUrl = databaseUrl.includes("placeholder") || 
                           databaseUrl.includes("user:password") ||
                           (databaseUrl.includes("@localhost:5432") && (databaseUrl.includes("user") || databaseUrl.includes("password")));

  // In dev mode with placeholder URL, return mock booking
  if (isDev && (!databaseUrl || isPlaceholderUrl)) {
    console.log("📝 [Dev Mode] Booking request (mock - no database):", {
      userId: user.id,
      agencyId: agency?.id,
      bookingType: payload.bookingType,
      startDate: payload.startDate,
      budgetRange: payload.budgetRange,
      description: payload.campaignDescription,
      contactEmail: payload.email,
      talentIds: payload.talentIds,
    });

    const mockBooking = {
      id: `mock-booking-${Date.now()}`,
      userId: user.id,
      agencyId: agency?.id || null,
      bookingType: payload.bookingType === "long" ? "LONG" : "SHORT",
      startDate: payload.startDate || null,
      budgetRange: payload.budgetRange || null,
      description: payload.campaignDescription,
      contactEmail: payload.email,
      talentIds: payload.talentIds ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ data: mockBooking }, { status: 201 });
  }

  // Otherwise, try to save to database
  try {
    const { db } = await import("@/server/db");
    const { getOrCreateAgency } = await import("@/server/agency");
    const { ensureCuratedCreatorProfile } = await import("@/server/curated");

    // Create PROVISIONAL campaign when talent is selected
    let campaignId: string | null = null;
    if (payload.talentIds && payload.talentIds.length > 0) {
      const agencyAccount = await getOrCreateAgency(user);
      const talentIds = payload.talentIds;
      const creators = await Promise.all(
        talentIds.map(async (talentId) => {
          return ensureCuratedCreatorProfile(talentId);
        })
      );

      const campaign = await db.campaign.create({
        data: {
          title: payload.campaignDescription.substring(0, 100) || "New Campaign",
          brief: payload.campaignDescription,
          agencyId: agencyAccount.id,
          status: "PROVISIONAL",
          budget: payload.budgetRange
            ? parseInt(payload.budgetRange.replace(/\D/g, "")) || undefined
            : undefined,
          startDate: payload.startDate ? new Date(payload.startDate) : undefined,
          talents: {
            create: creators.map((creator) => ({
              talentId: creator.id,
              status: "ASSIGNED",
            })),
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
      },
    });

    return NextResponse.json(
      { data: { ...booking, campaignId } },
      { status: 201 }
    );
  } catch (error) {
    // If database write fails in dev, still return success with mock booking
    if (isDev) {
      console.warn("⚠️ [Dev Mode] Booking database write failed (continuing anyway):", error);
      const mockBooking = {
        id: `mock-booking-${Date.now()}`,
        userId: user.id,
        agencyId: agency?.id || null,
        bookingType: payload.bookingType === "long" ? "LONG" : "SHORT",
        startDate: payload.startDate || null,
        budgetRange: payload.budgetRange || null,
        description: payload.campaignDescription,
        contactEmail: payload.email,
        talentIds: payload.talentIds ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return NextResponse.json({ data: mockBooking }, { status: 201 });
    }
    throw error;
  }
}
