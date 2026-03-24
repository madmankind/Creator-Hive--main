import type { UserRole } from "@prisma/client";

export function redirectByRole(role?: UserRole | string | null) {
  if (role === "CREATOR") return "/dashboard/profile";
  if (role === "AGENCY" || role === "ADMIN") return "/discovery";
  return "/";
}
