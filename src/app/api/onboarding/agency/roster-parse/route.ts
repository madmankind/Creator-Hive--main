import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { db } from "@/server/db";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;

function norm(s: unknown): string {
  return typeof s === "string" ? s.trim() : String(s ?? "").trim();
}

function rowToTalent(row: Record<string, unknown>): {
  name: string;
  role?: string;
  location?: string;
  social?: string;
  portfolio?: string;
  years?: string;
  industries?: string;
} | null {
  const keys = Object.keys(row);
  const lower = (k: string) => keys.find((x) => x.toLowerCase() === k.toLowerCase());
  const get = (...aliases: string[]) => {
    for (const a of aliases) {
      const k = lower(a);
      if (k && row[k] != null && norm(row[k])) return norm(row[k]);
    }
    return "";
  };
  const name = get("full name", "name", "talent", "creator");
  if (!name) return null;
  return {
    name,
    role: get("role", "primary role", "title") || undefined,
    location: get("location", "based", "city", "country") || undefined,
    social: get("instagram", "social", "handle", "tiktok") || undefined,
    portfolio: get("portfolio", "url", "website", "link") || undefined,
    years: get("years", "experience") || undefined,
    industries: get("industries", "niches", "categories") || undefined,
  };
}

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  let rows: Record<string, unknown>[] = [];
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith(".csv")) {
      const wb = XLSX.read(buf.toString("utf8"), { type: "string" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    } else {
      const wb = XLSX.read(buf, { type: "buffer" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    }
  } catch {
    return NextResponse.json({ error: "Could not parse file" }, { status: 422 });
  }

  const agency = await getOrCreateAgency(user);
  let saved = 0;
  for (const row of rows) {
    const t = rowToTalent(row);
    if (!t) continue;
    try {
      const ig = t.social?.replace(/^@+/, "").trim() ?? "";
      await db.creatorProfile.create({
        data: {
          agencyId: agency.id,
          userId: null,
          name: t.name.slice(0, 120),
          instagram: ig.length >= 2 ? ig : "pending",
          skills: [t.role ?? "Creator"].filter(Boolean) as string[],
          niches: [],
          location: t.location ?? null,
          portfolioUrl: t.portfolio || null,
          primaryRole: t.role ?? null,
          yearsExperienceBand: t.years ?? null,
          rankedIndustries: t.industries
            ? t.industries.split(/[,;]/).map((s) => s.trim()).filter(Boolean).slice(0, 8)
            : [],
          talentStatus: "draft",
          source: "agency_roster_upload",
        },
      });
      saved++;
    } catch (e) {
      console.error("[roster-parse row]", e);
    }
  }

  return NextResponse.json({ ok: true, saved, scanned: rows.length });
}
