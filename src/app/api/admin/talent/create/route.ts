import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const body = await req.json().catch(() => null);
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const profile = await db.creatorProfile.create({
    data: {
      name: body.name.trim(),
      displayName: body.displayName?.trim() || null,
      instagram: body.instagram?.trim().replace(/^@/, "") || null,
      tiktok: body.tiktok?.trim().replace(/^@/, "") || null,
      youtube: body.youtube?.trim() || null,
      bio: body.bio?.trim() || null,
      location: body.location?.trim() || null,
      avatarUrl: body.avatarUrl?.trim() || null,
      portfolioUrl: body.portfolioUrl?.trim() || null,
      hourlyRate: body.hourlyRate ? parseInt(body.hourlyRate) : null,
      dayRate: body.dayRate ? parseInt(body.dayRate) : null,
      skills: Array.isArray(body.skills) ? body.skills.filter(Boolean) : [],
      niches: Array.isArray(body.niches) ? body.niches.filter(Boolean) : [],
      primaryRole: body.primaryRole?.trim() || null,
      prismArchetype: body.prismArchetype?.trim() || null,
      talentStatus: body.talentStatus || "pending",
      isActive: body.isActive ?? false,
      source: "admin",
    },
  });

  return NextResponse.json({ ok: true, profile });
}
