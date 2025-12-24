import { NextResponse } from "next/server";
import { db } from "@/server/db";
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

  return NextResponse.json({ data: booking }, { status: 201 });
}
