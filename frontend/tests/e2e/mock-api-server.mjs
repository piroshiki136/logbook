import { createServer } from "node:http"

const PORT = Number(process.env.MOCK_API_PORT ?? 4010)

const articles = Array.from({ length: 12 }, (_, index) => {
  const id = index + 1
  const day = String(id).padStart(2, "0")
  const iso = `2026-01-${day}T09:00:00Z`
  return {
    id,
    slug: `post-${id}`,
    title: `Post ${id}`,
    category: id % 2 === 0 ? "frontend" : "backend",
    tags: id % 2 === 0 ? ["nextjs", "testing"] : ["fastapi", "testing"],
    content: `# Post ${id}\n\n本文 ${id}`,
    createdAt: iso,
    publishedAt: iso,
    updatedAt: iso,
    isDraft: false,
  }
})

const json = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
  res.end(JSON.stringify(body))
}

const ok = (res, data) => json(res, 200, { success: true, data })

const notFound = (res, message = "Not found") =>
  json(res, 404, {
    error: {
      code: "NOT_FOUND",
      message,
    },
  })

const server = createServer((req, res) => {
  if (!req.url) {
    notFound(res)
    return
  }

  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  const pathname = url.pathname

  if (req.method === "GET" && pathname === "/api/articles") {
    const rawPage = Number(url.searchParams.get("page"))
    const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1
    const rawLimit = Number(url.searchParams.get("limit"))
    const limit = Number.isFinite(rawLimit) && rawLimit >= 1 ? rawLimit : 10

    const start = (page - 1) * limit
    const items = articles.slice(start, start + limit).map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      category: article.category,
      tags: article.tags,
      createdAt: article.createdAt,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      isDraft: article.isDraft,
    }))

    ok(res, {
      items,
      total: articles.length,
      page,
      limit,
    })
    return
  }

  const prevNextMatch = pathname.match(/^\/api\/articles\/(\d+)\/prev-next$/)
  if (req.method === "GET" && prevNextMatch) {
    const id = Number(prevNextMatch[1])
    const currentIndex = articles.findIndex((article) => article.id === id)
    if (currentIndex === -1) {
      notFound(res, "Article not found")
      return
    }

    const prev = currentIndex > 0 ? articles[currentIndex - 1] : null
    const next = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null

    ok(res, {
      prev: prev
        ? {
            id: prev.id,
            slug: prev.slug,
            title: prev.title,
            createdAt: prev.createdAt,
            publishedAt: prev.publishedAt,
            isDraft: prev.isDraft,
          }
        : null,
      next: next
        ? {
            id: next.id,
            slug: next.slug,
            title: next.title,
            createdAt: next.createdAt,
            publishedAt: next.publishedAt,
            isDraft: next.isDraft,
          }
        : null,
    })
    return
  }

  const detailMatch = pathname.match(/^\/api\/articles\/([^/]+)$/)
  if (req.method === "GET" && detailMatch) {
    const slug = detailMatch[1]
    const article = articles.find((item) => item.slug === slug)
    if (!article) {
      notFound(res, "Article not found")
      return
    }
    ok(res, article)
    return
  }

  notFound(res)
})

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock-api] listening on http://127.0.0.1:${PORT}`)
})
