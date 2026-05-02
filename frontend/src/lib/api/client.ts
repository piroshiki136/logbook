import type { ApiErrorResponse, ApiSuccess } from "./types"

export class ApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.status = status
  }
}

type ApiFetchOptions = {
  method?: string
  headers?: HeadersInit
  body?: Record<string, unknown> | FormData
  token?: string
  cache?: RequestCache
  next?: {
    revalidate?: number
    tags?: string[]
  }
}

const isApiSuccess = <T>(value: unknown): value is ApiSuccess<T> => {
  if (typeof value !== "object" || value === null) {
    return false
  }
  return "success" in value && (value as { success: boolean }).success === true
}

const isApiError = (value: unknown): value is ApiErrorResponse => {
  if (typeof value !== "object" || value === null) {
    return false
  }
  return "error" in value
}

const buildUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set")
  }

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path

  return new URL(normalizedPath, normalizedBaseUrl)
}

export const apiFetch = async <T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> => {
  const url = buildUrl(path)
  const headers = new Headers(options.headers)

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`)
  }

  const isFormData = options.body instanceof FormData
  if (options.body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json")
  }

  const requestBody =
    options.body === undefined
      ? undefined
      : options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body)

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: requestBody,
    cache: options.cache ?? "no-store",
    next: options.next,
  })

  const contentType = response.headers.get("content-type") ?? ""
  const hasJson = contentType.includes("application/json")
  const body = hasJson ? await response.json() : null

  if (!response.ok) {
    if (isApiError(body)) {
      throw new ApiError(body.error.code, body.error.message, response.status)
    }
    throw new ApiError("REQUEST_FAILED", "Request failed", response.status)
  }

  if (isApiSuccess<T>(body)) {
    return body.data
  }

  return body as T
}
