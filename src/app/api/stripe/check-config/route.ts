import { NextResponse } from "next/server";

export async function GET() {
  const configured = !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PUBLISHABLE_KEY
  );

  return NextResponse.json({ configured });
}







