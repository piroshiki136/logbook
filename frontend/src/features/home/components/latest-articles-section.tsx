import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { PublicArticleCard } from "@/features/blog"
import { getPublicArticles } from "@/lib/api/articles"
import type { PublicArticleListItem } from "@/lib/api/types"

const ERROR_MESSAGE =
  "最新記事の取得に失敗しました。しばらくしてから再度お試しください。"

export async function LatestArticlesSection() {
  const headingId = "latest-articles-heading"

  let items: PublicArticleListItem[] = []
  let errorMessage: string | null = null

  try {
    const data = await getPublicArticles({ limit: 3 })
    items = data.items
  } catch (error) {
    console.error(error)
    errorMessage = ERROR_MESSAGE
  }

  let body: ReactNode
  if (errorMessage) {
    body = (
      <p role="alert" className="text-sm text-red-600">
        {errorMessage}
      </p>
    )
  } else if (items.length === 0) {
    body = (
      <p className="text-sm text-muted-foreground">
        公開済みの記事はまだありません。
      </p>
    )
  } else {
    body = (
      <div className="grid gap-4">
        {items.map((article) => (
          <PublicArticleCard
            key={article.id}
            id={article.id}
            slug={article.slug}
            title={article.title}
            category={article.category}
            tags={article.tags}
            updatedAt={article.updatedAt}
          />
        ))}
      </div>
    )
  }

  return (
    <section aria-labelledby={headingId} className="py-12">
      <div className="mb-5">
        <h2 id={headingId} className="text-2xl font-semibold tracking-tight">
          最新記事
        </h2>
      </div>

      {body}

      <div className="mt-6 flex justify-start">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
        >
          <Link href="/articles">
            記事一覧を見る
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
