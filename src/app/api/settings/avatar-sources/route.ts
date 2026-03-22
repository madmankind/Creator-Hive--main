import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

/** Connected sources for "Use … photo" in account avatar picker. */
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const userId = auth.user.id;

  const [accounts, creator] = await Promise.all([
    db.account.findMany({ where: { userId }, select: { provider: true } }),
    db.creatorProfile.findUnique({
      where: { userId },
      select: { avatarUrl: true, instagram: true, tiktok: true },
    }),
  ]);

  const providers = new Set(accounts.map((a) => a.provider));

  const googleAvailable = providers.has("google");
  const googleImageUrl = googleAvailable && auth.user.image ? auth.user.image : null;

  const instagramHandle = creator?.instagram?.trim();
  const instagramAvailable = Boolean(instagramHandle && creator?.avatarUrl);
  const instagramImageUrl = instagramAvailable ? creator!.avatarUrl : null;

  const tiktokHandle = creator?.tiktok?.trim();
  const tiktokImageUrl: string | null = null;

  return NextResponse.json({
    google: { available: googleAvailable, imageUrl: googleImageUrl },
    instagram: { available: instagramAvailable, imageUrl: instagramImageUrl, handle: instagramHandle ?? null },
    tiktok: { available: Boolean(tiktokHandle) && Boolean(tiktokImageUrl), imageUrl: tiktokImageUrl, handle: tiktokHandle ?? null },
  });
}
