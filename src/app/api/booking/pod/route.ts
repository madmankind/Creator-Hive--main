/**
 * API Route: /api/booking/pod
 * Stub — pod logic is now handled via talentIds[] on BookingRequest.
 * Kept for backward compat with any client calling this endpoint.
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Pod creation is no longer separate. Include talentIds in /api/booking/request." },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json({ pod: null, message: "Use /api/booking/request" });
}
