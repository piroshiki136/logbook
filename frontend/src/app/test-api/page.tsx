import { getArticle, getArticlePrevNext, getArticles } from "@/lib/api/articles"
import { getHealth } from "@/lib/api/health"

export default async function Page() {
  const health = await getHealth()
  const articles = await getArticles({ limit: 3 })
  const firstArticle = articles.items[0]
  const articleDetail = firstArticle
    ? await getArticle(firstArticle.slug)
    : null
  const prevNext = firstArticle
    ? await getArticlePrevNext(firstArticle.id)
    : null

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Next.js ⇔ FastAPI 接続テスト</h1>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Health API</h2>
        <pre className="mt-3">{JSON.stringify(health, null, 2)}</pre>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Articles API</h2>
        <pre className="mt-3">{JSON.stringify(articles, null, 2)}</pre>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Article Detail API</h2>
        <pre className="mt-3">{JSON.stringify(articleDetail, null, 2)}</pre>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Article Prev/Next API</h2>
        <pre className="mt-3">{JSON.stringify(prevNext, null, 2)}</pre>
      </section>
    </div>
  )
}
