import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { CreatorDashboardClient } from "./CreatorDashboardClient";

export default async function CreatorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/?signin=required");

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, role: true },
  }).catch(() => null);

  const profile = user
    ? await db.creatorProfile.findUnique({
        where: { userId: user.id },
        include: {
          portfolioItems: { orderBy: { position: "asc" } },
          opportunityPreference: true,
          invites: {
            include: { campaign: { select: { id: true, title: true, status: true, budget: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          invoices: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          contracts: {
            include: { milestones: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      }).catch(() => null)
    : null;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070B", color: "rgba(255,255,255,0.5)" }}>
          <span className="text-[13px]">Loading…</span>
        </div>
      }
    >
      <CreatorDashboardClient profile={profile as any} userId={user?.id ?? ""} />
    </Suspense>
  );
}
