import { curatedTalent } from "@/lib/curatedTalent";

export const dynamic = "force-dynamic";

function buildSet(getter: (talent: typeof curatedTalent[number]) => string | string[] | undefined) {
  const values = new Set<string>();
  curatedTalent.forEach((talent) => {
    const value = getter(talent);
    if (Array.isArray(value)) {
      value.forEach((entry) => entry && values.add(entry));
    } else if (typeof value === "string" && value.length > 0) {
      values.add(value);
    }
  });
  return Array.from(values);
}

const dictionaries: Record<string, string[]> = {
  interests: buildSet((talent) => talent.interests),
  locations: buildSet((talent) => talent.location),
  brands: buildSet((talent) => talent.brandPartners),
  languages: buildSet((talent) => talent.languages),
};

export async function GET(req: Request, { params }: { params: { kind: string } }) {
  const entries = dictionaries[params.kind];
  if (!entries) {
    return new Response("Unknown dictionary", { status: 400 });
  }

  const url = new URL(req.url);
  const query = (url.searchParams.get("query") || "").toLowerCase();
  const limit = Number(url.searchParams.get("limit") || "50");

  const filtered = entries
    .filter((value) => !query || value.toLowerCase().includes(query))
    .slice(0, Number.isFinite(limit) ? limit : 50)
    .map((value) => ({ id: value, name: value }));

  return Response.json({ data: filtered, meta: { total: entries.length, source: "curated" } });
}
