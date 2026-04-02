import { curatedTalent } from "@/lib/curatedTalent";

/** Pull first balanced `{ ... }` from model output (handles prose before/after JSON). */
export function extractFirstJsonObject(raw: string): string | null {
  const t = raw.trim();
  const start = t.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < t.length; i++) {
    const c = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return t.slice(start, i + 1);
    }
  }
  return null;
}

export function coerceTalentIdList(parsed: Record<string, unknown>): string[] {
  const v =
    parsed.talentIds ??
    parsed.talent_ids ??
    parsed.ids ??
    parsed.recommendations ??
    parsed.matches;
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim()).filter(Boolean);
}

/** Map model output to roster IDs (exact + light cleanup). */
export function resolveTalentIds(rawIds: string[], validTalentIds: Set<string>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (let raw of rawIds) {
    let s = raw.trim().replace(/^[\s"'`]+|[\s"'`]+$/g, "");
    if (!s) continue;

    if (validTalentIds.has(s)) {
      if (!seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
      continue;
    }

    const dbM = s.match(/^db\s*:\s*(.+)$/i);
    if (dbM) {
      const cand = `db:${dbM[1].trim()}`;
      if (validTalentIds.has(cand)) {
        if (!seen.has(cand)) {
          seen.add(cand);
          out.push(cand);
        }
        continue;
      }
    }

    if (s.toLowerCase().startsWith("talent-") && validTalentIds.has(s)) {
      if (!seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
      continue;
    }

    // Bare cuid without "db:" prefix
    if (!s.includes(":") && /^[a-z0-9_-]{16,}$/i.test(s)) {
      const prefixed = `db:${s}`;
      if (validTalentIds.has(prefixed)) {
        if (!seen.has(prefixed)) {
          seen.add(prefixed);
          out.push(prefixed);
        }
        continue;
      }
    }
  }

  return out;
}

/**
 * When LLM returns nothing valid, score showcase roster from brief text so the UI still surfaces picks.
 */
export function fallbackShowcaseIdsFromQuery(query: string, validTalentIds: Set<string>, limit: number): string[] {
  const q = query.toLowerCase();
  const stop = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "your",
    "this",
    "that",
    "need",
    "want",
    "looking",
    "objective",
    "roles",
    "timing",
    "budget",
    "company",
    "industry",
    "notes",
    "workflow",
    "fit",
    "premium",
    "creative",
    "campaign",
    "uae",
    "team",
  ]);
  const words = q
    .split(/\W+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !stop.has(w));

  const scored = curatedTalent
    .filter((t) => validTalentIds.has(t.id))
    .map((t) => {
      const hay = [
        t.name,
        t.displayName ?? "",
        t.displayTitle,
        t.primaryRole,
        ...(t.roleTags ?? []),
        t.shortBio,
        t.nicheSummary,
        ...(t.brandPartners ?? []),
      ]
        .join(" ")
        .toLowerCase();
      let score = 0;
      for (const w of words) {
        if (hay.includes(w)) score += 1;
      }
      return { id: t.id, score };
    })
    .sort((a, b) => b.score - a.score);

  const strong = scored.filter((s) => s.score > 0);
  if (strong.length >= Math.min(3, limit)) {
    return strong.slice(0, limit).map((s) => s.id);
  }

  // Diverse defaults from showcase so the carousel still prioritises a shortlist
  const picked: string[] = [];
  const seenRoles = new Set<string>();
  for (const t of curatedTalent) {
    if (!validTalentIds.has(t.id)) continue;
    if (seenRoles.has(t.primaryRole)) continue;
    seenRoles.add(t.primaryRole);
    picked.push(t.id);
    if (picked.length >= limit) break;
  }
  return picked.slice(0, limit);
}
