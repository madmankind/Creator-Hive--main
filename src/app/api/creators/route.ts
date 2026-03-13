import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const availability = searchParams.get("availability");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = { isActive: true };
  if (availability) where.availabilityStatus = availability;
  if (role) where.skills = { has: role };

  const [creators, total] = await Promise.all([
    db.creatorProfile.findMany({
      where,
      include: { portfolioItems: { take: 4, orderBy: { position: "asc" } } },
      take: limit,
      skip: offset,
      orderBy: { profileViews: "desc" },
    }),
    db.creatorProfile.count({ where }),
  ]);

  return NextResponse.json({ creators, total });
}
