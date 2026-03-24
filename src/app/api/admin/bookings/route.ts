import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET(req: Request) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as "PENDING" | "REVIEWING" | "CONFIRMED" | null;

  const bookings = await db.bookingRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      agency: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ bookings });
}
