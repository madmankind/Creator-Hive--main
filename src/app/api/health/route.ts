import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; message?: string }> = {};

  // Check AUTH_SECRET
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  checks.authSecret = authSecret
    ? { status: "ok" }
    : { status: "error", message: "AUTH_SECRET is not set" };

  // Check DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  const isDatabaseConfigured =
    databaseUrl &&
    !databaseUrl.includes("placeholder") &&
    databaseUrl !== "postgresql://placeholder:placeholder@localhost:5432/placeholder";

  checks.databaseUrl = isDatabaseConfigured
    ? { status: "ok" }
    : { status: "error", message: "DATABASE_URL is not properly configured (using placeholder)" };

  // Test database connection if configured
  if (isDatabaseConfigured) {
    try {
      await db.$connect();
      await db.$queryRaw`SELECT 1`;
      checks.databaseConnection = { status: "ok" };
    } catch (error) {
      checks.databaseConnection = {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown database error",
      };
    } finally {
      await db.$disconnect();
    }
  } else {
    checks.databaseConnection = {
      status: "ok",
      message: "Skipped (database not configured - using mock auth)",
    };
  }

  const allOk = Object.values(checks).every((check) => check.status === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 }
  );
}

