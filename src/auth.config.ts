import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-access";

const providers: NextAuthConfig["providers"] = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}

if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
  providers.push(Apple);
}

export const authConfig = {
  providers,
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (!isAdminEmail(auth.user?.email)) {
          return NextResponse.redirect(new URL("/dashboard/lists", request.nextUrl));
        }
        return true;
      }

      if (pathname.startsWith("/dashboard")) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
