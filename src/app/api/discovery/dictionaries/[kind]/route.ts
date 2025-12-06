import { mfetch } from "@/lib/modash";

const map: Record<string, string> = {
  interests: "/instagram/interests",
  locations: "/instagram/locations",
  brands: "/instagram/brands",
  languages: "/instagram/languages",
};

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { kind: string } }) {
  try {
    const base = map[params.kind];
    if (!base) return new Response("Unknown dictionary", { status: 400 });
    const url = new URL(req.url);
    const query = url.searchParams.get("query") || "";
    const limit = url.searchParams.get("limit") || "50";
    const data = await mfetch(`${base}?query=${encodeURIComponent(query)}&limit=${encodeURIComponent(limit)}`, {}, { revalidate: 3600 });
    return Response.json(data);
  } catch (e: any) {
    return Response.json({ error: true, message: String(e.message || e) }, { status: 500 });
  }
}
