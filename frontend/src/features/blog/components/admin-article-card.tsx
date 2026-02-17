import ArticleCardBase from "./article-card-base"

type AdminArticleCardProps = {
  id: number
  title: string
  category: string
  tags: string[]
  createdAt: string
  isDraft: boolean
  maxTags?: number
}

export function AdminArticleCard(props: AdminArticleCardProps) {
  const { id, title, category, tags, createdAt, isDraft, maxTags } = props
  const statusLabel = isDraft ? "非公開" : "公開済み"
  const statusClassName = isDraft
    ? "rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
    : "rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"

  return (
    <ArticleCardBase
      id={id}
      href={`/admin/articles/${id}`}
      title={title}
      category={category}
      tags={tags}
      maxTags={maxTags}
      dateValue={createdAt}
      metaPrefix={
        <span className="inline-flex items-center gap-2">
          <span className={statusClassName}>{statusLabel}</span>
        </span>
      }
    />
  )
}
