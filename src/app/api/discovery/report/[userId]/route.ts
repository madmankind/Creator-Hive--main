import { curatedTalent } from "@/lib/curatedTalent";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  const handle = params.userId?.toLowerCase();
  const talent = curatedTalent.find(
    (entry) => entry.id === params.userId || entry.instagramHandle.toLowerCase() === handle,
  );

  if (!talent) {
    return Response.json({ error: true, message: "Talent not found" }, { status: 404 });
  }

  return Response.json({
    profile: {
      name: talent.name,
      username: talent.instagramHandle,
      followers: talent.followers,
      engagementRate: talent.engagementRate,
      avgEngagement: talent.avgEngagement,
      languages: talent.languages,
      location: talent.location,
      interests: talent.interests,
      brands: talent.brandPartners,
      shortBio: talent.shortBio,
      niches: talent.nicheSummary,
    },
    availability: talent.availability,
    platforms: talent.platformTags,
    roleTags: talent.roleTags,
    meta: {
      source: "curated",
    },
  });
}
