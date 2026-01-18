import { NextResponse } from "next/server"

import { auth } from "@/auth"

const allowList = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

const isAllowedEmail = (email?: string | null) =>
  !!email && allowList.includes(email.toLowerCase())

export default auth((req) => {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith("/admin")) return NextResponse.next()
  if (pathname.startsWith("/admin/login")) return NextResponse.next()
  if (pathname.startsWith("/admin/forbidden")) return NextResponse.next()

  if (!req.auth) {
    const url = new URL("/admin/login", req.nextUrl)
    url.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (!isAllowedEmail(req.auth.user?.email)) {
    return NextResponse.redirect(new URL("/admin/forbidden", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: "/admin/:path*",
}
