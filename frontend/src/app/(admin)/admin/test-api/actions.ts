"use server"

import { getAdminArticles } from "@/lib/api/admin-articles"
import { getAdminToken } from "@/lib/api/admin-auth"

export type TestApiState = {
  ok: boolean
  message: string
}

const formatError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }
  return "Request failed"
}

export const fetchAdminArticlesAction = async (
  _prevState: TestApiState,
  _formData: FormData,
): Promise<TestApiState> => {
  try {
    const token = await getAdminToken()
    const response = await getAdminArticles({ page: 1, limit: 1 }, token)
    return {
      ok: true,
      message: `total=${response.total}`,
    }
  } catch (error) {
    return {
      ok: false,
      message: formatError(error),
    }
  }
}
