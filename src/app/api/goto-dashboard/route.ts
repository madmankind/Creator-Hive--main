import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * /api/goto-dashboard
 * Server-side redirect after booking confirmation.
 * Validates the session in the same request context and redirects.
 */
export async function GET() {
  const session = await auth();

  // Any authenticated user goes to the campaign dashboard
  if (session?.user) {
    return NextResponse.redirect(
      new URL("/dashboard/campaigns?mode=track", process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
      { status: 302 }
    );
  }

  // No session — send back to home
  return NextResponse.redirect(
    new URL("/?auth=required", process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
    { status: 302 }
  );
}
