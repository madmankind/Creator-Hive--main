import { db } from "./db";

export async function getOrCreateAgency(user: { id: string; email: string; name?: string | null }) {
  const existing = await db.agencyAccount.findUnique({
    where: { userId: user.id },
  });
  if (existing) return existing;

  return db.agencyAccount.create({
    data: {
      userId: user.id,
      name: user.name || user.email.split("@")[0] || "Agency",
    },
  });
}
