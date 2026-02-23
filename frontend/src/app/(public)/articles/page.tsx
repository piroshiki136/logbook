import { PublicArticleCard } from "@/features/blog"
import { getArticles } from "@/lib/api/articles"
import { hasPublishedAt } from "@/lib/article/guards"

const formatError = () =>
  "記事一覧の取得に失敗しました。しばらくしてから再度お試しください。"

export default async function Page() {
  try {
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
  } catch (error) {
    console.error(error)

    return (
      <main className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <p className="mt-3 text-sm text-red-600">{formatError()}</p>
      </main>
    )
  }
}
