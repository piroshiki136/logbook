import type { ArticleNeighbor } from "@/lib/api/types"
import { ArticlePrevNextCard } from "./article-prev-next-card"

type ArticlePrevNextNavProps = {
  prev: ArticleNeighbor | null
  next: ArticleNeighbor | null
}

export function ArticlePrevNextNav({ prev, next }: ArticlePrevNextNavProps) {
  if (!prev && !next) return null

  return (
    <nav
      aria-label="前後の記事"
      className="mt-10 flex flex-col gap-4 md:flex-row md:items-stretch"
    >
      {prev && (
        <ArticlePrevNextCard
          id={prev.id}
          href={`/articles/${prev.slug}`}
          label="前の記事"
          title={prev.title}
          dateValue={prev.publishedAt ?? prev.createdAt}
        />
      )}

      {next && (
        <ArticlePrevNextCard
          id={next.id}
          href={`/articles/${next.slug}`}
          label="次の記事"
          title={next.title}
          dateValue={next.publishedAt ?? next.createdAt}
        />
      )}
    </nav>
  )
}
