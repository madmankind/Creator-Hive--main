import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const updateSchema = z.object({
  title: z.string().optional(),
  caption: z.string().optional(),
  position: z.number().int().optional(),
  externalLink: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const profile = await db.creatorProfile.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  const existing = await db.portfolioItem.findFirst({ where: { id, creatorProfileId: profile.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = updateSchema.parse(await req.json());
  const item = await db.portfolioItem.update({ where: { id }, data });
  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const profile = await db.creatorProfile.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  const existing = await db.portfolioItem.findFirst({ where: { id, creatorProfileId: profile.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.portfolioItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
