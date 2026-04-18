const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}))

vi.mock("./client", () => ({
  apiFetch: mocks.apiFetch,
}))

import {
  createAdminArticle,
  deleteAdminArticle,
  getAdminArticleById,
  getAdminArticleNewerOlder,
  getAdminArticles,
  updateAdminArticle,
} from "./admin-articles"

describe("admin-articles api client", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("一覧取得で repeat 形式のクエリと token を渡す", async () => {
    mocks.apiFetch.mockResolvedValue({})

    await getAdminArticles(
      {
        page: 2,
        limit: 20,
        tags: ["nextjs", "fastapi"],
        categories: ["frontend", "backend"],
        draft: true,
      },
      "token",
    )

    expect(mocks.apiFetch).toHaveBeenCalledWith(
      "/api/articles?page=2&limit=20&tags=nextjs&tags=fastapi&categories=frontend&categories=backend&draft=true",
      {
        token: "token",
      },
    )
  })

  it("記事取得は by-id エンドポイントを利用する", async () => {
    mocks.apiFetch.mockResolvedValue({})

    await getAdminArticleById(42, "token")

    expect(mocks.apiFetch).toHaveBeenCalledWith("/api/articles/by-id/42", {
      token: "token",
    })
  })

  it("新旧記事取得は管理トークン付きで呼び出す", async () => {
    mocks.apiFetch.mockResolvedValue({})

    await getAdminArticleNewerOlder(42, "token")

    expect(mocks.apiFetch).toHaveBeenCalledWith("/api/articles/42/newer-older", {
      token: "token",
    })
  })

  it("作成・更新・削除で認証必須ハンドラを呼び出す", async () => {
    mocks.apiFetch.mockResolvedValue({})

    await createAdminArticle({ title: "Title" } as never, "token")
    await updateAdminArticle(42, { title: "Updated" } as never, "token")
    await deleteAdminArticle(42, "token")

    expect(mocks.apiFetch).toHaveBeenNthCalledWith(1, "/api/articles", {
      method: "POST",
      body: { title: "Title" },
      token: "token",
    })
    expect(mocks.apiFetch).toHaveBeenNthCalledWith(2, "/api/articles/42", {
      method: "PATCH",
      body: { title: "Updated" },
      token: "token",
    })
    expect(mocks.apiFetch).toHaveBeenNthCalledWith(3, "/api/articles/42", {
      method: "DELETE",
      token: "token",
    })
  })
})
