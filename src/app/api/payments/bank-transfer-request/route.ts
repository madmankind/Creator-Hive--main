import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { company, billingEmail, amount } = body || {};
    if (!company || !billingEmail || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Stub persistence; integrate with real invoicing later
    const fakeId = `inv_${Date.now()}`;
    return NextResponse.json({
      ok: true,
      id: fakeId,
      status: "sent",
      message: "Invoice generated and queued for email (stub).",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create invoice request" }, { status: 500 });
  }
}
