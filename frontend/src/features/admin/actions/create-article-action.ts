"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { CreateArticleFormState } from "@/features/admin/components/create-article-form"
import { createAdminArticle } from "@/lib/api/admin-articles"
import { getAdminToken } from "@/lib/api/admin-auth"
import { ApiError } from "@/lib/api/client"
import { revalidatePublicArticleCache } from "@/lib/cache/public-article-revalidation"

const parseTags = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") return []
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

const getString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : ""

export const createArticleAction = async (
  _prevState: CreateArticleFormState,
  formData: FormData,
): Promise<CreateArticleFormState> => {
  const payload = {
    title: getString(formData.get("title")),
    slug: getString(formData.get("slug")) || undefined,
    content: getString(formData.get("content")),
    category: getString(formData.get("category")),
    tags: parseTags(formData.get("tags")),
    isDraft: getString(formData.get("isDraft")) === "true",
  }

  let articleId: number
  let articleSlug: string

  try {
    const token = await getAdminToken()
    const article = await createAdminArticle(payload, token)
    articleId = article.id
    articleSlug = article.slug
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        message: error.message,
      }
    }

    return {
      ok: false,
      message: "記事の作成に失敗しました",
    }
  }

  revalidatePath("/admin/articles")
  revalidatePublicArticleCache({ slug: articleSlug })
  redirect(`/admin/articles/${articleId}/edit?created=1`)
}
