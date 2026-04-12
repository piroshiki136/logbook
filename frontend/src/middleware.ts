import { NextResponse } from "next/server"

import { auth } from "@/auth"
import {
  isAllowedAdminEmail,
  parseAdminAllowedEmails,
} from "@/features/admin/lib/admin-allow-list"

const allowList = parseAdminAllowedEmails(process.env.ADMIN_ALLOWED_EMAILS)

export default auth((req) => {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith("/admin")) return NextResponse.next()
  if (pathname.startsWith("/admin/login")) return NextResponse.next()
  if (pathname.startsWith("/admin/forbidden")) return NextResponse.next()

  if (!req.auth) {
    const url = new URL("/admin/login", req.nextUrl)
    url.searchParams.set(
      "callbackUrl",
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    )
    return NextResponse.redirect(url)
  }

  if (!isAllowedAdminEmail(req.auth.user?.email, allowList)) {
    return NextResponse.redirect(new URL("/admin/forbidden", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: "/admin/:path*",
}
