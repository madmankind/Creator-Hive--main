import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { createSupabaseServiceClient } from "@/lib/supabase";

const AVATAR_BUCKET = "campaign-files";
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Expected file field" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use JPEG, PNG, WebP, or GIF" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 2MB or smaller" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey) {
      const supabase = createSupabaseServiceClient();
      const path = `avatars/${auth.user.id}/${Date.now()}.${extFromMime(file.type)}`;
      const { error: upErr } = await supabase.storage.from(AVATAR_BUCKET).upload(path, buf, {
        contentType: file.type,
        upsert: true,
      });
      if (upErr) {
        return NextResponse.json({ error: upErr.message }, { status: 500 });
      }
      const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      return NextResponse.json({ url: pub.publicUrl, storage: "supabase" as const });
    }
  } catch (e) {
    console.error("[avatar upload]", e);
  }

  if (buf.length > 350_000) {
    return NextResponse.json({ error: "Storage not configured and file too large for inline save" }, { status: 503 });
  }
  const b64 = buf.toString("base64");
  const dataUrl = `data:${file.type};base64,${b64}`;
  return NextResponse.json({ url: dataUrl, storage: "inline" as const });
}
