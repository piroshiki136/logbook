import { apiFetch } from "./client"
import type { Category } from "./types"

export const getCategories = async (): Promise<Category[]> => {
  return apiFetch<Category[]>("/api/categories")
}
