import { ApiError } from "@/lib/api/client"
import { updateArticleAction } from "./update-article-action"

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  getAdminArticleById: vi.fn(),
  updateAdminArticle: vi.fn(),
  getAdminToken: vi.fn(),
}))

vi.mock("server-only", () => ({}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}))

vi.mock("@/lib/api/admin-articles", () => ({
  getAdminArticleById: mocks.getAdminArticleById,
  updateAdminArticle: mocks.updateAdminArticle,
}))

vi.mock("@/lib/api/admin-auth", () => ({
  getAdminToken: mocks.getAdminToken,
}))

describe("updateArticleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("FormData を API 向け payload に変換して記事を更新する", async () => {
    mocks.getAdminToken.mockResolvedValue("token")
    mocks.getAdminArticleById.mockResolvedValue({ slug: "old-slug" })
    mocks.updateAdminArticle.mockResolvedValue({ slug: "updated-slug" })

    const formData = new FormData()
    formData.set("id", "42")
    formData.set("title", " Updated title ")
    formData.set("slug", "updated-slug")
    formData.set("content", " Updated body ")
    formData.set("category", "backend")
    formData.set("tags", "nextjs, fastapi,  , testing")
    formData.set("isDraft", "true")

    const result = await updateArticleAction(
      { ok: false, message: "" },
      formData,
    )

    expect(mocks.getAdminToken).toHaveBeenCalled()
    expect(mocks.getAdminArticleById).toHaveBeenCalledWith(42, "token")
    expect(mocks.updateAdminArticle).toHaveBeenCalledWith(
      42,
      {
        title: "Updated title",
        slug: "updated-slug",
        content: "Updated body",
        category: "backend",
        tags: ["nextjs", "fastapi", "testing"],
        isDraft: true,
      },
      "token",
    )
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/articles")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/articles/42/edit")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "page")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/articles", "page")
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/articles/old-slug",
      "page",
    )
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/articles/updated-slug",
      "page",
    )
    expect(mocks.revalidateTag).toHaveBeenCalledWith("articles", { expire: 0 })
    expect(mocks.revalidateTag).toHaveBeenCalledWith("article-neighbors", {
      expire: 0,
    })
    expect(mocks.revalidateTag).toHaveBeenCalledWith("article:old-slug", {
      expire: 0,
    })
    expect(mocks.revalidateTag).toHaveBeenCalledWith("article:updated-slug", {
      expire: 0,
    })
    expect(result).toEqual({ ok: true, message: "記事を更新しました" })
  })

  it("不正な id は更新せずエラーを返す", async () => {
    const formData = new FormData()
    formData.set("id", "abc")

    const result = await updateArticleAction(
      { ok: false, message: "" },
      formData,
    )

    expect(mocks.getAdminToken).not.toHaveBeenCalled()
    expect(mocks.getAdminArticleById).not.toHaveBeenCalled()
    expect(mocks.updateAdminArticle).not.toHaveBeenCalled()
    expect(result).toEqual({ ok: false, message: "記事IDが不正です" })
  })

  it("API エラー時はメッセージを返す", async () => {
    mocks.getAdminToken.mockResolvedValue("token")
    mocks.getAdminArticleById.mockResolvedValue({ slug: "slug" })
    mocks.updateAdminArticle.mockRejectedValue(
      new ApiError("REQUEST_FAILED", "更新に失敗しました", 400),
    )

    const formData = new FormData()
    formData.set("id", "42")
    formData.set("title", "Title")
    formData.set("slug", "slug")
    formData.set("content", "Body")
    formData.set("category", "backend")
    formData.set("tags", "")
    formData.set("isDraft", "false")

    const result = await updateArticleAction(
      { ok: false, message: "" },
      formData,
    )

    expect(result).toEqual({ ok: false, message: "更新に失敗しました" })
  })

  it("認証トークン取得に失敗した場合は汎用メッセージを返し、更新しない", async () => {
    mocks.getAdminToken.mockRejectedValue(new Error("AUTH_REQUIRED"))

    const formData = new FormData()
    formData.set("id", "42")
    formData.set("title", "Title")
    formData.set("slug", "slug")
    formData.set("content", "Body")
    formData.set("category", "backend")
    formData.set("isDraft", "true")

    const result = await updateArticleAction(
      { ok: false, message: "" },
      formData,
    )

    expect(mocks.getAdminArticleById).not.toHaveBeenCalled()
    expect(mocks.updateAdminArticle).not.toHaveBeenCalled()
    expect(result).toEqual({ ok: false, message: "記事の更新に失敗しました" })
  })

  it("認証エラーをそのままフォームに返す", async () => {
    mocks.getAdminToken.mockResolvedValue("token")
    mocks.getAdminArticleById.mockResolvedValue({ slug: "slug" })
    mocks.updateAdminArticle.mockRejectedValue(
      new ApiError("AUTH_FORBIDDEN", "管理者権限がありません", 403),
    )

    const formData = new FormData()
    formData.set("id", "42")
    formData.set("title", "Title")
    formData.set("slug", "slug")
    formData.set("content", "Body")
    formData.set("category", "backend")
    formData.set("isDraft", "false")

    const result = await updateArticleAction(
      { ok: false, message: "" },
      formData,
    )

    expect(result).toEqual({ ok: false, message: "管理者権限がありません" })
  })
})
