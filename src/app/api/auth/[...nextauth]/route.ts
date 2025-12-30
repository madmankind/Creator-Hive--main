import { NextResponse } from "next/server";
import { handlers } from "@/auth";

const databaseUrl = process.env.DATABASE_URL;
const isDatabaseConfigured =
  typeof databaseUrl === "string" &&
  databaseUrl.length > 0 &&
  !databaseUrl.includes("placeholder") &&
  databaseUrl !== "postgresql://placeholder:placeholder@localhost:5432/placeholder";

const isDev = process.env.NODE_ENV === "development";

export const GET = async (req: Request, ctx: any) => {
  if (!isDatabaseConfigured && isDev) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 }
    );
  }
  return handlers.GET(req, ctx);
};

export const POST = async (req: Request, ctx: any) => {
  if (!isDatabaseConfigured && isDev) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 }
    );
  }
  return handlers.POST(req, ctx);
};
