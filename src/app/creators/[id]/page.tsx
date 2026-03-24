import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { CreatorPublicProfile } from "./CreatorPublicProfile";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = await db.creatorProfile.findUnique({ where: { id }, select: { name: true, bio: true } });
  if (!creator) return { title: "Creator not found" };
  return { title: `${creator.name} — Creator Hive`, description: creator.bio?.slice(0, 160) };
}

export default async function CreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = await db.creatorProfile.findUnique({
    where: { id, isActive: true },
    include: {
      portfolioItems: { orderBy: { position: "asc" } },
      opportunityPreference: true,
    },
  });
  if (!creator) notFound();

  // Fire-and-forget view increment
  db.creatorProfile.update({ where: { id }, data: { profileViews: { increment: 1 } } }).catch(() => {});

  return <CreatorPublicProfile creator={creator as any} />;
}
