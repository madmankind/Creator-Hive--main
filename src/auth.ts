import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@prisma/client";
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

// Check if DATABASE_URL is configured
const databaseUrl = process.env.DATABASE_URL;
const isDatabaseConfigured =
  typeof databaseUrl === "string" &&
  databaseUrl.length > 0 &&
  !databaseUrl.includes("placeholder") &&
  databaseUrl !== "postgresql://placeholder:placeholder@localhost:5432/placeholder";

const isDatabaseDisabled = !isDatabaseConfigured;

if (isDatabaseDisabled && !isDev) {
  throw new Error(
    "DATABASE_URL is not configured. Authentication requires a real Postgres connection."
  );
}

if (isDatabaseDisabled && isDev) {
  console.warn(
    "DATABASE_URL is not configured. Running in development with auth disabled until a real Postgres URL is provided."
  );
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
        if (isDatabaseDisabled) {
          throw new Error(
            "DATABASE_URL not configured. Add a real Postgres connection string in .env.local and restart the dev server."
          );
        }

        try {
          const emailInput = credentials?.email;
          const userTypeInput = credentials?.userType;
          const displayNameInput = credentials?.displayName;

          if (typeof emailInput !== "string" || typeof userTypeInput !== "string") {
            throw new Error("Missing credentials");
          }

          const email = emailInput.toLowerCase().trim();
          const userType = userTypeInput === "talent" ? "talent" : "client";

          if (userType === "client" && !isCompanyEmail(email)) {
            throw new Error("Please use a company email to sign in.");
          }

          const role: UserRole =
            userType === "client" ? "AGENCY" : "CREATOR";
          const defaultName =
            typeof displayNameInput === "string" && displayNameInput.trim().length > 0
              ? displayNameInput
              : email.split("@")[0];

          const user = await db.user.upsert({
            where: { email },
            update: {
              role,
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
    async jwt({ token, user }: { token: JWT; user?: User | null }) {
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
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
