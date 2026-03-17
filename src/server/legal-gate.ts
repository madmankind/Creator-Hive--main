/**
 * Server-side legal acceptance gate.
 * Redirects authenticated users without legalAcceptedAt to /legal/accept.
 */

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";

/** Redirect to /legal/accept if user has session but has not accepted legal docs. */
export async function ensureLegalAccepted(returnTo: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.email) return;

  const isDev = process.env.NODE_ENV !== "production";
  const databaseUrl = process.env.DATABASE_URL || "";
  const isPlaceholderUrl =
    databaseUrl.includes("placeholder") ||
    databaseUrl.includes("user:password") ||
    (databaseUrl.includes("@localhost:5432") &&
      (databaseUrl.includes("user") || databaseUrl.includes("password")));

  if (isDev && (!databaseUrl || isPlaceholderUrl)) {
    return;
  }

  try {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { legalAcceptedAt: true },
    });
    if (user?.legalAcceptedAt) return;
  } catch {
    return;
  }

  const url = `/legal/accept?returnTo=${encodeURIComponent(returnTo)}`;
  redirect(url);
}
