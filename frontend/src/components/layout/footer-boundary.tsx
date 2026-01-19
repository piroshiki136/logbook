"use client"

import { usePathname } from "next/navigation"
import Footer from "@/components/layout/footer"

export function FooterBoundary() {
  const pathname = usePathname()
  if (pathname?.startsWith("/admin")) return null
  return <Footer />
}
