import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CreateArticleForm, createArticleAction } from "@/features/admin"
import { getCategories } from "@/lib/api/categories"

export default async function Page() {
  const categories = await getCategories()

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">記事作成</h1>
            <p className="text-sm text-muted-foreground">
              新規記事を作成すると、保存後に編集画面へ遷移します。
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Adminへ戻る</Link>
          </Button>
        </header>

        <section className="rounded-xl border p-6">
          <CreateArticleForm
            categories={categories}
            action={createArticleAction}
          />
        </section>
      </div>
    </main>
  )
}
