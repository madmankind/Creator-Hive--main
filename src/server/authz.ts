import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import type { User, UserRole } from "@prisma/client";
import { auth } from "@/auth";

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

  // Check if we're in dev mode with placeholder database
  const isDev = process.env.NODE_ENV !== "production";
  const databaseUrl = process.env.DATABASE_URL || "";
  const isPlaceholderUrl = databaseUrl.includes("placeholder") || 
                           databaseUrl.includes("user:password") ||
                           (databaseUrl.includes("@localhost:5432") && (databaseUrl.includes("user") || databaseUrl.includes("password")));

  // In dev mode with placeholder URL, use mock user from session
  if (isDev && (!databaseUrl || isPlaceholderUrl)) {
    const mockUser: User = {
      id: session.user.id || `mock-${session.user.email?.replace(/[@.]/g, "-")}`,
      email: session.user.email!,
      name: session.user.name || session.user.email?.split("@")[0] || "User",
      emailVerified: null,
      image: null,
      role: (session.user.role as UserRole) || "AGENCY",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (options.roles && !options.roles.includes(mockUser.role)) {
      return { error: jsonError(403, "Forbidden for role") };
    }

    return { session, user: mockUser };
  }

  // Otherwise, try to get user from database
  try {
    const { db } = await import("./db");
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
  } catch (error) {
    // If database connection fails in dev, fall back to mock user
    if (isDev) {
      console.warn("⚠️ [Dev Mode] Database connection failed, using mock user:", error);
      const mockUser: User = {
        id: session.user.id || `mock-${session.user.email?.replace(/[@.]/g, "-")}`,
        email: session.user.email!,
        name: session.user.name || session.user.email?.split("@")[0] || "User",
        emailVerified: null,
        image: null,
        role: (session.user.role as UserRole) || "AGENCY",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (options.roles && !options.roles.includes(mockUser.role)) {
        return { error: jsonError(403, "Forbidden for role") };
      }

      return { session, user: mockUser };
    }
    throw error;
  }
}

export function userHasRole(role: unknown, allowed: UserRole[]) {
  return typeof role === "string" && (allowed as string[]).includes(role);
}

export function redirectByRole(role?: UserRole | string | null) {
  if (role === "CREATOR") return "/dashboard/creator";
  if (role === "AGENCY" || role === "ADMIN") return "/discovery";
  return "/";
}
