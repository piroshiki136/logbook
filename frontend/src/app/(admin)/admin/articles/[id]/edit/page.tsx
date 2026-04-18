import { notFound } from "next/navigation"
import {
  ArticleCreatedNotice,
  ArticleEditorForm,
  updateArticleAction,
} from "@/features/admin"
import { getAdminArticleById } from "@/lib/api/admin-articles"
import { getAdminToken } from "@/lib/api/admin-auth"
import { getCategories } from "@/lib/api/categories"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ created?: string }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const articleId = Number(id)
  const created = resolvedSearchParams?.created === "1"

  if (!Number.isInteger(articleId) || articleId <= 0) {
    notFound()
  }

  const token = await getAdminToken()
  const [article, categories] = await Promise.all([
    getAdminArticleById(articleId, token),
    getCategories(),
  ])

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">記事編集</h1>
          <p className="text-sm text-muted-foreground">
            管理画面では記事識別子に id を使用します。
          </p>
        </header>

        <ArticleCreatedNotice created={created} />

        <section className="rounded-xl border p-6">
          <div className="mb-6 flex flex-col gap-1 border-b pb-4">
            <p className="text-sm font-medium">記事 ID: {article.id}</p>
            <p className="text-muted-foreground text-sm">
              最終更新: {new Date(article.updatedAt).toLocaleString("ja-JP")}
            </p>
          </div>

          <ArticleEditorForm
            article={article}
            categories={categories}
            action={updateArticleAction}
          />
        </section>
      </div>
    </main>
  )
}
