import { notFound } from "next/navigation"
import { ArticleDetailDateTime } from "@/features/blog/components/article-detail-datetime"
import { ArticlePrevNextNav } from "@/features/blog/components/article-prev-next-nav"
import { MarkdownContent } from "@/features/blog/components/markdown-content"
import { getArticle, getArticlePrevNext } from "@/lib/api/articles"
import { ApiError } from "@/lib/api/client"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: Props) {
  const { slug } = await params

  try {
    const article = await getArticle(slug)
    const prevNext = await getArticlePrevNext(article.id)

    return (
      <article className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">{article.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <ArticleDetailDateTime
            className="shrink-0"
            value={article.publishedAt ?? article.createdAt}
          />
          <span aria-hidden="true">・</span>
          <span className="shrink-0">{article.category}</span>
        </div>

        {article.tags.length > 0 ? (
          <ul
            className="mt-4 flex flex-wrap items-center gap-2"
            aria-label="タグ一覧"
          >
            {article.tags.map((tag) => (
              <li key={tag}>
                <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <MarkdownContent content={article.content} className="mt-8" />
        <ArticlePrevNextNav prev={prevNext.prev} next={prevNext.next} />
      </article>
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound()
    }
    throw error
  }
}
