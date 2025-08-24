import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function POST(req: Request) {
  const { participantIds, subject, body, senderId } = await req.json();
  const thread = await prisma.thread.create({
    data: {
      subject,
      participants: { connect: (participantIds as string[]).map((id) => ({ id })) },
      messages: { create: { body, senderId } },
    },
    include: { messages: true, participants: true },
  });
  return NextResponse.json(thread);
}

