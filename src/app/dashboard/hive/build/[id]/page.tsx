import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { db } from "@/server/db";
import { CreatorShopDetailClient, type CreatorShopProjectDTO } from "./CreatorShopDetailClient";

export default async function CreatorShopProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/?signin=required");

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/?signin=required");

  const { id } = await params;

  const agency = await db.agencyAccount.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  const project = await db.creatorShopProject.findFirst({
    where: {
      id,
      OR: [{ ownerUserId: user.id }, ...(agency ? [{ agencyId: agency.id }] : [])],
    },
  });

  if (!project) notFound();

  const dto: CreatorShopProjectDTO = {
    id: project.id,
    mode: project.mode,
    productType: project.productType,
    title: project.title,
    status: project.status,
    briefPayload: project.briefPayload,
    budgetBand: project.budgetBand,
    desiredLaunchDate: project.desiredLaunchDate?.toISOString() ?? null,
    currentPlatform: project.currentPlatform,
    audienceContext: project.audienceContext,
    notes: project.notes,
    statusHistory: project.statusHistory,
    commercialModelNotes: project.commercialModelNotes,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };

  return <CreatorShopDetailClient project={dto} />;
}
