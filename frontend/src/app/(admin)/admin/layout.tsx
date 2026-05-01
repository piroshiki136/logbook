import type { ReactNode } from "react"

export const dynamic = "force-dynamic"

type AdminLayoutProps = {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return children
}
