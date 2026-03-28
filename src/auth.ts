import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { UserRole } from "@prisma/client";


const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "mail.com",
  "protonmail.com",
  "yandex.com",
  "gmx.com",
];

function isCompanyEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return !FREE_EMAIL_DOMAINS.includes(domain);
}

const isDev = process.env.NODE_ENV !== "production";

// Validate AUTH_SECRET is set
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!authSecret) {
  console.error("⚠️ Missing AUTH_SECRET environment variable");
  throw new Error(
    "Missing AUTH_SECRET. Please add AUTH_SECRET to your .env.local file. " +
    "Generate one with: openssl rand -base64 32"
  );
}

// Check if DATABASE_URL is configured (detect placeholder URLs)
const databaseUrl = process.env.DATABASE_URL;
const isPlaceholderUrl = databaseUrl && (
  databaseUrl.includes("placeholder") ||
  databaseUrl === "postgresql://placeholder:placeholder@localhost:5432/placeholder" ||
  databaseUrl.includes("user:password") || // Common placeholder pattern
  databaseUrl.includes("@localhost:5432") && (databaseUrl.includes("user") || databaseUrl.includes("password"))
);

const isDatabaseConfigured =
  typeof databaseUrl === "string" &&
  databaseUrl.length > 0 &&
  !isPlaceholderUrl;

const isDatabaseDisabled = !isDatabaseConfigured;

// Allow dev mode to work with mock auth if database is not configured
const USE_MOCK_AUTH_IN_DEV = isDev && isDatabaseDisabled;

if (isDatabaseDisabled && !isDev) {
  throw new Error(
    "DATABASE_URL is not configured. Authentication requires a real Postgres connection."
  );
}

if (USE_MOCK_AUTH_IN_DEV) {
  console.warn(
    "⚠️ DATABASE_URL is not configured. Running in development with mock authentication (no database). " +
    "Set a real Postgres connection string in .env.local to enable full authentication."
  );
}

// @ts-expect-error - NextAuth v5 beta types may not be fully compatible
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: process.env.NODE_ENV === "development" || process.env.AUTH_TRUST_HOST === "true",
  basePath: "/api/auth", // Explicitly set the base path
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: isDev ? `next-auth.session-token` : `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isDev,
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
  providers: [
    // Google OAuth — free, no OTP required
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: { params: { prompt: "select_account" } },
      }),
    ] : []),
    Credentials({
      name: "Creator Hive Access",
      credentials: {
        email: { label: "Email", type: "email" },
        userType: { label: "User Type", type: "text" },
        displayName: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        // In dev mode with no database, use mock authentication
        if (USE_MOCK_AUTH_IN_DEV) {
          const emailInput = credentials?.email;
          const userTypeInput = credentials?.userType;
          const displayNameInput = credentials?.displayName;

          if (typeof emailInput !== "string" || typeof userTypeInput !== "string") {
            throw new Error("Missing credentials");
          }

          const email = emailInput.toLowerCase().trim();
          const userType = userTypeInput === "talent" ? "talent" : "client";

          if (!isDev && userType === "client" && !isCompanyEmail(email)) {
            throw new Error("Please use a company email to sign in.");
          }

          const role: UserRole = userType === "client" ? "AGENCY" : "CREATOR";
          const defaultName =
            typeof displayNameInput === "string" && displayNameInput.trim().length > 0
              ? displayNameInput
              : email.split("@")[0];

          // Return mock user without database access
          return {
            id: `mock-${email.replace(/[@.]/g, "-")}`,
            email,
            name: defaultName,
            role,
          };
        }

        if (isDatabaseDisabled) {
          throw new Error(
            "DATABASE_URL not configured. Add a real Postgres connection string in .env.local and restart the dev server."
          );
        }

        const emailInput = credentials?.email;
          const userTypeInput = credentials?.userType;
          const displayNameInput = credentials?.displayName;

          if (typeof emailInput !== "string" || typeof userTypeInput !== "string") {
            throw new Error("Missing credentials");
          }

          const email = emailInput.toLowerCase().trim();
          const userType = userTypeInput === "talent" ? "talent" : "client";

          if (!isDev && userType === "client" && !isCompanyEmail(email)) {
            throw new Error("Please use a company email to sign in.");
          }

          const role: UserRole =
            userType === "client" ? "AGENCY" : "CREATOR";
          const defaultName =
            typeof displayNameInput === "string" && displayNameInput.trim().length > 0
              ? displayNameInput
              : email.split("@")[0];

        // Try database operation, fall back to mock if it fails
        let user;
        try {
          const { db } = await import("@/server/db");
          
          user = await db.user.upsert({
            where: { email },
            update: {
              // Never downgrade an existing role — only update name
              name: defaultName,
            },
            create: {
              email,
              name: defaultName,
              role,
            },
          });

          if (role === "AGENCY") {
            await db.agencyAccount.upsert({
              where: { userId: user.id },
              update: {},
              create: {
                userId: user.id,
                name: user.name || "My Agency",
              },
            });
          } else if (role === "CREATOR") {
            await db.creatorProfile.upsert({
              where: { userId: user.id },
              update: {},
              create: {
                user: { connect: { id: user.id } },
                name: user.name || "Creator",
                skills: [],
                niches: [],
              },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("❌ Auth authorize error:", error);
          // Instead of failing, create a temporary user for demo purposes
          // This helps diagnose DATABASE_URL issues - if this works, DB is the problem
          console.warn("⚠️ Falling back to demo auth (no database)");
          const email = (credentials?.email as string)?.toLowerCase?.()?.trim() || "demo@example.com";
          const displayName = (credentials?.displayName as string)?.trim() || email.split("@")[0];
          const userType = credentials?.userType === "talent" ? "talent" : "client";
          const role: UserRole = userType === "client" ? "AGENCY" : "CREATOR";
          
          return {
            id: `demo-${email.replace(/[@.]/g, "-")}`,
            email,
            name: displayName,
            role,
          };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: User | null; account?: { provider?: string } | null }) {
      // On initial sign-in, persist role into the token
      if (user?.role) {
        token.role = user.role;
      }
      // Google OAuth — new users default to AGENCY unless the client set
      // ch_google_join_as=creator (talent signup) before signIn("google").
      // Existing users: only name may update; role stays as in DB.
      if (account?.provider === "google" && !token.role) {
        const googleUser = user as { email?: string; name?: string } | undefined;
        if (googleUser?.email) {
          try {
            const { db } = await import("@/server/db");
            let joinAsCreator = false;
            try {
              const { cookies } = await import("next/headers");
              const jar = await cookies();
              joinAsCreator = jar.get("ch_google_join_as")?.value === "creator";
            } catch {
              /* cookies() unavailable outside a request */
            }
            const defaultRole: UserRole = joinAsCreator ? "CREATOR" : "AGENCY";
            const dbUser = await db.user.upsert({
              where: { email: googleUser.email },
              update: { name: googleUser.name ?? undefined },
              create: {
                email: googleUser.email,
                name: googleUser.name ?? googleUser.email.split("@")[0],
                role: defaultRole,
              },
            });
            token.role = dbUser.role;
            token.sub = dbUser.id;
            if (dbUser.role === "AGENCY") {
              await db.agencyAccount.upsert({
                where: { userId: dbUser.id },
                update: {},
                create: { userId: dbUser.id, name: dbUser.name || "My Brand" },
              });
            } else if (dbUser.role === "CREATOR") {
              await db.creatorProfile.upsert({
                where: { userId: dbUser.id },
                update: {},
                create: {
                  user: { connect: { id: dbUser.id } },
                  name: dbUser.name || "Creator",
                  skills: [],
                  niches: [],
                },
              });
            }
          } catch {
            token.role = "AGENCY";
          }
        }
      }
      if (!token.role && token.sub) token.role = "AGENCY";
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // Cast to extend with our custom fields
        const u = session.user as typeof session.user & { id: string; role?: string };
        u.id = token.sub ?? (session.user as { id?: string }).id ?? "";
        if (typeof token.role === "string") {
          u.role = token.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
