import { ApiError } from "@/lib/api/client"
import { createArticleAction } from "./create-article-action"

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  redirect: vi.fn(),
  createAdminArticle: vi.fn(),
  getAdminToken: vi.fn(),
}))

vi.mock("server-only", () => ({}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
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
    mocks.createAdminArticle.mockResolvedValue({ id: 42, slug: "new-title" })
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
    ).rejects.toThrow("NEXT_REDIRECT:/admin/articles/42/edit?created=1")

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
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "page")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/articles", "page")
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/articles/new-title",
      "page",
    )
    expect(mocks.revalidateTag).toHaveBeenCalledWith("articles", { expire: 0 })
    expect(mocks.revalidateTag).toHaveBeenCalledWith("article-neighbors", {
      expire: 0,
    })
    expect(mocks.revalidateTag).toHaveBeenCalledWith("article:new-title", {
      expire: 0,
    })
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/admin/articles/42/edit?created=1",
    )
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

  it("認証トークン取得に失敗した場合は汎用メッセージを返し、API を呼ばない", async () => {
    mocks.getAdminToken.mockRejectedValue(new Error("AUTH_REQUIRED"))

    const formData = new FormData()
    formData.set("title", "Title")
    formData.set("slug", "slug")
    formData.set("content", "Body")
    formData.set("category", "backend")
    formData.set("isDraft", "true")

    const result = await createArticleAction(
      { ok: false, message: "" },
      formData,
    )

    expect(mocks.createAdminArticle).not.toHaveBeenCalled()
    expect(mocks.redirect).not.toHaveBeenCalled()
    expect(result).toEqual({ ok: false, message: "記事の作成に失敗しました" })
  })

  it("認証エラーをそのままフォームに返し、遷移しない", async () => {
    mocks.getAdminToken.mockResolvedValue("token")
    mocks.createAdminArticle.mockRejectedValue(
      new ApiError("AUTH_INVALID_TOKEN", "認証の有効期限が切れました", 401),
    )

    const formData = new FormData()
    formData.set("title", "Title")
    formData.set("slug", "slug")
    formData.set("content", "Body")
    formData.set("category", "backend")
    formData.set("isDraft", "false")

    const result = await createArticleAction(
      { ok: false, message: "" },
      formData,
    )

    expect(mocks.redirect).not.toHaveBeenCalled()
    expect(result).toEqual({
      ok: false,
      message: "認証の有効期限が切れました",
    })
  })
})
