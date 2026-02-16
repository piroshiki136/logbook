import ArticleCardBase from "./article-card-base"

type PublicArticleCardProps = {
  id: number
  slug: string
  title: string
  category: string
  tags: string[]
  publishedAt: string
  maxTags?: number
}

const formatPublishedDate = (publishedAt: string) => {
  const date = new Date(publishedAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}年${month}月${day}日`
}

export function PublicArticleCard(props: PublicArticleCardProps) {
  const { id, slug, title, category, tags, publishedAt, maxTags } = props

  return (
    <ArticleCardBase
      id={id}
      slug={slug}
      title={title}
      category={category}
      tags={tags}
      maxTags={maxTags}
      meta={formatPublishedDate(publishedAt)}
    />
  )
}
