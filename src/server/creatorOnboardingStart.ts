import { db } from "@/server/db";
import type { UserRole } from "@prisma/client";

/**
 * Ensures the user is a CREATOR with a starter creatorProfile row.
 * Same behaviour as POST /api/onboarding/creator/start (for use from Server Components).
 */
export async function ensureCreatorOnboardingStarted(
  userId: string,
  user: { email: string; name?: string | null; role: UserRole },
) {
  if (user.role !== "CREATOR") {
    await db.user.update({
      where: { id: userId },
      data: { role: "CREATOR" },
    });
  }

  await db.creatorProfile.upsert({
    where: { userId },
    update: {},
    create: {
      user: { connect: { id: userId } },
      name: user.name || user.email.split("@")[0] || "Creator",
      skills: [],
      niches: [],
      isActive: true,
    },
  });
}
