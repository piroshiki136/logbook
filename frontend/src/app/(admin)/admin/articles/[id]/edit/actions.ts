"use server"

import { revalidatePath } from "next/cache"
import {
  getAdminArticleById,
  updateAdminArticle,
} from "@/lib/api/admin-articles"
import { getAdminToken } from "@/lib/api/admin-auth"
import { ApiError } from "@/lib/api/client"
import { revalidatePublicArticleCache } from "@/lib/cache/public-article-revalidation"

export type EditArticleFormState = {
  ok: boolean
  message: string
}

const parseTags = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") return []
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

const getString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : ""

export const updateArticleAction = async (
  _prevState: EditArticleFormState,
  formData: FormData,
): Promise<EditArticleFormState> => {
  const idValue = getString(formData.get("id"))
  const articleId = Number(idValue)

  if (!Number.isInteger(articleId) || articleId <= 0) {
    return {
      ok: false,
      message: "記事IDが不正です",
    }
  }

  const payload = {
    title: getString(formData.get("title")),
    slug: getString(formData.get("slug")),
    content: getString(formData.get("content")),
    category: getString(formData.get("category")),
    tags: parseTags(formData.get("tags")),
    isDraft: getString(formData.get("isDraft")) === "true",
  }

  try {
    const token = await getAdminToken()
    const previousArticle = await getAdminArticleById(articleId, token)
    const article = await updateAdminArticle(articleId, payload, token)
    revalidatePath("/admin/articles")
    revalidatePath(`/admin/articles/${articleId}/edit`)
    revalidatePublicArticleCache({
      slug: article.slug,
      previousSlug: previousArticle.slug,
    })

    return {
      ok: true,
      message: "記事を更新しました",
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        message: error.message,
      }
    }

    return {
      ok: false,
      message: "記事の更新に失敗しました",
    }
  }
}
