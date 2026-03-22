import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const patchSchema = z.object({
  displayName: z.string().max(120).nullable().optional(),
  name: z.string().min(1).max(120).optional(),
  location: z.string().max(200).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  skills: z.array(z.string().min(1)).max(40).optional(),
  niches: z.array(z.string().min(1)).max(40).optional(),
  availabilityStatus: z.enum(["AVAILABLE", "BUSY", "UNAVAILABLE"]).optional(),
  isActive: z.boolean().optional(),
  minRate: z.number().int().min(0).nullable().optional(),
  interestedRoles: z.array(z.string().min(1)).max(20).optional(),
  interestedNiches: z.array(z.string().min(1)).max(20).optional(),
});

/** Workspace talent settings backed by CreatorProfile + CreatorOpportunityPreference. */
export async function GET() {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const profile = await db.creatorProfile.findUnique({
    where: { userId: auth.user.id },
    include: { opportunityPreference: true },
  });
  if (!profile) return NextResponse.json({ profile: null, preference: null });
  const { opportunityPreference: preference, ...rest } = profile;
  return NextResponse.json({ profile: rest, preference });
}

export async function PATCH(req: Request) {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const profile = await db.creatorProfile.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });

  const p = parsed.data;
  const profileData: Record<string, unknown> = {};
  if (p.displayName !== undefined) profileData.displayName = p.displayName;
  if (p.name !== undefined) profileData.name = p.name;
  if (p.location !== undefined) profileData.location = p.location;
  if (p.bio !== undefined) profileData.bio = p.bio;
  if (p.skills !== undefined) profileData.skills = p.skills;
  if (p.niches !== undefined) profileData.niches = p.niches;
  if (p.availabilityStatus !== undefined) profileData.availabilityStatus = p.availabilityStatus;
  if (p.isActive !== undefined) profileData.isActive = p.isActive;

  const prefData: Record<string, unknown> = {};
  if (p.minRate !== undefined) prefData.minRate = p.minRate;
  if (p.interestedRoles !== undefined) prefData.interestedRoles = p.interestedRoles;
  if (p.interestedNiches !== undefined) prefData.interestedNiches = p.interestedNiches;

  if (Object.keys(profileData).length === 0 && Object.keys(prefData).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const updated = await db.$transaction(async (tx) => {
    if (Object.keys(profileData).length > 0) {
      await tx.creatorProfile.update({
        where: { id: profile.id },
        data: profileData as object,
      });
    }

    if (Object.keys(prefData).length > 0) {
      await tx.creatorOpportunityPreference.upsert({
        where: { creatorProfileId: profile.id },
        update: prefData as object,
        create: {
          creatorProfileId: profile.id,
          interestedRoles: (prefData.interestedRoles as string[] | undefined) ?? [],
          interestedNiches: (prefData.interestedNiches as string[] | undefined) ?? [],
          minRate: (prefData.minRate as number | null | undefined) ?? null,
          openToLongTerm: true,
          openToShortTerm: true,
          preferredBrands: [],
        },
      });
    }

    return tx.creatorProfile.findUnique({
      where: { id: profile.id },
      include: { opportunityPreference: true },
    });
  });

  return NextResponse.json({ profile: updated });
}
