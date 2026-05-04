export const PUBLIC_ARTICLES_REVALIDATE_SECONDS = 300
export const PUBLIC_ARTICLES_TAG = "articles"
export const PUBLIC_ARTICLE_NEIGHBORS_TAG = "article-neighbors"

export const getPublicArticleTag = (slug: string) => `article:${slug}`
