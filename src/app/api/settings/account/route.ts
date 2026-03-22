import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const imagePatch = z.union([
  z.string().url(),
  z.literal(""),
  z.string().regex(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/),
]);

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  image: imagePatch.optional(),
});

/** Account settings: persisted User.name and User.image (avatar URL). Auth email is not editable here. */
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const user = await db.user.findUnique({
    where: { id: auth.user.id },
    select: { id: true, name: true, email: true, image: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { name, image } = parsed.data;
  const data: { name?: string; image?: string | null } = {};
  if (name !== undefined) data.name = name;
  if (image !== undefined) data.image = image === "" ? null : image;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id: auth.user.id },
    data,
    select: { id: true, name: true, email: true, image: true },
  });
  return NextResponse.json({ user });
}
