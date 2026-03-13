import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const schema = z.object({
  platform: z.enum(["instagram", "tiktok"]),
  handle: z.string().min(1),
});

export async function POST(req: Request) {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const { platform, handle } = schema.parse(await req.json());

  // In production this would call Instagram/TikTok API to fetch bio, avatar, follower count
  // For now we store the handle and mark as verified — real integration is a separate task
  const updateData: Record<string, unknown> = {};
  if (platform === "instagram") {
    updateData.instagram = handle;
    updateData.instagramVerified = true;
    // Placeholder: set bio hint if empty
    const existing = await db.creatorProfile.findUnique({ where: { userId: auth.user.id }, select: { bio: true } });
    if (!existing?.bio) {
      updateData.bio = `Content creator on Instagram (@${handle.replace("@", "")})`;
    }
  } else {
    updateData.tiktok = handle;
    updateData.tiktokVerified = true;
  }

  const profile = await db.creatorProfile.update({
    where: { userId: auth.user.id },
    data: updateData,
    select: { id: true, name: true, instagram: true, tiktok: true, bio: true },
  });

  return NextResponse.json({ profile, imported: true });
}
