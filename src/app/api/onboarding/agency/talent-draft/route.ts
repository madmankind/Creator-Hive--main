import { NextResponse } from "next/server";
import type { User } from "@prisma/client";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { db } from "@/server/db";

function splitIndustries(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function parseJsonStringArray(raw: unknown): string[] {
  if (!raw || typeof raw !== "string") return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x).trim()).filter(Boolean);
  } catch {
    return [];
  }
}

async function upsertRepBootstrap(user: User, draft: Record<string, unknown>) {
  const agency = await getOrCreateAgency(user);
  const name = String(draft.repEntityName ?? "").trim() || agency.name;
  try {
    await db.agencyAccount.update({
      where: { id: agency.id },
      data: {
        name,
        industry: typeof draft.repTalentKinds === "string" ? draft.repTalentKinds.slice(0, 200) : undefined,
      },
    });
  } catch {
    /* dev mock */
  }
  return agency;
}

function pickInstagram(raw: string | undefined): string {
  const s = raw?.replace(/^@+/, "").trim() ?? "";
  return s.length >= 2 ? s : "pending";
}

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  let body: { action?: string; draft?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action !== "commit_manual") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const draft = body.draft ?? {};
  const agency = await upsertRepBootstrap(user, draft);

  const talents: Array<{
    name: string;
    role?: string;
    skills: string[];
    location?: string;
    social?: string;
    portfolio?: string;
    rankedIndustries: string[];
  }> = [];

  if (draft.t1_fullName) {
    const rolesArr = parseJsonStringArray(draft.t1_topRoles);
    const legacyRole = draft.t1_primaryRole ? String(draft.t1_primaryRole) : "";
    const ranked = parseJsonStringArray(draft.t1_rankedIndustries);
    const rankedFallback = ranked.length ? ranked : splitIndustries(draft.t1_industries as string | undefined);
    const primary1 = rolesArr[0] ?? (legacyRole || undefined);
    talents.push({
      name: String(draft.t1_fullName),
      role: primary1 || undefined,
      skills: rolesArr.length ? rolesArr : legacyRole ? [legacyRole] : [],
      location: draft.t1_location ? String(draft.t1_location) : undefined,
      social: draft.t1_social ? String(draft.t1_social) : undefined,
      portfolio: draft.t1_portfolio ? String(draft.t1_portfolio) : undefined,
      rankedIndustries: rankedFallback,
    });
  }
  if (draft.t2_fullName) {
    const rolesArr = parseJsonStringArray(draft.t2_topRoles);
    const legacyRole = draft.t2_primaryRole ? String(draft.t2_primaryRole) : "";
    const ranked = parseJsonStringArray(draft.t2_rankedIndustries);
    const primary2 = rolesArr[0] ?? (legacyRole || undefined);
    talents.push({
      name: String(draft.t2_fullName),
      role: primary2 || undefined,
      skills: rolesArr.length ? rolesArr : legacyRole ? [legacyRole] : [],
      location: draft.t2_location ? String(draft.t2_location) : undefined,
      social: draft.t2_social ? String(draft.t2_social) : undefined,
      portfolio: draft.t2_portfolio ? String(draft.t2_portfolio) : undefined,
      rankedIndustries: ranked,
    });
  }

  if (talents.length === 0) {
    return NextResponse.json({ error: "No talent rows" }, { status: 400 });
  }

  let saved = 0;
  for (const t of talents) {
    const displayName = (t.name ?? "").trim();
    if (!displayName) continue;
    const skills =
      t.skills.length > 0 ? t.skills.slice(0, 8) : [t.role ?? "Creator"].filter(Boolean);
    try {
      await db.creatorProfile.create({
        data: {
          agencyId: agency.id,
          userId: null,
          name: displayName.slice(0, 120),
          instagram: pickInstagram(t.social),
          skills: skills.length ? skills : ["Creator"],
          niches: [],
          location: t.location ?? null,
          portfolioUrl: t.portfolio?.trim() || null,
          primaryRole: t.role ?? skills[0] ?? null,
          bio: null,
          rankedIndustries: t.rankedIndustries.slice(0, 8),
          talentStatus: "draft",
          source: "agency_hero_manual",
        },
      });
      saved++;
    } catch (e) {
      console.error("[talent-draft]", e);
    }
  }

  return NextResponse.json({ ok: true, saved });
}
