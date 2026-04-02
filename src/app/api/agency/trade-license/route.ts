import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { createSupabaseServiceClient } from "@/lib/supabase";

const BUCKET = "trade-licenses";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** POST /api/agency/trade-license — upload + store URL on AgencyAccount */
export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const agency = await getOrCreateAgency(user);

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 400 });
  }
  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "File must be PDF, JPG, or PNG" }, { status: 400 });
  }

  const safeName = slugify(file.name) || "trade-license";
  const path = `agencies/${agency.id}/${Date.now()}-${safeName}`;

  const supabase = createSupabaseServiceClient();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  await db.agencyAccount.update({
    where: { id: agency.id },
    data: {
      tradeLicenseUrl: publicUrl,
      tradeLicenseFilename: file.name,
      tradeLicenseUploadedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, url: publicUrl, filename: file.name });
}

/** DELETE /api/agency/trade-license — clear stored URL */
export async function DELETE(_req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const agency = await getOrCreateAgency(user);

  await db.agencyAccount.update({
    where: { id: agency.id },
    data: {
      tradeLicenseUrl: null,
      tradeLicenseFilename: null,
      tradeLicenseUploadedAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
