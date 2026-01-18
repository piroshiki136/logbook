import type { NextAuthConfig } from "next-auth"
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const config: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  basePath: "/api/auth",
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ request, auth }) {
      try {
        const { pathname } = request.nextUrl
        if (pathname === "/admin/login") return true
        if (pathname === "/admin/forbidden") return true
        if (pathname.startsWith("/admin")) return !!auth
        return true
      } catch (err) {
        console.log(err)
      }
    },
    jwt({ token, trigger, session, account }) {
      if (account?.providerAccountId) {
        token.providerAccountId = account.providerAccountId
      }
      if (trigger === "update") token.name = session.user.name
      return token
    },
    session({ session, token }) {
      if (session.user && token.providerAccountId) {
        session.user.id = String(token.providerAccountId)
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
