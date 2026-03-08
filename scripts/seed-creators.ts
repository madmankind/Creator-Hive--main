import { PrismaClient } from "@prisma/client";
import { curatedTalent } from "../src/lib/curatedTalent";

const prisma = new PrismaClient();

async function main() {
  let seeded = 0;
  let skipped = 0;

  for (const t of curatedTalent) {
    const instagram = t.instagramHandle?.replace(/^@/, "") || null;

    // Need a stable unique key — use instagram handle if present, else name
    const whereClause = instagram
      ? { instagram }
      : undefined;

    if (!whereClause) {
      console.warn(`Skipping ${t.name} — no instagram handle`);
      skipped++;
      continue;
    }

    await prisma.creatorProfile.upsert({
      where: whereClause,
      update: {
        name: t.name,
        bio: t.shortBio,
        skills: t.roleTags as string[],
        niches: t.interests ?? [],
        location: t.location ?? null,
        avatarUrl: t.profileImageUrl ?? t.avatarUrl ?? null,
        portfolioUrl: t.links?.website ?? t.links?.behance ?? null,
        isVerified: true,
        isActive: true,
      },
      create: {
        name: t.name,
        instagram,
        bio: t.shortBio,
        skills: t.roleTags as string[],
        niches: t.interests ?? [],
        location: t.location ?? null,
        avatarUrl: t.profileImageUrl ?? t.avatarUrl ?? null,
        portfolioUrl: t.links?.website ?? t.links?.behance ?? null,
        isVerified: true,
        isActive: true,
      },
    });
    seeded++;
  }

  console.log(`✅ Seeded ${seeded} creator profiles (skipped ${skipped})`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
