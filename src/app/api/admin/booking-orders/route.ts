import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const orders = await db.bookingOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      bookingRequest: {
        select: { description: true, budgetRange: true, contactEmail: true,
          user: { select: { name: true, email: true } } }
      },
    },
  });
  return NextResponse.json({ orders });
}
