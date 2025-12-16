import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pods = await db.podSelection.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { updatedAt: "desc" },
  });

  const active = pods[0];
  return NextResponse.json({
    data: active ?? null,
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let payload: { talentIds?: string[] } = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const talentIds = payload.talentIds ?? [];

  const pod = await db.podSelection.upsert({
    where: { userId: user.id },
    update: { talentIds },
    create: {
      userId: user.id,
      talentIds,
    },
  });

  return NextResponse.json({ data: pod });
}
