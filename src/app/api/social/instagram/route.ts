// src/app/api/social/instagram/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = (searchParams.get("username") || "").trim().replace(/^@+/, "");
    if (!username) return NextResponse.json({ error: "username_required" }, { status: 400 });

    const url = `https://www.instagram.com/${encodeURIComponent(username)}/`;
    
    // For demo purposes, return a mock preview since Instagram blocks automated requests
    // In production, you'd use Instagram Graph API for official access
    const preview = {
      title: `@${username}`,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=1f2937&color=e5e7eb&size=200`,
      url
    };

    return NextResponse.json(preview);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "internal_error" }, { status: 500 });
  }
}
