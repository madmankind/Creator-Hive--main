import { mfetch } from "@/lib/modash";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    const data = await mfetch(`/instagram/profile/${encodeURIComponent(userId)}/report`);
    return Response.json(data);
  } catch (e: any) {
    return Response.json({ error: true, message: String(e.message || e) }, { status: 500 });
  }
}
