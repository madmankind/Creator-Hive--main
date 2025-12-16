import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/server/db";


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

// Validate AUTH_SECRET is set
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!authSecret) {
  console.error("⚠️ Missing AUTH_SECRET environment variable");
  throw new Error(
    "Missing AUTH_SECRET. Please add AUTH_SECRET to your .env.local file. " +
    "Generate one with: openssl rand -base64 32"
  );
}

// Check if DATABASE_URL is configured
const databaseUrl = process.env.DATABASE_URL;
const isDatabaseConfigured = databaseUrl && 
  !databaseUrl.includes("placeholder") && 
  databaseUrl !== "postgresql://placeholder:placeholder@localhost:5432/placeholder";

if (!isDatabaseConfigured) {
  console.warn("⚠️ DATABASE_URL is not properly configured. Using mock authentication for development.");
}

// @ts-expect-error - NextAuth v5 beta types may not be fully compatible
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true, // Required for NextAuth v5 in development
  basePath: "/api/auth", // Explicitly set the base path
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Creator Hive Access",
      credentials: {
        email: { label: "Email", type: "email" },
        userType: { label: "User Type", type: "text" },
        displayName: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.userType) {
            throw new Error("Missing credentials");
          }

          const email = credentials.email.toLowerCase().trim();
          const userType = credentials.userType === "talent" ? "talent" : "client";

          if (userType === "client" && !isCompanyEmail(email)) {
            throw new Error("Please use a company email to sign in.");
          }

          const role = userType === "client" ? "AGENCY" : "CREATOR";
          const defaultName = credentials.displayName || email.split("@")[0];

          // If database is not configured, use mock authentication for development
          if (!isDatabaseConfigured) {
            console.log("✅ Using mock authentication for:", email, "role:", role);
            return {
              id: `mock-${Date.now()}-${email}`,
              email: email,
              name: defaultName,
              role: role,
            };
          }

          // Try database operations, but fall back to mock if it fails
          try {
            // Test database connection
            await db.$connect();
            
            const user = await db.user.upsert({
              where: { email },
              update: {
                role: role as any,
                name: credentials.displayName ?? undefined,
              },
              create: {
                email,
                name: defaultName,
                role: role as any,
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
                  userId: user.id,
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
          } catch (dbError) {
            console.warn("⚠️ Database operation failed, using mock authentication:", dbError);
            // Fall back to mock authentication if database fails
            return {
              id: `mock-${Date.now()}-${email}`,
              email: email,
              name: defaultName,
              role: role,
            };
          }
        } catch (error) {
          console.error("❌ Auth authorize error:", error);
          // Re-throw with a user-friendly message
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("Authentication failed. Please try again.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = (user as { role?: string }).role || token.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id;
        if (typeof token.role === "string") {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
