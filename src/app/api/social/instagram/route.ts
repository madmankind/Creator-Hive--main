// src/app/api/social/instagram/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

function extractMeta(html: string, property: string) {
  const re = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i");
  const m = html.match(re);
  return m?.[1] || "";
}

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
