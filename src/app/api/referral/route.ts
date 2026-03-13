import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

function generateCode(userId: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HIVE-";
  const seed = userId.slice(-6);
  for (let i = 0; i < 6; i++) {
    code += chars[seed.charCodeAt(i % seed.length) % chars.length];
  }
  return code;
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  // Ensure creator profile has a referral code
  let profile = await db.creatorProfile.findUnique({
    where: { userId: auth.user.id },
    select: { id: true, referralCode: true },
  });

  if (profile && !profile.referralCode) {
    profile = await db.creatorProfile.update({
      where: { userId: auth.user.id },
      data: { referralCode: generateCode(auth.user.id) },
      select: { id: true, referralCode: true },
    });
  }

  const referrals = await db.referral.findMany({
    where: { referrerId: auth.user.id },
    orderBy: { createdAt: "desc" },
  });

  const totalReward = referrals.filter(r => r.status === "REWARDED").reduce((s, r) => s + r.rewardAmount, 0);

  return NextResponse.json({
    referralCode: profile?.referralCode ?? null,
    referrals,
    totalReward,
    shareUrl: `${process.env.NEXTAUTH_URL ?? "https://creatorhive.app"}/?ref=${profile?.referralCode}`,
  });
}

const inviteSchema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { email } = inviteSchema.parse(await req.json());

  const profile = await db.creatorProfile.findUnique({
    where: { userId: auth.user.id },
    select: { referralCode: true },
  });

  const code = profile?.referralCode ?? generateCode(auth.user.id);

  const existing = await db.referral.findFirst({ where: { referrerId: auth.user.id, referredEmail: email } });
  if (existing) return NextResponse.json({ referral: existing });

  const referral = await db.referral.create({
    data: { referrerId: auth.user.id, referredEmail: email, code, status: "PENDING" },
  });

  return NextResponse.json({ referral }, { status: 201 });
}
