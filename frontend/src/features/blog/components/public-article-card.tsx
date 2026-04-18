import { ArticleCardBase } from "./article-card-base"

type PublicArticleCardProps = {
  id: number
  slug: string
  title: string
  category: string
  tags: string[]
  updatedAt: string
  maxTags?: number
}

export function PublicArticleCard(props: PublicArticleCardProps) {
  const { id, slug, title, category, tags, updatedAt, maxTags } = props

  return (
    <ArticleCardBase
      id={id}
      href={`/articles/${slug}`}
      title={title}
      category={category}
      tags={tags}
      maxTags={maxTags}
      dateValue={updatedAt}
    />
  )
}
