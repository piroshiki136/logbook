import { ApiError } from "@/lib/api/client"
import { createCategoryAction } from "./create-category-action"

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  createCategory: vi.fn(),
  getAdminToken: vi.fn(),
}))

vi.mock("server-only", () => ({}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}))

vi.mock("@/lib/api/categories", () => ({
  createCategory: mocks.createCategory,
}))

vi.mock("@/lib/api/admin-auth", () => ({
  getAdminToken: mocks.getAdminToken,
}))

describe("createCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("カテゴリ名だけでカテゴリを作成し、記事作成画面を再検証する", async () => {
    const category = {
      id: 1,
      name: "Backend",
      slug: "backend",
      color: null,
      icon: null,
    }
    mocks.getAdminToken.mockResolvedValue("token")
    mocks.createCategory.mockResolvedValue(category)

    const formData = new FormData()
    formData.set("name", " Backend ")

    const result = await createCategoryAction(formData)

    expect(mocks.getAdminToken).toHaveBeenCalled()
    expect(mocks.createCategory).toHaveBeenCalledWith(
      { name: "Backend" },
      "token",
    )
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/articles/new")
    expect(result).toEqual({
      ok: true,
      message: "カテゴリを追加しました",
      category,
    })
  })

  it("カテゴリ名が空の場合は API を呼ばない", async () => {
    const formData = new FormData()
    formData.set("name", " ")

    const result = await createCategoryAction(formData)

    expect(mocks.getAdminToken).not.toHaveBeenCalled()
    expect(mocks.createCategory).not.toHaveBeenCalled()
    expect(result).toEqual({
      ok: false,
      message: "カテゴリ名は必須です",
      category: null,
    })
  })

  it("カテゴリ名が長すぎる場合は API を呼ばない", async () => {
    const formData = new FormData()
    formData.set("name", "a".repeat(101))

    const result = await createCategoryAction(formData)

    expect(mocks.getAdminToken).not.toHaveBeenCalled()
    expect(mocks.createCategory).not.toHaveBeenCalled()
    expect(result).toEqual({
      ok: false,
      message: "カテゴリ名は100文字以内で入力してください",
      category: null,
    })
  })

  it("API エラー時はメッセージを返す", async () => {
    mocks.getAdminToken.mockResolvedValue("token")
    mocks.createCategory.mockRejectedValue(
      new ApiError(
        "CATEGORY_NAME_ALREADY_EXISTS",
        "同じ name のカテゴリが既に存在します",
        409,
      ),
    )

    const formData = new FormData()
    formData.set("name", "Backend")

    const result = await createCategoryAction(formData)

    expect(result).toEqual({
      ok: false,
      message: "同じ name のカテゴリが既に存在します",
      category: null,
    })
  })

  it("認証トークン取得に失敗した場合は汎用メッセージを返す", async () => {
    mocks.getAdminToken.mockRejectedValue(new Error("AUTH_REQUIRED"))

    const formData = new FormData()
    formData.set("name", "Backend")

    const result = await createCategoryAction(formData)

    expect(mocks.createCategory).not.toHaveBeenCalled()
    expect(result).toEqual({
      ok: false,
      message: "カテゴリの追加に失敗しました",
      category: null,
    })
  })
})
