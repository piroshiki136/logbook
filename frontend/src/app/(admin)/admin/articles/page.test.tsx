import { render, screen } from "@testing-library/react"
import Page from "./page"

const mocks = vi.hoisted(() => ({
  getAdminToken: vi.fn(),
  getAdminArticles: vi.fn(),
}))

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) => <a href={href}>{children}</a>,
}))

vi.mock("@/lib/api/admin-auth", () => ({
  getAdminToken: mocks.getAdminToken,
}))

vi.mock("@/lib/api/admin-articles", () => ({
  getAdminArticles: mocks.getAdminArticles,
}))

vi.mock("@/features/blog", () => ({
  AdminArticleCard: ({
    title,
    isDraft,
  }: {
    title: string
    isDraft: boolean
  }) => (
    <article>
      <h2>{title}</h2>
      <span>{isDraft ? "draft" : "published"}</span>
    </article>
  ),
  ArticlesPagination: ({
    currentPage,
    totalPages,
    buildHref,
  }: {
    currentPage: number
    totalPages: number
    buildHref: (page: number) => string
  }) => (
    <nav>
      <span>{`page:${currentPage}/${totalPages}`}</span>
      <a href={buildHref(currentPage + 1)}>next</a>
    </nav>
  ),
}))

describe("/admin/articles page", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it("draft タブ選択時に認証付きで一覧を取得し、タブ href を描画する", async () => {
    mocks.getAdminToken.mockResolvedValue("token")
    mocks.getAdminArticles.mockResolvedValue({
      items: [
        {
          id: 1,
          title: "Draft article",
          category: "backend",
          tags: ["fastapi"],
          updatedAt: "2026-04-10T00:00:00Z",
          isDraft: true,
        },
      ],
      total: 21,
      page: 2,
      limit: 20,
    })

    render(
      await Page({
        searchParams: Promise.resolve({
          page: "2",
          draft: "true",
          tags: ["nextjs"],
        }),
      }),
    )

    expect(mocks.getAdminToken).toHaveBeenCalledOnce()
    expect(mocks.getAdminArticles).toHaveBeenCalledWith(
      { page: 2, limit: 20, draft: true },
      "token",
    )

    expect(
      screen.getByRole("heading", { name: "記事管理" }),
    ).toBeInTheDocument()
    expect(screen.getByText("件数: 21")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Draft article" }),
    ).toBeInTheDocument()

    expect(screen.getByRole("link", { name: "全記事" })).toHaveAttribute(
      "href",
      "/admin/articles?tags=nextjs",
    )
    expect(screen.getByRole("link", { name: "公開記事" })).toHaveAttribute(
      "href",
      "/admin/articles?tags=nextjs&draft=false",
    )
    expect(screen.getByRole("link", { name: "非公開" })).toHaveAttribute(
      "href",
      "/admin/articles?tags=nextjs&draft=true",
    )
    expect(screen.getByRole("link", { name: "next" })).toHaveAttribute(
      "href",
      "/admin/articles?draft=true&tags=nextjs&page=3",
    )
  })

  it("取得失敗時はエラーメッセージを表示する", async () => {
    mocks.getAdminToken.mockRejectedValue(new Error("AUTH_REQUIRED"))

    render(await Page({ searchParams: Promise.resolve(undefined) }))

    expect(screen.getByText("記事一覧の取得に失敗しました")).toBeInTheDocument()
  })
})
