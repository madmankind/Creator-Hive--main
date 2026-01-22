import { NextResponse } from "next/server";
import { handlers } from "@/auth";

// Allow auth to proceed even if database isn't configured
// The auth handler will use mock auth in dev mode
export const GET = async (req: Request, ctx: any) => {
  return handlers.GET(req, ctx);
};

export const POST = async (req: Request, ctx: any) => {
  return handlers.POST(req, ctx);
};
