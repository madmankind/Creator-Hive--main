import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const schema = z.object({
  availabilityStatus: z.enum(["AVAILABLE", "BUSY", "UNAVAILABLE"]),
});

export async function GET() {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const profile = await db.creatorProfile.findUnique({
    where: { userId: auth.user.id },
    select: { availabilityStatus: true },
  });
  return NextResponse.json({ availabilityStatus: profile?.availabilityStatus ?? "AVAILABLE" });
}

export async function PUT(req: Request) {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const { availabilityStatus } = schema.parse(await req.json());
  const profile = await db.creatorProfile.update({
    where: { userId: auth.user.id },
    data: { availabilityStatus },
    select: { availabilityStatus: true },
  });
  return NextResponse.json({ availabilityStatus: profile.availabilityStatus });
}
