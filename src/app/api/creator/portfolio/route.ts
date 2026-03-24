import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const itemSchema = z.object({
  title: z.string().optional(),
  caption: z.string().optional(),
  mediaUrl: z.string().url(),
  mediaType: z.enum(["image", "video"]).default("image"),
  thumbnailUrl: z.string().url().optional(),
  externalLink: z.string().url().optional(),
  platform: z.string().optional(),
  position: z.number().int().default(0),
});

export async function GET() {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const profile = await db.creatorProfile.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ items: [] });
  const items = await db.portfolioItem.findMany({
    where: { creatorProfileId: profile.id },
    orderBy: { position: "asc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const data = itemSchema.parse(body);
  const profile = await db.creatorProfile.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  const item = await db.portfolioItem.create({ data: { ...data, creatorProfileId: profile.id } });
  return NextResponse.json({ item }, { status: 201 });
}
