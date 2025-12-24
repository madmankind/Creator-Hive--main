/**
 * Deterministic, idempotent seed for local/Supabase DB.
 *
 * Run with: pnpm db:seed
 */

import { PrismaClient, type UserRole } from "@prisma/client";

const prisma = new PrismaClient();

type SeedUser = {
  email: string;
  name: string;
  role: UserRole;
};

const AGENCY_USER: SeedUser = {
  email: "agency@creatorhive.test",
  name: "Seed Agency",
  role: "AGENCY",
};

const CREATOR_USER: SeedUser = {
  email: "creator@creatorhive.test",
  name: "Seed Creator",
  role: "CREATOR",
};

async function upsertUser(user: SeedUser) {
  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      role: user.role,
      name: user.name,
    },
    create: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}

async function main() {
  console.log("🌱 Seeding database...");

  const agencyUser = await upsertUser(AGENCY_USER);
  const creatorUser = await upsertUser(CREATOR_USER);

  const agency = await prisma.agencyAccount.upsert({
    where: { userId: agencyUser.id },
    update: {},
    create: {
      id: "seed-agency-1",
      userId: agencyUser.id,
      name: "Creator Hive Agency",
      website: "https://creatorhive.test",
      location: "Remote",
    },
  });

  const creatorProfile = await prisma.creatorProfile.upsert({
    where: { userId: creatorUser.id },
    update: {
      agencyId: agency.id,
      isActive: true,
    },
    create: {
      id: "seed-creator-1",
      userId: creatorUser.id,
      agencyId: agency.id,
      name: "Seed Creator",
      instagram: "seedcreator",
      bio: "Creates standout content for luxury and tech brands.",
      skills: ["Content Creator", "Videographer", "Editor"],
      niches: ["Tech", "Luxury"],
      location: "Dubai, UAE",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&auto=format&fit=crop",
      isVerified: true,
    },
  });

  const campaign = await prisma.campaign.upsert({
    where: { id: "seed-campaign-1" },
    update: {},
    create: {
      id: "seed-campaign-1",
      agencyId: agency.id,
      title: "Seed Launch Campaign",
      brief: "Launch campaign for Creator Hive seed data.",
      status: "ACTIVE",
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      budget: 500000, // cents ($5,000)
    },
  });

  await prisma.campaignTalent.upsert({
    where: { campaignId_talentId: { campaignId: campaign.id, talentId: creatorProfile.id } },
    update: {},
    create: {
      id: "seed-campaign-talent-1",
      campaignId: campaign.id,
      talentId: creatorProfile.id,
      status: "ASSIGNED",
      rate: 150000, // cents
      notes: "Primary creator for the launch campaign.",
    },
  });

  await prisma.podSelection.upsert({
    where: { userId: agencyUser.id },
    update: { talentIds: [creatorProfile.id] },
    create: {
      id: "seed-pod-1",
      userId: agencyUser.id,
      talentIds: [creatorProfile.id],
    },
  });

  await prisma.bookingRequest.upsert({
    where: { id: "seed-booking-1" },
    update: {},
    create: {
      id: "seed-booking-1",
      userId: agencyUser.id,
      agencyId: agency.id,
      bookingType: "SHORT",
      startDate: "ASAP",
      budgetRange: "$5,000 - $10,000",
      description: "Launch campaign brief seeded for QA.",
      contactEmail: agencyUser.email,
      talentIds: [creatorProfile.id],
      status: "PENDING",
    },
  });

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
