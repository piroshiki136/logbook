import { apiFetch } from "./client"
import type {
  ArticleListItem,
  Paginated,
  PublicArticleDetail,
  PublicArticleListItem,
  PublicArticleNewerOlder,
} from "./types"

type PublicApiFetchOptions = {
  cache?: RequestCache
  next?: {
    revalidate?: number
    tags?: string[]
  }
}

type PublicArticleListParams = {
  page?: number
  limit?: number
  tags?: string[]
  categories?: string[]
}

type ArticleListParams = PublicArticleListParams & {
  draft?: boolean
}

const buildListParams = (params: ArticleListParams = {}) => {
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
  options: PublicApiFetchOptions = {},
): Promise<Paginated<PublicArticleListItem>> => {
  const query = buildListParams(params)
  return apiFetch<Paginated<PublicArticleListItem>>(`/api/articles${query}`, {
    cache: options.cache,
    next: options.next,
  })
}

export const getArticles = async (
  params: ArticleListParams = {},
): Promise<Paginated<ArticleListItem>> => {
  const query = buildListParams(params)
  return apiFetch<Paginated<ArticleListItem>>(`/api/articles${query}`)
}

export const getArticle = async (
  slug: string,
): Promise<PublicArticleDetail> => {
  return apiFetch<PublicArticleDetail>(`/api/articles/${slug}`)
}

export const getArticleNewerOlder = async (
  articleId: number,
): Promise<PublicArticleNewerOlder> => {
  return apiFetch<PublicArticleNewerOlder>(
    `/api/articles/${articleId}/newer-older`,
  )
}
