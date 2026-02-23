import Link from "next/link"
import type { ReactNode } from "react"

import { PublicArticleCard } from "@/features/blog"
import { getArticles } from "@/lib/api/articles"
import type { ArticleListItem } from "@/lib/api/types"
import { hasPublishedAt } from "@/lib/article/guards"

const ERROR_MESSAGE =
  "最新記事の取得に失敗しました。しばらくしてから再度お試しください。"

export async function LatestArticlesSection() {
  const headingId = "latest-articles-heading"

  let items: Array<ArticleListItem & { publishedAt: string }> = []
  let errorMessage: string | null = null

  try {
    const data = await getArticles({ limit: 3 })
    items = data.items.filter(hasPublishedAt)
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
            publishedAt={article.publishedAt}
          />
        ))}
      </div>
    )
  }

  return (
    <section aria-labelledby={headingId} className="py-12">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id={headingId} className="text-2xl font-semibold tracking-tight">
          最新記事
        </h2>
        <Link
          href="/articles"
          className="text-sm text-muted-foreground underline-offset-4 transition duration-150 hover:-translate-y-0.5 hover:font-medium hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:text-foreground focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          すべての記事を見る
        </Link>
      </div>

      {body}
    </section>
  )
}
