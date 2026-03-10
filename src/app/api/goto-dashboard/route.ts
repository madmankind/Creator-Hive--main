import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";

/**
 * /api/goto-dashboard
 * Server-side redirect after booking confirmation.
 * Supports ?mode=manage|track|pay|discover
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  const mode = new URL(req.url).searchParams.get("mode") || "manage";

  if (session?.user) {
    return NextResponse.redirect(
      new URL(`/dashboard/campaigns?mode=${mode}`, process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
      { status: 302 }
    );
  }

  return NextResponse.redirect(
    new URL("/?auth=required", process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
    { status: 302 }
  );
}
