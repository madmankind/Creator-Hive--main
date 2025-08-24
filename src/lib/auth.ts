import type { NextAuthOptions, Session, DefaultUser } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { prisma } from "@/server/prisma";

declare module "next-auth" {
  interface Session {
    user?: DefaultUser & { id?: string; role?: string };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as NextAuthOptions["adapter"],
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Email({ server: process.env.EMAIL_SERVER!, from: process.env.EMAIL_FROM! }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = (user as { id: string }).id;
        session.user.role = String((user as { role?: string }).role ?? "CREATOR");
      }
      return session as Session;
    },
  },
  pages: { signIn: "/signin" },
};

