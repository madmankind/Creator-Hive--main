import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function POST() {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  // Ensure role is CREATOR
  if (user.role !== "CREATOR") {
    await db.user.update({
      where: { id: user.id },
      data: { role: "CREATOR" },
    });
  }

  await db.creatorProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      name: user.name || user.email.split("@")[0] || "Creator",
      skills: [],
      niches: [],
      isActive: true,
    },
  });

  return NextResponse.json({ ok: true });
}
