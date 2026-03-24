import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

export async function GET() {
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) {
    return new NextResponse("Not found", { status: 404 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const start = Date.now();
  const creators = await db.creatorProfile.findMany({
    where: { isActive: true },
    select: { id: true },
    take: 10,
  });
  const durationMs = Date.now() - start;

  return NextResponse.json({
    role: session.user.role ?? null,
    userId: session.user.id ?? null,
    count: creators.length,
    sampleIds: creators.map((c) => c.id),
    ms: durationMs,
  });
}
