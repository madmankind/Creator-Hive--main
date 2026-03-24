export async function getOrCreateAgency(user: { id: string; email: string; name?: string | null }) {
  // Check if we're in dev mode with placeholder database
  const isDev = process.env.NODE_ENV !== "production";
  const databaseUrl = process.env.DATABASE_URL || "";
  const isPlaceholderUrl = databaseUrl.includes("placeholder") || 
                           databaseUrl.includes("user:password") ||
                           (databaseUrl.includes("@localhost:5432") && (databaseUrl.includes("user") || databaseUrl.includes("password")));

  // In dev mode with placeholder URL, return mock agency
  if (isDev && (!databaseUrl || isPlaceholderUrl)) {
    return {
      id: `mock-agency-${user.id}`,
      userId: user.id,
      name: user.name || user.email.split("@")[0] || "Agency",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  try {
    const { db } = await import("./db");
    const existing = await db.agencyAccount.findUnique({
      where: { userId: user.id },
    });
    if (existing) return existing;

    return db.agencyAccount.create({
      data: {
        userId: user.id,
        name: user.name || user.email.split("@")[0] || "Agency",
      },
    });
  } catch (error) {
    // If database connection fails in dev, return mock agency
    if (isDev) {
      console.warn("⚠️ [Dev Mode] Agency database connection failed, using mock agency:", error);
      return {
        id: `mock-agency-${user.id}`,
        userId: user.id,
        name: user.name || user.email.split("@")[0] || "Agency",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    throw error;
  }
}
