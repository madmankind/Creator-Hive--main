import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { db } from "@/server/db";

const BUCKET = "campaign-files";
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/quicktime","video/webm"]);

function extFromMime(m: string) {
  const map: Record<string,string> = {"image/png":"png","image/webp":"webp","image/gif":"gif","video/mp4":"mp4","video/quicktime":"mov","video/webm":"webm"};
  return map[m] ?? "jpg";
}

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file");
  const creatorProfileId = formData.get("creatorProfileId")?.toString();
  const title = formData.get("title")?.toString() || null;
  const caption = formData.get("caption")?.toString() || null;
  const platform = formData.get("platform")?.toString() || null;

  if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });
  if (!creatorProfileId) return NextResponse.json({ error: "creatorProfileId required" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Max 25MB" }, { status: 400 });

  const isVideo = file.type.startsWith("video/");
  const ext = extFromMime(file.type);
  const path = `admin-portfolio/${creatorProfileId}/${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const supabase = createSupabaseServiceClient();
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const mediaUrl = pub.publicUrl;

  // Count existing items for position
  const count = await db.portfolioItem.count({ where: { creatorProfileId } });

  const item = await db.portfolioItem.create({
    data: {
      creatorProfileId,
      mediaUrl,
      mediaType: isVideo ? "video" : "image",
      title,
      caption,
      platform,
      position: count,
    },
  });

  return NextResponse.json({ ok: true, item, url: mediaUrl });
}
