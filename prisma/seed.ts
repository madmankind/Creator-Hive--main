/**
 * Prisma Seed Script
 * 
 * Run with: pnpm db:seed
 * 
 * This file seeds the database with initial data for development.
 * Add your seed data here.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Example: Create a test agency
  // const agency = await prisma.agencyAccount.create({
  //   data: {
  //     userId: 'test-user-id',
  //     name: 'Test Agency',
  //   },
  // })

  // Example: Create test creators
  // const creator = await prisma.creatorProfile.create({
  //   data: {
  //     name: 'Test Creator',
  //     skills: ['Influencer', 'Content Creator'],
  //     hourlyRate: 5000, // $50.00 in cents
  //   },
  // })

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

