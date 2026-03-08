/**
 * API Route: /api/booking/pod
 * Create and retrieve talent pods
 */

import { NextRequest, NextResponse } from "next/server";
import { PodSchema } from "@/lib/schemas/booking";
import { prisma } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate
    const result = PodSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid pod data", details: result.error.issues }, { status: 400 });
    }

    // Create pod with items in transaction
    const pod = await prisma.$transaction(async (tx) => {
      const newPod = await tx.pod.create({
        data: {},
      });

      if (result.data.items.length > 0) {
        await tx.podItem.createMany({
          data: result.data.items.map((item) => ({
            podId: newPod.id,
            talentId: item.talentId,
          })),
        });
      }

      // Return pod with items
      const podWithItems = await tx.pod.findUnique({
        where: { id: newPod.id },
        include: {
          items: true,
        },
      });

      return podWithItems;
    });

    return NextResponse.json({ pod }, { status: 201 });
  } catch (error) {
    console.error("[API] Create pod error:", error);
    return NextResponse.json({ error: "Failed to create pod" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const pod = await prisma.pod.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });
      if (!pod) {
        return NextResponse.json({ error: "Pod not found" }, { status: 404 });
      }
      return NextResponse.json({ pod });
    }

    return NextResponse.json({ error: "Pod ID required" }, { status: 400 });
  } catch (error) {
    console.error("[API] Get pod error:", error);
    return NextResponse.json({ error: "Failed to fetch pod" }, { status: 500 });
  }
}
