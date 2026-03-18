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
  const { searchParams, origin } = new URL(req.url);
  const mode = searchParams.get("mode") || "manage";

  if (session?.user) {
    return NextResponse.redirect(
      new URL(`/dashboard/campaigns?mode=${mode}`, origin),
      { status: 302 }
    );
  }

  return NextResponse.redirect(
    new URL("/?auth=required", origin),
    { status: 302 }
  );
}
