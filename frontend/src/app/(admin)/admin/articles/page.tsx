import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
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
const ADMIN_ARTICLES_PATH = "/admin/articles"

type DraftFilter = boolean | undefined

const getDraftFilter = (draft: string | string[] | undefined): DraftFilter => {
  if (Array.isArray(draft)) {
    return getDraftFilter(draft[0])
  }
  if (draft === "true") return true
  if (draft === "false") return false
  return undefined
}

const createDraftTabHref = (
  params: Awaited<PageProps["searchParams"]>,
  draft: DraftFilter,
) => {
  const query = new URLSearchParams()

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (key === "page" || key === "draft" || value === undefined) continue
      if (Array.isArray(value)) {
        for (const item of value) {
          query.append(key, item)
        }
        continue
      }
      query.set(key, value)
    }
  }

  if (draft !== undefined) {
    query.set("draft", String(draft))
  }

  const queryString = query.toString()
  return queryString
    ? `${ADMIN_ARTICLES_PATH}?${queryString}`
    : ADMIN_ARTICLES_PATH
}

const articleTabs = [
  { key: "all", label: "全記事", draft: undefined },
  { key: "published", label: "公開記事", draft: false },
  { key: "draft", label: "非公開", draft: true },
] as const

export default async function Page({ searchParams }: PageProps) {
  try {
    const resolvedSearchParams = await searchParams
    const page = parsePage(resolvedSearchParams?.page)
    const draft = getDraftFilter(resolvedSearchParams?.draft)
    const token = await getAdminToken()
    const data = await getAdminArticles(
      { page, limit: DEFAULT_LIMIT, draft },
      token,
    )
    const totalPages = Math.max(1, Math.ceil(data.total / data.limit))
    const hrefBuilder = createPageHrefBuilder(
      resolvedSearchParams,
      ADMIN_ARTICLES_PATH,
    )

    return (
      <main className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold">記事管理</h1>
        <div className="mt-6">
          <ButtonGroup className="w-full flex-wrap md:w-fit">
            {articleTabs.map((tab) => {
              const isActive = draft === tab.draft

              return (
                <Button
                  key={tab.key}
                  asChild
                  className={isActive ? "text-primary-foreground" : undefined}
                  variant={isActive ? "default" : "outline"}
                >
                  <Link
                    href={createDraftTabHref(resolvedSearchParams, tab.draft)}
                  >
                    {tab.label}
                  </Link>
                </Button>
              )
            })}
          </ButtonGroup>
        </div>
        <div className="mt-2">件数: {data.total}</div>

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
        <h1 className="text-2xl font-semibold">記事管理</h1>
        <p className="mt-3 text-sm text-red-600">{formatError()}</p>
      </main>
    )
  }
}
