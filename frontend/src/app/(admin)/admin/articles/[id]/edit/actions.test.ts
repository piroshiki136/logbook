import { ApiError } from "@/lib/api/client"
import { updateArticleAction } from "./actions"

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  updateAdminArticle: vi.fn(),
  getAdminToken: vi.fn(),
}))

vi.mock("server-only", () => ({}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}))

vi.mock("@/lib/api/admin-articles", () => ({
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
    mocks.updateAdminArticle.mockResolvedValue(undefined)

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
    expect(mocks.updateAdminArticle).not.toHaveBeenCalled()
    expect(result).toEqual({ ok: false, message: "記事IDが不正です" })
  })

  it("API エラー時はメッセージを返す", async () => {
    mocks.getAdminToken.mockResolvedValue("token")
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
})
