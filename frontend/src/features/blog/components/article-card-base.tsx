import Link from "next/link"
import type { ReactNode } from "react"
import { formatArticleDate } from "../lib/format-article-date"

interface ArticleCardBaseProps {
  href: string
  title: string
  id: number
  category: string
  tags: string[]
  dateValue?: string
  metaPrefix?: ReactNode
  /** タグ表示数（デフォルト3） */
  maxTags?: number
}

export function ArticleCardBase(props: ArticleCardBaseProps) {
  const {
    href,
    title,
    id,
    category,
    tags,
    dateValue,
    metaPrefix,
    maxTags = 3,
  } = props
  const visibleTags = tags.slice(0, maxTags)
  const extraCount = Math.max(0, tags.length - visibleTags.length)
  const formattedDate = dateValue ? formatArticleDate(dateValue) : undefined

  return (
    <article className="group" data-article-id={String(id)}>
      <Link
        href={href}
        className="block rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`記事: ${title}`}
      >
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          {metaPrefix ? <span className="shrink-0">{metaPrefix}</span> : null}
          {formattedDate ? (
            <span className="shrink-0">{formattedDate}</span>
          ) : null}
          {metaPrefix || formattedDate ? (
            <span className="select-none" aria-hidden="true">
              •
            </span>
          ) : null}
          <span className="shrink-0">{category}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold leading-snug tracking-tight">
            {title}
          </h3>

          <span
            className="mt-0.5 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-foreground"
            aria-hidden="true"
          >
            →
          </span>
        </div>

        {visibleTags.length > 0 || extraCount > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}

            {extraCount > 0 ? (
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                +{extraCount}
              </span>
            ) : null}
          </div>
        ) : null}
      </Link>
    </article>
  )
}
