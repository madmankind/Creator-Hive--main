import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { createSupabaseServiceClient } from "@/lib/supabase";

const BUCKET = "campaign-files";
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

async function assertCampaignAccess(campaignId: string, user: { id: string; email: string; name?: string | null; role: string }) {
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (user.role === "ADMIN") return { campaign };
  const agency = await getOrCreateAgency(user);
  if (campaign.agencyId !== agency.id) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { campaign };
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: Request, context: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await context.params;
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const access = await assertCampaignAccess(campaignId, user);
  if ("error" in access) return access.error;

  const formData = await req.formData();
  const files = formData.getAll("file").filter((f): f is File => f instanceof File);

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const uploaded: Array<{ id: string; originalName: string }> = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File ${file.name} exceeds 25MB limit` }, { status: 400 });
    }

    const safeName = slugify(file.name) || "file";
    const path = `campaigns/${campaignId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const record = await (db as any).campaignFile.create({
      data: {
        campaignId,
        uploaderUserId: user.id,
        storageBucket: BUCKET,
        storagePath: path,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      },
    });

    uploaded.push({ id: record.id, originalName: record.originalName });
  }

  return NextResponse.json({ ok: true, files: uploaded });
}
