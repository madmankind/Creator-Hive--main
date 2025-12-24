// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  try {
    const users = await prisma.user.findMany(); // change "user" to any model in your schema
    return NextResponse.json({ ok: true, users });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
