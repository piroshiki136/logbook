import { ExternalLink } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export function AboutMeSection() {
  return (
    <section aria-label="自己紹介" className="py-12">
      <h2 className="text-2xl font-semibold tracking-tight">About Me</h2>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
        情報学部3年の <span className="font-medium text-foreground">shiki</span>{" "}
        です。AtCoder をきっかけにプログラミングを始め、 Python を中心に
        Web開発と
        <br className="hidden lg:block" />
        並列処理を学習しています。
      </p>

      <div className="mt-8">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          外部リンク
        </p>
        <div className="mt-3 space-y-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href="https://github.com/piroshiki136"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHubプロフィールを新しいタブで開く"
            >
              GitHub
              <ExternalLink aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
