import { apiFetch } from "./client"
import type { Category, CreateCategoryInput } from "./types"

export const getCategories = async (): Promise<Category[]> => {
  return apiFetch<Category[]>("/api/categories")
}

export const createCategory = async (
  payload: CreateCategoryInput,
  token: string,
): Promise<Category> => {
  return apiFetch<Category>("/api/categories", {
    method: "POST",
    body: payload,
    token,
  })
}
