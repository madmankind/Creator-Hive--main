import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  // Clients who signed up but never made a booking
  const bookedIds = (await db.bookingRequest.findMany({ select: { userId: true } })).map(b => b.userId);
  const waitlist = await db.user.findMany({
    where: { role: "AGENCY", id: { notIn: bookedIds.length ? bookedIds : ["none"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, createdAt: true,
      agencyAccount: { select: { name: true } },
      discoveryBrief: { select: { status: true, primaryObjective: true, createdAt: true } },
    },
  });
  return NextResponse.json({ waitlist, count: waitlist.length });
}
