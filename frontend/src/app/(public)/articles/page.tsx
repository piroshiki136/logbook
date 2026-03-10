import { ArticlesPagination, PublicArticleCard } from "@/features/blog"
import { createPageHrefBuilder } from "@/features/blog/lib/create-page-href-builder"
import { parsePage } from "@/features/blog/lib/parse-page"
import { getArticles } from "@/lib/api/articles"

const formatError = () =>
  "記事一覧の取得に失敗しました。しばらくしてから再度お試しください。"

type PageProps = {
  searchParams?: Promise<{
    page?: string
    tags?: string | string[]
    categories?: string | string[]
    [key: string]: string | string[] | undefined
  }>
}

const DEFAULT_LIMIT = 10

const parseListParam = (raw?: string | string[]) => {
  if (!raw) return []
  const values = Array.isArray(raw) ? raw : [raw]

  return values.map((value) => value.trim()).filter((value) => value.length > 0)
}

export default async function Page({ searchParams }: PageProps) {
  try {
    const resolvedSearchParams = await searchParams
    const page = parsePage(resolvedSearchParams?.page)
    // MVPではフィルタUIは未提供だが、URL直打ちの互換性とMVP後の再導入準備として受け付ける。
    const tags = parseListParam(resolvedSearchParams?.tags)
    const categories = parseListParam(resolvedSearchParams?.categories)

    const data = await getArticles({
      page,
      limit: DEFAULT_LIMIT,
      ...(tags.length > 0 ? { tags } : {}),
      ...(categories.length > 0 ? { categories } : {}),
    })
    const totalPages = Math.max(1, Math.ceil(data.total / data.limit))
    const hrefBuilder = createPageHrefBuilder(resolvedSearchParams, "/articles")

    return (
      <main className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <div className="mt-6 grid gap-4">
          {data.items.map((article) => (
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
        <h1 className="text-2xl font-semibold">Articles</h1>
        <p className="mt-3 text-sm text-red-600">{formatError()}</p>
      </main>
    )
  }
}
