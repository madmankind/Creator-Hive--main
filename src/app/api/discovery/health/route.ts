export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    message: "Discovery data served from curated talent set",
    source: "curated",
  });
}
