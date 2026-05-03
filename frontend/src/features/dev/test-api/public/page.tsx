import {
  getArticle,
  getArticleNewerOlder,
  getPublicArticles,
} from "@/lib/api/articles"
import { getHealth } from "@/lib/api/health"

export default async function Page() {
  const health = await getHealth()
  const articles = await getPublicArticles({ limit: 3 })
  const firstArticle = articles.items[0]
  const articleDetail = firstArticle
    ? await getArticle(firstArticle.slug)
    : null
  const newerOlder = firstArticle
    ? await getArticleNewerOlder(firstArticle.id)
    : null

  return (
    <div className="p-6">
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
        <h2 className="text-xl font-semibold">Article Newer/Older API</h2>
        <pre className="mt-3">{JSON.stringify(newerOlder, null, 2)}</pre>
      </section>
    </div>
  )
}
