/**
 * scripts/seed-applicants.ts
 * Upserts all curatedTalent entries as CreatorProfile rows with talentStatus: "pending".
 * Run with: npx tsx scripts/seed-applicants.ts
 *
 * Prerequisites: Supabase project must be running (unpause at supabase.com if needed).
 */

import { PrismaClient } from "@prisma/client";
import { curatedTalent } from "../src/lib/curatedTalent";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${curatedTalent.length} talent applicants…`);

  let created = 0;
  let updated = 0;

  for (const t of curatedTalent) {
    const instagram = t.instagramHandle
      ? `https://instagram.com/${t.instagramHandle}`
      : null;

    const result = await prisma.creatorProfile.upsert({
      where: { id: t.id },
      create: {
        id: t.id,
        name: t.name,
        displayName: t.name,
        bio: t.bio ?? null,
        instagram: instagram,
        avatarUrl: t.profileImageUrl ?? t.avatarUrl ?? null,
        skills: t.roleTags ?? [],
        niches: t.platformTags ?? [],
        location: t.location ?? null,
        talentStatus: "pending",
        source: "form",
        isActive: false,
        isVerified: false,
      },
      update: {
        name: t.name,
        displayName: t.name,
        bio: t.bio ?? null,
        instagram: instagram,
        avatarUrl: t.profileImageUrl ?? t.avatarUrl ?? null,
        skills: t.roleTags ?? [],
        niches: t.platformTags ?? [],
        location: t.location ?? null,
        source: "form",
      },
    });

    if (result) {
      // Check if it was a create or update by checking createdAt vs updatedAt
      const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
      if (isNew) created++;
      else updated++;
    }
  }

  console.log(`Done. Created: ${created}, Updated: ${updated}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
