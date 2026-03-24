import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["AGENCY", "CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const pods = await db.podSelection.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const active = pods[0];
  return NextResponse.json({
    data: active ?? null,
  });
}

export async function PUT(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

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
