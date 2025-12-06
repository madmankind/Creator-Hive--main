import { mfetch } from "@/lib/modash";

export const dynamic = "force-dynamic";

export async function GET() {
  try { 
    return Response.json(await mfetch("/health")); 
  } catch (e: any) { 
    return Response.json({ error: true, message: String(e.message || e) }, { status: 500 }); 
  }
}
