"use client"

import Link from "next/link"

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { useScrollDirection } from "@/hooks/use-scrool-direction"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"

export default function Header() {
  const isUp = useScrollDirection()

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "flex h-14 items-center gap-4 bg-background border-b px-4 py-3",
        "transition-transform duration-300 ease-out",
        isUp ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <Button variant="ghost" className="text-lg font-semibold ">
        <Link href="/">Logbook</Link>
      </Button>

      <div className="ml-auto flex items-center gap-5">
        <Input type="search" placeholder="検索" />
        <Button asChild variant="ghost" className="text-base">
          <Link href="/articles">記事一覧</Link>
        </Button>
        <ModeToggle />
      </div>
    </header>
  )
}
