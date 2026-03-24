import { NextResponse } from "next/server";

export async function GET() {
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const databaseUrl = process.env.DATABASE_URL;
  
  return NextResponse.json({
    authSecret: authSecret ? "✅ Set" : "❌ Missing",
    databaseUrl: databaseUrl ? (databaseUrl.includes("placeholder") ? "⚠️ Placeholder" : "✅ Configured") : "❌ Missing",
    authUrl: process.env.AUTH_URL || "Not set",
    nodeEnv: process.env.NODE_ENV,
  });
}

