import { apiFetch } from "./client"

describe("apiFetch", () => {
  const originalApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.com/_/backend"
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: vi.fn().mockResolvedValue({ success: true, data: { ok: true } }),
      }),
    )
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBaseUrl
    vi.unstubAllGlobals()
  })

  it("base URL のパスを維持して API URL を組み立てる", async () => {
    await apiFetch("/api/articles")

    expect(fetch).toHaveBeenCalledWith(
      new URL("https://example.com/_/backend/api/articles"),
      expect.any(Object),
    )
  })
})
