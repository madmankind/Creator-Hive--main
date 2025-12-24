import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const handle = params.userId?.toLowerCase();
  const profile = await db.creatorProfile.findFirst({
    where: {
      OR: [
        { id: params.userId },
        { instagram: { equals: handle, mode: "insensitive" } },
      ],
    },
  });

  if (!profile) {
    return Response.json({ error: true, message: "Talent not found" }, { status: 404 });
  }

  return Response.json({
    profile: {
      name: profile.name,
      username: profile.instagram ?? profile.id,
      followers: null,
      engagementRate: null,
      avgEngagement: null,
      languages: [],
      location: profile.location,
      interests: profile.niches ?? [],
      brands: [],
      shortBio: profile.bio,
      niches: profile.niches,
    },
    availability: [],
    platforms: [],
    roleTags: profile.skills ?? [],
    meta: {
      source: "database",
    },
  });
}
