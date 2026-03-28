import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { createSupabaseServiceClient } from "@/lib/supabase";

const BUCKET = "campaign-files";
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

function extFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/quicktime") return "mov";
  if (mime === "video/webm") return "webm";
  return "jpg";
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
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
    return NextResponse.json(
      { error: "Use JPEG, PNG, WebP, GIF, MP4, MOV, or WebM" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be 25MB or smaller" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const safeName = slugify(file.name) || `work.${extFromMime(file.type)}`;
  const path = `onboarding-portfolio/${auth.user.id}/${Date.now()}-${safeName}`;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey) {
      const supabase = createSupabaseServiceClient();
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (upErr) {
        return NextResponse.json({ error: upErr.message }, { status: 500 });
      }
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return NextResponse.json({ url: pub.publicUrl, storage: "supabase" as const });
    }
  } catch (e) {
    console.error("[onboarding portfolio upload]", e);
  }

  return NextResponse.json(
    { error: "Upload is not configured (Supabase)" },
    { status: 503 },
  );
}
