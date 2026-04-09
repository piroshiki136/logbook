import { ApiError } from "@/lib/api/client"
import { createArticleAction } from "./create-article-action"

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
  createAdminArticle: vi.fn(),
  getAdminToken: vi.fn(),
}))

vi.mock("server-only", () => ({}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}))

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}))

vi.mock("@/lib/api/admin-articles", () => ({
  createAdminArticle: mocks.createAdminArticle,
}))

vi.mock("@/lib/api/admin-auth", () => ({
  getAdminToken: mocks.getAdminToken,
}))

describe("createArticleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("FormData を API 向け payload に変換して記事を作成し、編集画面へ遷移する", async () => {
    mocks.getAdminToken.mockResolvedValue("token")
    mocks.createAdminArticle.mockResolvedValue({ id: 42 })
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`NEXT_REDIRECT:${path}`)
    })

    const formData = new FormData()
    formData.set("title", " New title ")
    formData.set("slug", "")
    formData.set("content", " Body ")
    formData.set("category", "backend")
    formData.set("tags", "nextjs, fastapi,  , testing")
    formData.set("isDraft", "true")

    await expect(
      createArticleAction({ ok: false, message: "" }, formData),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/articles/42/edit")

    expect(mocks.getAdminToken).toHaveBeenCalled()
    expect(mocks.createAdminArticle).toHaveBeenCalledWith(
      {
        title: "New title",
        slug: undefined,
        content: "Body",
        category: "backend",
        tags: ["nextjs", "fastapi", "testing"],
        isDraft: true,
      },
      "token",
    )
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/articles")
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/articles/42/edit")
  })

  it("API エラー時はメッセージを返す", async () => {
    mocks.getAdminToken.mockResolvedValue("token")
    mocks.createAdminArticle.mockRejectedValue(
      new ApiError("REQUEST_FAILED", "作成に失敗しました", 400),
    )
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`NEXT_REDIRECT:${path}`)
    })

    const formData = new FormData()
    formData.set("title", "Title")
    formData.set("slug", "slug")
    formData.set("content", "Body")
    formData.set("category", "backend")
    formData.set("tags", "")
    formData.set("isDraft", "false")

    const result = await createArticleAction(
      { ok: false, message: "" },
      formData,
    )

    expect(result).toEqual({ ok: false, message: "作成に失敗しました" })
  })
})
