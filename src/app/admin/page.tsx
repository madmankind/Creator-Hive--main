import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";
import AdminTalentClient from "./AdminTalentClient";

export default async function AdminPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const creators = await db.creatorProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      displayName: true,
      instagram: true,
      location: true,
      skills: true,
      qualityScore: true,
      talentStatus: true,
      source: true,
      isVerified: true,
      isActive: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
    },
  });

  return <AdminTalentClient creators={creators} />;
}
