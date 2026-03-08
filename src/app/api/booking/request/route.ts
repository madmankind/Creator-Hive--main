/**
 * API Route: /api/booking/request
 * Create and manage booking requests
 * Uses real Prisma schema: BookingRequest with talentIds[]
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const { companyName, email, phone, note, talentIds, brief } = body;

    if (!companyName || !email || !talentIds?.length) {
      return NextResponse.json({ error: "companyName, email, and talentIds are required" }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        userId: session.user.id,
        contactEmail: email,
        description: note ?? "",
        talentIds: talentIds,
        budgetRange: brief?.pricingTier ?? null,
        bookingType: "SHORT",
        status: "PENDING",
      },
    });

    return NextResponse.json({ bookingRequest }, { status: 201 });
  } catch (error) {
    console.error("[API] Create booking request error:", error);
    return NextResponse.json({ error: "Failed to create booking request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const bookingRequest = await prisma.bookingRequest.findUnique({ where: { id } });
      if (!bookingRequest) {
        return NextResponse.json({ error: "Booking request not found" }, { status: 404 });
      }
      return NextResponse.json({ bookingRequest });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingRequests = await prisma.bookingRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookingRequests });
  } catch (error) {
    console.error("[API] Get booking requests error:", error);
    return NextResponse.json({ error: "Failed to fetch booking requests" }, { status: 500 });
  }
}
