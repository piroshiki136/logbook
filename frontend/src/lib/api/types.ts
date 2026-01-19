export type ApiSuccess<T> = {
  success: true
  data: T
  message?: string | null
}

export type ApiErrorBody = {
  code: string
  message: string
}

export type ApiErrorResponse = {
  error: ApiErrorBody
}

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}

export type ArticleListItem = {
  id: number
  slug: string
  title: string
  category: string
  tags: string[]
  createdAt: string
  publishedAt: string | null
  updatedAt: string
  isDraft: boolean
}

export type ArticleDetail = ArticleListItem & {
  content: string
}

export type ArticleNeighbor = {
  id: number
  slug: string
  title: string
  createdAt: string
  publishedAt: string | null
  isDraft: boolean
}

export type ArticlePrevNext = {
  prev: ArticleNeighbor | null
  next: ArticleNeighbor | null
}

export type CreateArticleInput = {
  title: string
  slug?: string
  content: string
  category: string
  tags: string[]
  isDraft: boolean
}

export type UpdateArticleInput = Partial<CreateArticleInput>

export type Tag = {
  id: number
  name: string
  slug: string
}

export type Category = {
  id: number
  name: string
  slug: string
  color: string | null
  icon: string | null
}

export type UploadImageResponse = {
  url: string
}

export type HealthData = {
  status: string
}
