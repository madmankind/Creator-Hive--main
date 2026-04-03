/**
 * AI feature rate limiting — backed by Supabase via Prisma.
 *
 * Limits per feature per calendar day (UTC):
 *   - Authed users:      keyed by userId
 *   - Unauthenticated:   keyed by hashed IP (anon users on landing page)
 *
 * Limits (configurable below):
 *   ai_search:   5 searches/day  for authed users, 3/day for anon
 *   ai_analyze:  10 queries/day  for authed users, 0 for anon
 */

import { db } from "@/server/db";
import { createHash } from "crypto";

export type AiFeature = "ai_search" | "ai_analyze" | "talent_onboarding";

const DAILY_LIMITS: Record<AiFeature, { authed: number; anon: number }> = {
  ai_search:          { authed: 30, anon: 5 },
  ai_analyze:         { authed: 20, anon: 0 },
  talent_onboarding: { authed: 45, anon: 0 },
};

function utcDay(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip + "ch_salt_2026").digest("hex").slice(0, 32);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: string; // ISO date of next reset (next UTC midnight)
}

/**
 * Check and increment usage. Returns whether the request is allowed.
 * Call this at the top of your API route before any LLM calls.
 */
export async function checkRateLimit(
  feature: AiFeature,
  opts: { userId?: string | null; ip?: string | null }
): Promise<RateLimitResult> {
  const day = utcDay();
  const { userId, ip } = opts;
  const isAuthed = !!userId;
  const limit = DAILY_LIMITS[feature][isAuthed ? "authed" : "anon"];
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  const resetAt = tomorrow.toISOString();

  // Anon with no IP tracking — block if anon limit is 0
  if (!isAuthed && limit === 0) {
    return { allowed: false, remaining: 0, limit, resetAt };
  }

  const ipKey = !isAuthed && ip ? hashIp(ip) : null;

  try {
    // Upsert: create row if first use today, otherwise increment
    if (isAuthed && userId) {
      const row = await db.aiUsage.upsert({
        where: { userId_feature_day: { userId, feature, day } },
        create: { userId, feature, day, count: 1 },
        update: { count: { increment: 1 } },
      });
      const remaining = Math.max(0, limit - row.count);
      return { allowed: row.count <= limit, remaining, limit, resetAt };
    } else if (ipKey) {
      const row = await db.aiUsage.upsert({
        where: { ipKey_feature_day: { ipKey, feature, day } },
        create: { ipKey, feature, day, count: 1 },
        update: { count: { increment: 1 } },
      });
      const remaining = Math.max(0, limit - row.count);
      return { allowed: row.count <= limit, remaining, limit, resetAt };
    }
  } catch (err) {
    // DB failure — fail open (allow the request) to avoid blocking users on infra issues
    console.error("[rateLimit] DB error, failing open:", err);
    return { allowed: true, remaining: 1, limit, resetAt };
  }

  // No userId and no IP — fail open
  return { allowed: true, remaining: 1, limit, resetAt };
}
