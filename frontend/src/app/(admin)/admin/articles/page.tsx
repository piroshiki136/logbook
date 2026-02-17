import { AdminArticleCard } from "@/features/blog"
import { getAdminArticles } from "@/lib/api/admin-articles"
import { getAdminToken } from "@/lib/api/admin-auth"

const formatError = () => "記事一覧の取得に失敗しました"

export default async function Page() {
  try {
    const token = await getAdminToken()
    const data = await getAdminArticles({ page: 1, limit: 20 }, token)

    return (
      <main className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold">Admin Articles</h1>
        <div className="mt-2 text-sm text-gray-600">total: {data.total}</div>
        <div className="mt-6 grid gap-4">
          {data.items.map((article) => (
            <AdminArticleCard
              key={article.id}
              id={article.id}
              title={article.title}
              category={article.category}
              tags={article.tags}
              updatedAt={article.updatedAt}
              isDraft={article.isDraft}
            />
          ))}
        </div>
      </main>
    )
  } catch (error) {
    console.error(error)

    return (
      <main className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold">Admin Articles</h1>
        <p className="mt-3 text-sm text-red-600">{formatError()}</p>
      </main>
    )
  }
}
