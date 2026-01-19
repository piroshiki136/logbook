import Link from "next/link"

import { siteDescription, siteTitle } from "@/lib/site-metadata"

const navLinks = [
  { href: "/", label: "ホーム" },
  { href: "/articles", label: "記事一覧" },
  { href: "/categories", label: "カテゴリ" },
  { href: "/tags", label: "タグ" },
] as const

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t mt-16 border-white/10 bg-zinc-950 text-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 md:items-start gap-8">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2">
              {/* ロゴ予定 ここに追加*/}
              <span className="text-base font-semibold tracking-tight">
                LogBook
              </span>
            </Link>

            <p className="text-sm leading-6 text-zinc-300">{siteDescription}</p>
          </div>

          <nav
            aria-label="フッターナビゲーション"
            className="md:justify-self-end"
          >
            <ul className="flex flex-wrap text-sm gap-x-6 gap-y-3">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition focus:outline-none focus:ring-2 rounded text-zinc-300 hover:text-white focus:ring-white/30"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className="transition focus:outline-none focus:ring-2 rounded text-zinc-300 hover:text-white focus:ring-white/30"
                >
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col border-t sm:flex-row sm:items-center sm:justify-between mt-8 gap-2 pt-6 border-white/10">
          <p className="text-xs text-zinc-400">
            © {year} {siteTitle}.
          </p>
          {/* 追加したいならここに追加 */}
          <Link
            href="/about"
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            About
          </Link>
        </div>
      </div>
    </footer>
  )
}
