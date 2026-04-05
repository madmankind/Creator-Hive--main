import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

/** PATCH /api/admin/users/[id] — block, suspend, or restore */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const { action, reason } = await req.json().catch(() => ({ action: "", reason: "" }));

  if (action === "block") {
    await db.$executeRawUnsafe(
      `UPDATE creatorhive.users SET "isBlocked" = true, "blockedAt" = NOW(), "blockedReason" = $2 WHERE id = $1`, id, reason ?? null
    );
  } else if (action === "unblock") {
    await db.$executeRawUnsafe(
      `UPDATE creatorhive.users SET "isBlocked" = false, "blockedAt" = NULL, "blockedReason" = NULL WHERE id = $1`, id
    );
  } else if (action === "suspend") {
    await db.$executeRawUnsafe(
      `UPDATE creatorhive.users SET "isSuspended" = true WHERE id = $1`, id
    );
  } else if (action === "unsuspend") {
    await db.$executeRawUnsafe(
      `UPDATE creatorhive.users SET "isSuspended" = false WHERE id = $1`, id
    );
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, action, userId: id });
}

/** DELETE /api/admin/users/[id] — permanent hard delete */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  if (authResult.session.user.id === id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true, deleted: id });
}
