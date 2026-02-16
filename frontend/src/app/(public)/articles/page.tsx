import { PublicArticleCard } from "@/features/blog"
import { getArticles } from "@/lib/api/articles"
import type { ArticleListItem } from "@/lib/api/types"

const hasPublishedAt = (
  article: ArticleListItem,
): article is ArticleListItem & { publishedAt: string } => {
  return article.publishedAt !== null
}

export default async function Page() {
  const data = await getArticles()
  const publicItems = data.items.filter(hasPublishedAt)

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Articles</h1>
      <div className="mt-6 grid gap-4">
        {publicItems.map((article) => (
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
    </main>
  )
}
