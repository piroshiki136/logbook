import { render, screen } from "@testing-library/react"
import { ArticlesPagination } from "./articles-pagination"

describe("ArticlesPagination", () => {
  it("総ページ数が 1 以下なら表示しない", () => {
    const { container } = render(
      <ArticlesPagination currentPage={1} totalPages={1} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it("先頭ページでは最初/前へを無効化し、次へ/最後はリンク表示する", () => {
    render(<ArticlesPagination currentPage={1} totalPages={3} />)

    expect(screen.getByText("最初").closest("span")).toHaveAttribute(
      "aria-disabled",
      "true",
    )
    expect(screen.getByText("前へ").closest("span")).toHaveAttribute(
      "aria-disabled",
      "true",
    )

    expect(screen.getByRole("link", { name: "次のページへ" })).toHaveAttribute(
      "href",
      "/articles?page=2",
    )
    expect(
      screen.getByRole("link", { name: "最後のページへ" }),
    ).toHaveAttribute("href", "/articles?page=3")
  })

  it("末尾ページでは次へ/最後を無効化し、現在ページを補正する", () => {
    render(
      <ArticlesPagination currentPage={9} totalPages={3} pathname="/blog" />,
    )

    expect(screen.getByText("現在 3 / 全 3 ページ")).toBeInTheDocument()
    expect(screen.getByText("次へ").closest("span")).toHaveAttribute(
      "aria-disabled",
      "true",
    )
    expect(screen.getByText("最後").closest("span")).toHaveAttribute(
      "aria-disabled",
      "true",
    )
    expect(
      screen.getByRole("link", { name: "最初のページへ" }),
    ).toHaveAttribute("href", "/blog?page=1")
    expect(screen.getByRole("link", { name: "前のページへ" })).toHaveAttribute(
      "href",
      "/blog?page=2",
    )
  })

  it("buildHref を優先してリンクを生成する", () => {
    const buildHref = vi.fn(
      (page: number) => `/articles?tags=nextjs&page=${page}`,
    )

    render(
      <ArticlesPagination
        currentPage={2}
        totalPages={4}
        buildHref={buildHref}
      />,
    )

    expect(
      screen.getByRole("link", { name: "最初のページへ" }),
    ).toHaveAttribute("href", "/articles?tags=nextjs&page=1")
    expect(screen.getByRole("link", { name: "次のページへ" })).toHaveAttribute(
      "href",
      "/articles?tags=nextjs&page=3",
    )
    expect(buildHref).toHaveBeenCalled()
  })

  it("currentPage が非数の場合は 1 に補正する", () => {
    render(<ArticlesPagination currentPage={Number.NaN} totalPages={3} />)

    expect(screen.getByText("現在 1 / 全 3 ページ")).toBeInTheDocument()
    expect(screen.getByText("最初").closest("span")).toHaveAttribute(
      "aria-disabled",
      "true",
    )
    expect(screen.getByText("前へ").closest("span")).toHaveAttribute(
      "aria-disabled",
      "true",
    )
  })
})
