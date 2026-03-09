import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@prisma/client";
import { auth } from "@/auth";

type RouteRule = {
  prefix: string;
  roles: UserRole[];
};

const rules: RouteRule[] = [
  // /dashboard auth is handled by DashboardLayout (server-side) — not middleware
  { prefix: "/discovery", roles: ["AGENCY", "ADMIN"] },
  { prefix: "/onboarding", roles: ["AGENCY", "CREATOR", "ADMIN"] },
  { prefix: "/creator", roles: ["CREATOR", "ADMIN"] },
  { prefix: "/api/agency", roles: ["AGENCY", "ADMIN"] },
  { prefix: "/api/campaigns", roles: ["AGENCY", "ADMIN"] },
  { prefix: "/api/invoices", roles: ["AGENCY", "CREATOR", "ADMIN"] },
  { prefix: "/api/wallet", roles: ["AGENCY", "CREATOR", "ADMIN"] },
  { prefix: "/api/pods", roles: ["AGENCY", "CREATOR", "ADMIN"] },
  { prefix: "/api/creator", roles: ["CREATOR", "ADMIN"] },
  { prefix: "/api/bookings", roles: ["AGENCY", "ADMIN"] },
  { prefix: "/api/discovery", roles: ["AGENCY", "ADMIN"] },
];

function matchRule(pathname: string) {
  return rules.find((rule) => pathname.startsWith(rule.prefix));
}

type RequestWithAuth = NextRequest & {
  auth?: {
    user?: {
      role?: string | null;
    };
  };
};

export default auth((req: RequestWithAuth) => {
  const { pathname } = req.nextUrl;
  const matched = matchRule(pathname);
  if (!matched) return NextResponse.next();

  const isApiRoute = pathname.startsWith("/api");
  const role = req.auth?.user?.role as UserRole | undefined;

  if (!role) {
    // No session at all — unauthenticated
    if (!req.auth?.user) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = new URL("/", req.nextUrl);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // Authenticated but role missing from JWT (edge case in dev/mock mode) — treat as AGENCY
    const resolvedRole: UserRole = "AGENCY";
    if (!matched.roles.includes(resolvedRole)) {
      if (isApiRoute) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!matched.roles.includes(role)) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/discovery/:path*",
    "/onboarding/:path*",
    "/creator/:path*",
    "/api/agency/:path*",
    "/api/campaigns/:path*",
    "/api/invoices/:path*",
    "/api/wallet/:path*",
    "/api/pods",
    "/api/pods/:path*",
    "/api/creator/:path*",
    "/api/bookings",
    "/api/discovery/:path*",
  ],
};
