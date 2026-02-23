import { AdminArticleCard, ArticlesPagination } from "@/features/blog"
import { createPageHrefBuilder } from "@/features/blog/lib/create-page-href-builder"
import { parsePage } from "@/features/blog/lib/parse-page"
import { getAdminArticles } from "@/lib/api/admin-articles"
import { getAdminToken } from "@/lib/api/admin-auth"

const formatError = () => "記事一覧の取得に失敗しました"

type PageProps = {
  searchParams?: Promise<{
    page?: string
    [key: string]: string | string[] | undefined
  }>
}

const DEFAULT_LIMIT = 20

export default async function Page({ searchParams }: PageProps) {
  try {
    const resolvedSearchParams = await searchParams
    const page = parsePage(resolvedSearchParams?.page)
    const token = await getAdminToken()
    const data = await getAdminArticles({ page, limit: DEFAULT_LIMIT }, token)
    const totalPages = Math.max(1, Math.ceil(data.total / data.limit))
    const hrefBuilder = createPageHrefBuilder(
      resolvedSearchParams,
      "/admin/articles",
    )

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
        <ArticlesPagination
          currentPage={data.page}
          totalPages={totalPages}
          buildHref={hrefBuilder}
        />
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
