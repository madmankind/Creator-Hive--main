/**
 * API Route: /api/booking/brief
 * Create and retrieve brief-lite forms
 */

import { NextRequest, NextResponse } from "next/server";
import { BriefLiteSchema } from "@/lib/schemas/booking";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate
    const result = BriefLiteSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid brief data", details: result.error.issues }, { status: 400 });
    }

    // TODO: Save to database once Prisma models are updated
    // For now, return mock response
    const brief = {
      id: `brief_${Date.now()}`,
      ...result.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ brief }, { status: 201 });
  } catch (error) {
    console.error("[API] Create brief error:", error);
    return NextResponse.json({ error: "Failed to create brief" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // TODO: Fetch from database once Prisma models are updated
    return NextResponse.json({ briefs: [] });
  } catch (error) {
    console.error("[API] Get briefs error:", error);
    return NextResponse.json({ error: "Failed to fetch briefs" }, { status: 500 });
  }
}
