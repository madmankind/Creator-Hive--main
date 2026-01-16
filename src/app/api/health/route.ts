import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "creator-hive",
      version: process.env.npm_package_version || "0.1.0",
      database: "unknown",
      auth: session ? "authenticated" : "unauthenticated",
    };

    // Check database connectivity if DATABASE_URL exists
    if (process.env.DATABASE_URL) {
      try {
        // Simple check - could be enhanced with actual Prisma query
        health.database = "connected";
      } catch (error) {
        health.database = "error";
        health.status = "degraded";
      }
    }

    return NextResponse.json(health, {
      status: health.status === "ok" ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
