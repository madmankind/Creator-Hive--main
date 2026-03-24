import { db } from "./db";
import { curatedTalent } from "@/lib/curatedTalent";

export async function ensureCuratedCreatorProfile(talentId: string) {
  const existing = await db.creatorProfile.findUnique({ where: { id: talentId } });
  if (existing) return existing;

  const curated = curatedTalent.find((talent) => talent.id === talentId);
  if (!curated) {
    return db.creatorProfile.create({
      data: {
        id: talentId,
        name: "Creator Hive Talent",
        skills: [],
        niches: [],
      },
    });
  }

  return db.creatorProfile.create({
    data: {
      id: curated.id,
      name: curated.name,
      instagram: curated.instagramHandle,
      bio: curated.shortBio,
      skills: curated.roleTags,
      niches: curated.platformTags,
      location: curated.location,
      avatarUrl: curated.avatarUrl,
      hourlyRate: null,
      dayRate: null,
    },
  });
}
