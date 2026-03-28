import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { ensureCreatorOnboardingStarted } from "@/server/creatorOnboardingStart";

export async function POST() {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  await ensureCreatorOnboardingStarted(user.id, user);

  return NextResponse.json({ ok: true });
}
