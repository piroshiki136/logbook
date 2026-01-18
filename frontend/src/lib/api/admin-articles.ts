import { apiFetch } from "./client"
import type {
  ArticleDetail,
  ArticleListItem,
  ArticlePrevNext,
  CreateArticleInput,
  Paginated,
  UpdateArticleInput,
} from "./types"

type AdminArticleListParams = {
  page?: number
  limit?: number
  tags?: string[]
  categories?: string[]
  draft?: boolean
}

const buildListParams = (params: AdminArticleListParams = {}) => {
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

export const getAdminArticles = async (
  params: AdminArticleListParams,
  token: string,
): Promise<Paginated<ArticleListItem>> => {
  const query = buildListParams(params)
  return apiFetch<Paginated<ArticleListItem>>(`/api/articles${query}`, {
    token,
  })
}

export const getAdminArticle = async (
  slug: string,
  token: string,
): Promise<ArticleDetail> => {
  return apiFetch<ArticleDetail>(`/api/articles/${slug}`, { token })
}

export const getAdminArticlePrevNext = async (
  articleId: number,
  token: string,
): Promise<ArticlePrevNext> => {
  return apiFetch<ArticlePrevNext>(`/api/articles/${articleId}/prev-next`, {
    token,
  })
}

export const createAdminArticle = async (
  payload: CreateArticleInput,
  token: string,
): Promise<ArticleDetail> => {
  return apiFetch<ArticleDetail>("/api/articles", {
    method: "POST",
    body: payload,
    token,
  })
}

export const updateAdminArticle = async (
  articleId: number,
  payload: UpdateArticleInput,
  token: string,
): Promise<ArticleDetail> => {
  return apiFetch<ArticleDetail>(`/api/articles/${articleId}`, {
    method: "PATCH",
    body: payload,
    token,
  })
}

export const deleteAdminArticle = async (
  articleId: number,
  token: string,
): Promise<void> => {
  await apiFetch(`/api/articles/${articleId}`, {
    method: "DELETE",
    token,
  })
}
