import { mfetch } from "@/lib/modash";

export const dynamic = "force-dynamic";

type Sort = { field?: string; direction?: "asc" | "desc" };
type Body = { page?: number; sort?: Sort; filter?: Record<string, any> };

function buildMock(page = 0) {
  const base = [
    { id: "1", username: "trendsmuggler", fullName: "Trend Smuggler | The Revenue Machine", followers: 1600, engagementRate: 0.218 },
    { id: "2", username: "hannahstuart", fullName: "hannah★", followers: 1400, engagementRate: 0.163 },
    { id: "3", username: "christoskapitanis", fullName: "Christos Kapitanis", followers: 1200, engagementRate: 0.149 },
    { id: "4", username: "bluecardiganguy", fullName: "Blue Cardigan Guy", followers: 4200, engagementRate: 0.108 },
    { id: "5", username: "mohammadfiroz_23", fullName: "✨فروز✨", followers: 2100, engagementRate: 0.105 },
    { id: "6", username: "mana.keil", fullName: "m a n a m e a < 3", followers: 1900, engagementRate: 0.101 },
    { id: "7", username: "moshdhooo__", fullName: "poerdjo_gank", followers: 1300, engagementRate: 0.096 },
    { id: "8", username: "_aj_al_", fullName: "ajal", followers: 1500, engagementRate: 0.094 },
    { id: "9", username: "yosegu23", fullName: "Yopi Septian Gumelar", followers: 2000, engagementRate: 0.092 },
    { id: "10", username: "sabeeley_", fullName: "sabeel mohammed", followers: 1800, engagementRate: 0.090 },
    { id: "11", username: "cristiano", fullName: "Cristiano Ronaldo", followers: 663200000, engagementRate: 0.007 },
    { id: "12", username: "selenagomez", fullName: "Selena Gomez", followers: 417700000, engagementRate: 0.010 },
    { id: "13", username: "therock", fullName: "Dwayne Johnson", followers: 392600000, engagementRate: 0.005 },
    { id: "14", username: "arianagrande", fullName: "Ariana Grande", followers: 380000000, engagementRate: 0.012 },
    { id: "15", username: "kyliejenner", fullName: "Kylie Jenner", followers: 400000000, engagementRate: 0.008 }
  ];
  return {
    data: base,
    meta: { page, hasMore: true, total: 84530433, source: "mock" }
  };
}

export async function POST(req: Request) {
  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    payload = {};
  }

  if (payload.page == null) payload.page = 0; // 15 results per page (server default)

  try {
    const data = await mfetch("/instagram/search", { method: "POST", body: JSON.stringify(payload) });
    return Response.json(data);
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (e?.status === 429 || msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
      // Provide a mock so UI never renders empty during development / rate limits
      return Response.json(buildMock(payload.page));
    }
    return Response.json({ error: true, message: msg }, { status: 500 });
  }
}
