import { NextResponse } from "next/server";
import { db } from "@/server/db";

// POST — quick login for existing users (no OTP required)
// Only works if user already exists in DB (already verified via OTP at signup)
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalised = email.toLowerCase().trim();

    // Verify user actually exists — this is the security gate
    const user = await db.user.findUnique({
      where: { email: normalised },
      select: { id: true, role: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "not_found", isExistingUser: false }, { status: 404 });
    }

    // User exists — they've already verified via OTP at first signup
    // Return success so frontend can call signIn("credentials") directly
    return NextResponse.json({
      ok: true,
      isExistingUser: true,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error("[quick-login]", err);
    return NextResponse.json({ error: "Login check failed" }, { status: 500 });
  }
}

export const maxDuration = 10;
