import { apiFetch } from "./client"
import type { Tag } from "./types"

export const getTags = async (): Promise<Tag[]> => {
  return apiFetch<Tag[]>("/api/tags")
}
