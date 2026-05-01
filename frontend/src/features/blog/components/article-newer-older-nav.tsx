import type { PublicArticleNeighbor } from "@/lib/api/types"
import { ArticleNewerOlderCard } from "./article-newer-older-card"

type ArticleNewerOlderNavProps = {
  newer: PublicArticleNeighbor | null
  older: PublicArticleNeighbor | null
}

export function ArticleNewerOlderNav({
  newer,
  older,
}: ArticleNewerOlderNavProps) {
  if (!newer && !older) return null

  return (
    <nav
      aria-label="新旧の記事"
      className="mt-10 flex flex-col gap-4 md:flex-row md:items-stretch"
    >
      {newer && (
        <ArticleNewerOlderCard
          id={newer.id}
          href={`/articles/${newer.slug}`}
          label="新しい記事"
          title={newer.title}
          dateValue={newer.publishedAt}
        />
      )}

      {older && (
        <ArticleNewerOlderCard
          id={older.id}
          href={`/articles/${older.slug}`}
          label="古い記事"
          title={older.title}
          dateValue={older.publishedAt}
        />
      )}
    </nav>
  )
}
