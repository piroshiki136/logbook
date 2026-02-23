import { ArticlesPagination, PublicArticleCard } from "@/features/blog"
import { getArticles } from "@/lib/api/articles"
import { hasPublishedAt } from "@/lib/article/guards"

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

const parsePage = (raw?: string) => {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return 1
  if (parsed < 1) return 1
  return Math.floor(parsed)
}

const parseListParam = (raw?: string | string[]) => {
  if (!raw) return []
  const values = Array.isArray(raw) ? raw : [raw]

  return values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
}

const createPageHrefBuilder = (
  params: Awaited<PageProps["searchParams"]>,
  pathname = "/articles",
) => {
  return (page: number) => {
    const query = new URLSearchParams()

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (key === "page" || value === undefined) continue
        if (Array.isArray(value)) {
          for (const item of value) {
            query.append(key, item)
          }
          continue
        }
        query.set(key, value)
      }
    }

    query.set("page", String(page))
    return `${pathname}?${query.toString()}`
  }
}

export default async function Page({ searchParams }: PageProps) {
  try {
    const resolvedSearchParams = await searchParams
    const page = parsePage(resolvedSearchParams?.page)
    const tags = parseListParam(resolvedSearchParams?.tags)
    const categories = parseListParam(resolvedSearchParams?.categories)

    const data = await getArticles({
      page,
      limit: DEFAULT_LIMIT,
      ...(tags.length > 0 ? { tags } : {}),
      ...(categories.length > 0 ? { categories } : {}),
    })
    const publicItems = data.items.filter(hasPublishedAt)
    const totalPages = Math.max(1, Math.ceil(data.total / data.limit))
    const hrefBuilder = createPageHrefBuilder(resolvedSearchParams)

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
