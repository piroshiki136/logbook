import type { ArticleListItem } from "@/lib/api/types"

export const hasPublishedAt = (
  article: ArticleListItem,
): article is ArticleListItem & { publishedAt: string } =>
  article.publishedAt !== null
