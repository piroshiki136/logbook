"use server"

import { revalidatePath } from "next/cache"
import { getAdminToken } from "@/lib/api/admin-auth"
import { createCategory } from "@/lib/api/categories"
import { ApiError } from "@/lib/api/client"
import type { Category } from "@/lib/api/types"

export type CreateCategoryActionState = {
  ok: boolean
  message: string
  category: Category | null
}

const getString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : ""

export const createCategoryAction = async (
  formData: FormData,
): Promise<CreateCategoryActionState> => {
  const name = getString(formData.get("name"))

  if (!name) {
    return {
      ok: false,
      message: "カテゴリ名は必須です",
      category: null,
    }
  }

  if (name.length > 100) {
    return {
      ok: false,
      message: "カテゴリ名は100文字以内で入力してください",
      category: null,
    }
  }

  try {
    const token = await getAdminToken()
    const category = await createCategory({ name }, token)
    revalidatePath("/admin/articles/new")

    return {
      ok: true,
      message: "カテゴリを追加しました",
      category,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        message: error.message,
        category: null,
      }
    }

    return {
      ok: false,
      message: "カテゴリの追加に失敗しました",
      category: null,
    }
  }
}
