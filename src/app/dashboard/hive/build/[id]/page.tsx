import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { CreatorShopDetailClient, type CreatorShopProjectDTO } from "./CreatorShopDetailClient";

export default async function CreatorShopProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await db.creatorShopProject.findUnique({ where: { id } });

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
