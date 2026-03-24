import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const schema = z.object({
  platform: z.enum(["instagram", "tiktok", "youtube"]),
  handle: z.string().min(1),
});

export async function POST(req: Request) {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const { platform, handle } = schema.parse(await req.json());

  const updateData: Record<string, unknown> = {};
  if (platform === "instagram") { updateData.instagram = handle; updateData.instagramVerified = true; }
  if (platform === "tiktok") { updateData.tiktok = handle; updateData.tiktokVerified = true; }
  if (platform === "youtube") { updateData.youtube = handle; }

  const profile = await db.creatorProfile.update({
    where: { userId: auth.user.id },
    data: updateData,
    select: { instagram: true, tiktok: true, youtube: true, instagramVerified: true, tiktokVerified: true },
  });

  return NextResponse.json({ profile });
}
