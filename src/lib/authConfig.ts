/**
 * Utility to check if authentication is properly configured.
 * Returns true if auth can be used, false if we should fall back to localStorage.
 */
export function isAuthConfigured(): boolean {
  // Check for NextAuth secret (required)
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!authSecret) {
    return false;
  }

  // In production, we require database
  if (process.env.NODE_ENV === "production") {
    const databaseUrl = process.env.DATABASE_URL;
    const isPlaceholderUrl =
      databaseUrl &&
      (databaseUrl.includes("placeholder") ||
        databaseUrl === "postgresql://placeholder:placeholder@localhost:5432/placeholder" ||
        databaseUrl.includes("user:password") ||
        (databaseUrl.includes("@localhost:5432") &&
          (databaseUrl.includes("user") || databaseUrl.includes("password"))));

    const isDatabaseConfigured =
      typeof databaseUrl === "string" &&
      databaseUrl.length > 0 &&
      !isPlaceholderUrl;

    return isDatabaseConfigured;
  }

  // In development, auth is considered configured if AUTH_SECRET exists
  // (mock auth will be used if database is missing)
  return true;
}

/**
 * Client-side check (uses window to detect environment).
 * Note: This can only check what's available in the browser.
 */
export function isAuthConfiguredClient(): boolean {
  // On client, we can't check env vars directly, so we'll try auth and fall back if it fails
  // This is handled in the component by catching errors
  return true; // Optimistic - let the actual auth call determine if it works
}
