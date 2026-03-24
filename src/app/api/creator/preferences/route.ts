import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const schema = z.object({
  interestedRoles: z.array(z.string()).default([]),
  interestedNiches: z.array(z.string()).default([]),
  minRate: z.number().int().nullable().optional(),
  openToLongTerm: z.boolean().default(true),
  openToShortTerm: z.boolean().default(true),
  preferredBrands: z.array(z.string()).default([]),
});

export async function GET() {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const profile = await db.creatorProfile.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ preference: null });
  const preference = await db.creatorOpportunityPreference.findUnique({ where: { creatorProfileId: profile.id } });
  return NextResponse.json({ preference });
}

export async function PUT(req: Request) {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const data = schema.parse(await req.json());
  const profile = await db.creatorProfile.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  const preference = await db.creatorOpportunityPreference.upsert({
    where: { creatorProfileId: profile.id },
    update: data,
    create: { ...data, creatorProfileId: profile.id },
  });
  return NextResponse.json({ preference });
}
