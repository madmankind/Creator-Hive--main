import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function POST(req: Request) {
  const { body, senderId } = await req.json();
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const threadId = parts[parts.indexOf("messages") + 1];
  const msg = await prisma.message.create({ data: { threadId, body, senderId } });
  return NextResponse.json(msg);
}

