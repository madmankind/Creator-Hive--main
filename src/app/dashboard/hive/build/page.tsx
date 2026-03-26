import { auth } from "@/auth";
import { db } from "@/server/db";
import { BuildPageClient, type BuildProjectRow } from "./BuildPageClient";

export default async function HiveBuildPage() {
  const session = await auth();

  // Open to all — unauthenticated visitors see the public build showcase
  if (!session?.user?.email) {
    return <BuildPageClient projects={[]} />;
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return <BuildPageClient projects={[]} />;

  const agency = await db.agencyAccount.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  let rows: {
    id: string;
    title: string;
    mode: BuildProjectRow["mode"];
    productType: string;
    status: BuildProjectRow["status"];
    updatedAt: Date;
    latestUpdateAt: Date | null;
  }[] = [];

  try {
    rows = await db.creatorShopProject.findMany({
      where: {
        OR: [{ ownerUserId: user.id }, ...(agency ? [{ agencyId: agency.id }] : [])],
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        mode: true,
        productType: true,
        status: true,
        updatedAt: true,
        latestUpdateAt: true,
      },
    });
  } catch (e) {
    console.error("[HiveBuildPage] creatorShopProject query failed — run migrations / prisma generate:", e);
    rows = [];
  }

  const projects: BuildProjectRow[] = rows.map((p) => ({
    ...p,
    updatedAt: p.updatedAt.toISOString(),
    latestUpdateAt: p.latestUpdateAt?.toISOString() ?? null,
  }));

  return <BuildPageClient projects={projects} />;
}
