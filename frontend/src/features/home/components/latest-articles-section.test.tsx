import { render, screen } from "@testing-library/react"
import type { AnchorHTMLAttributes, ReactNode } from "react"
import { vi } from "vitest"
import { LatestArticlesSection } from "./latest-articles-section"

const mocks = vi.hoisted(() => ({
  getPublicArticles: vi.fn(),
}))

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string | { pathname?: string }
    children: ReactNode
  } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) => {
    const resolvedHref = typeof href === "string" ? href : (href.pathname ?? "")
    return (
      <a href={resolvedHref} {...props}>
        {children}
      </a>
    )
  },
}))

vi.mock("@/lib/api/articles", () => ({
  getPublicArticles: mocks.getPublicArticles,
}))

vi.mock("@/features/blog", () => ({
  PublicArticleCard: ({ title, slug }: { title: string; slug: string }) => (
    <article>
      <a href={`/articles/${slug}`}>{title}</a>
    </article>
  ),
}))

describe("LatestArticlesSection", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it("最新記事取得に revalidate 用の fetch オプションを渡す", async () => {
    mocks.getPublicArticles.mockResolvedValue({
      items: [
        {
          id: 1,
          slug: "first-post",
          title: "First Post",
          category: "backend",
          tags: ["fastapi"],
          createdAt: "2026-04-10T00:00:00Z",
          publishedAt: "2026-04-10T00:00:00Z",
          updatedAt: "2026-04-10T00:00:00Z",
          isDraft: false,
        },
      ],
      total: 1,
      page: 1,
      limit: 3,
    })

    render(await LatestArticlesSection())

    expect(mocks.getPublicArticles).toHaveBeenCalledWith(
      { limit: 3 },
      {
        cache: "force-cache",
        next: { revalidate: 300 },
      },
    )
    expect(
      screen.getByRole("heading", { name: "最新記事" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "First Post" })).toHaveAttribute(
      "href",
      "/articles/first-post",
    )
  })

  it("取得失敗時はエラーメッセージを表示する", async () => {
    mocks.getPublicArticles.mockRejectedValue(new Error("REQUEST_FAILED"))

    render(await LatestArticlesSection())

    expect(
      screen.getByText(
        "最新記事の取得に失敗しました。しばらくしてから再度お試しください。",
      ),
    ).toBeInTheDocument()
  })
})
