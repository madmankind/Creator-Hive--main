import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import type { User, UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "./db";

type RequireUserOptions = {
  roles?: UserRole[];
};

type RequireUserResult =
  | { session: Session; user: User }
  | { error: NextResponse };

const jsonError = (status: number, message: string) =>
  NextResponse.json({ error: message }, { status });

export async function requireUser(
  options: RequireUserOptions = {},
): Promise<RequireUserResult> {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: jsonError(401, "Unauthorized") };
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: jsonError(404, "User not found") };
  }

  if (options.roles && !options.roles.includes(user.role)) {
    return { error: jsonError(403, "Forbidden for role") };
  }

  return { session, user };
}

export function userHasRole(role: unknown, allowed: UserRole[]) {
  return typeof role === "string" && (allowed as string[]).includes(role);
}

export function redirectByRole(role?: UserRole | string | null) {
  if (role === "CREATOR") return "/dashboard/profile";
  if (role === "AGENCY" || role === "ADMIN") return "/discovery";
  return "/";
}
