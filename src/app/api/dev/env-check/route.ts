import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET() {
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) {
    return new NextResponse("Not found", { status: 404 });
  }

  let dbConnects = false;
  let dbError: string | undefined;

  try {
    await db.$queryRaw`SELECT 1`;
    dbConnects = true;
  } catch (error) {
    dbConnects = false;
    dbError = error instanceof Error ? error.message : "Unknown database error";
  }

  const databaseUrl = process.env.DATABASE_URL;
  const hasDatabaseUrl =
    typeof databaseUrl === "string" &&
    databaseUrl.length > 0 &&
    !databaseUrl.includes("placeholder") &&
    databaseUrl !== "postgresql://placeholder:placeholder@localhost:5432/placeholder";

  const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL || null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    hasDatabaseUrl,
    hasNextAuthSecret: Boolean(authSecret),
    nextAuthUrl,
    hasSupabaseUrl: Boolean(supabaseUrl),
    hasSupabaseAnonKey: Boolean(supabaseAnonKey),
    hasSupabaseServiceRoleKey: Boolean(supabaseServiceKey),
    dbConnects,
    ...(dbError ? { dbError } : {}),
  });
}
