/**
 * API Route: /api/booking/request
 * Create and manage booking requests
 */

import { NextRequest, NextResponse } from "next/server";
import { BookingRequestCreateSchema } from "@/lib/schemas/booking";
import { prisma } from "@/server/db";

import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    
    // Validate
    const result = BookingRequestCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request data", details: result.error.issues }, { status: 400 });
    }

    // Verify brief and pod exist
    const brief = await prisma.brief.findUnique({ where: { id: result.data.briefId } });
    const pod = await prisma.pod.findUnique({ where: { id: result.data.podId }, include: { items: true } });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }
    if (!pod || pod.items.length === 0) {
      return NextResponse.json({ error: "Pod not found or empty" }, { status: 404 });
    }

    // Create booking request
    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        briefId: result.data.briefId,
        podId: result.data.podId,
        companyName: result.data.companyName,
        contactEmail: result.data.contactEmail,
        contactPhone: result.data.contactPhone || null,
        requestNote: result.data.requestNote || null,
        userId: session?.user?.id || null,
        status: "SUBMITTED",
      },
      include: {
        brief: true,
        pod: {
          include: {
            items: true,
          },
        },
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
      const bookingRequest = await prisma.bookingRequest.findUnique({
        where: { id },
        include: {
          brief: true,
          pod: {
            include: {
              items: true,
            },
          },
        },
      });
      if (!bookingRequest) {
        return NextResponse.json({ error: "Booking request not found" }, { status: 404 });
      }
      return NextResponse.json({ bookingRequest });
    }

    // List user's booking requests
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingRequests = await prisma.bookingRequest.findMany({
      where: { userId: session.user.id },
      include: {
        brief: true,
        pod: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookingRequests });
  } catch (error) {
    console.error("[API] Get booking requests error:", error);
    return NextResponse.json({ error: "Failed to fetch booking requests" }, { status: 500 });
  }
}
