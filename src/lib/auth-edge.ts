/**
 * Edge-compatible auth config (no Prisma / Node.js APIs).
 * Used only in middleware/proxy for route protection.
 * The full auth config (with Prisma) is in auth.ts.
 */
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

const edgeConfig: NextAuthConfig = {
  providers: [], // Not needed in middleware — only JWT validation runs here
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
};

export const { auth: edgeAuth } = NextAuth(edgeConfig);
