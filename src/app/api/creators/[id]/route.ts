import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const creator = await db.creatorProfile.findUnique({
    where: { id },
    include: {
      portfolioItems: { orderBy: { position: "asc" } },
      opportunityPreference: true,
    },
  });

  if (!creator) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment profile views (fire-and-forget)
  db.creatorProfile.update({ where: { id }, data: { profileViews: { increment: 1 } } }).catch(() => {});

  return NextResponse.json({ creator });
}
