import { apiFetch } from "./client"
import type {
  ArticleDetail,
  ArticleListItem,
  ArticlePrevNext,
  Paginated,
  PublicArticleListItem,
} from "./types"

type PublicArticleListParams = {
  page?: number
  limit?: number
  tags?: string[]
  categories?: string[]
}

type ArticleListParams = PublicArticleListParams & {
  draft?: boolean
}

const buildListParams = (
  params: ArticleListParams | PublicArticleListParams = {},
) => {
  const searchParams = new URLSearchParams()

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page))
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit))
  }

  if (params.tags?.length) {
    for (const tag of params.tags) {
      searchParams.append("tags", tag)
    }
  }

  if (params.categories?.length) {
    for (const category of params.categories) {
      searchParams.append("categories", category)
    }
  }

  if (params.draft !== undefined) {
    searchParams.set("draft", String(params.draft))
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ""
}

export const getPublicArticles = async (
  params: PublicArticleListParams = {},
): Promise<Paginated<PublicArticleListItem>> => {
  const query = buildListParams(params)
  return apiFetch<Paginated<PublicArticleListItem>>(`/api/articles${query}`)
}

export const getArticles = async (
  params: ArticleListParams = {},
): Promise<Paginated<ArticleListItem>> => {
  const query = buildListParams(params)
  return apiFetch<Paginated<ArticleListItem>>(`/api/articles${query}`)
}

export const getArticle = async (slug: string): Promise<ArticleDetail> => {
  return apiFetch<ArticleDetail>(`/api/articles/${slug}`)
}

export const getArticlePrevNext = async (
  articleId: number,
): Promise<ArticlePrevNext> => {
  return apiFetch<ArticlePrevNext>(`/api/articles/${articleId}/prev-next`)
}
