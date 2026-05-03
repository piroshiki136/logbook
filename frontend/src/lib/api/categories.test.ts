const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}))

vi.mock("./client", () => ({
  apiFetch: mocks.apiFetch,
}))

import { createCategory, getCategories } from "./categories"

describe("categories api client", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("カテゴリ一覧を取得する", async () => {
    mocks.apiFetch.mockResolvedValue([])

    await getCategories()

    expect(mocks.apiFetch).toHaveBeenCalledWith("/api/categories")
  })

  it("カテゴリ作成で name と token を渡す", async () => {
    mocks.apiFetch.mockResolvedValue({})

    await createCategory({ name: "Backend" }, "token")

    expect(mocks.apiFetch).toHaveBeenCalledWith("/api/categories", {
      method: "POST",
      body: { name: "Backend" },
      token: "token",
    })
  })
})
