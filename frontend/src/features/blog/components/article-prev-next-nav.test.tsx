import { render, screen } from "@testing-library/react"
import type { AnchorHTMLAttributes, ReactNode } from "react"
import { vi } from "vitest"
import { ArticlePrevNextNav } from "./article-prev-next-nav"

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

const prev = {
  id: 1,
  slug: "first-post",
  title: "First Post",
  createdAt: "2026-01-01T00:00:00Z",
  publishedAt: "2026-01-01T00:00:00Z",
  isDraft: false,
}

const next = {
  id: 3,
  slug: "third-post",
  title: "Third Post",
  createdAt: "2026-01-03T00:00:00Z",
  publishedAt: "2026-01-03T00:00:00Z",
  isDraft: false,
}

describe("ArticlePrevNextNav", () => {
  it("前後記事がなければ表示しない", () => {
    const { container } = render(<ArticlePrevNextNav prev={null} next={null} />)
    expect(container.firstChild).toBeNull()
  })

  it("前記事のみを表示できる", () => {
    render(<ArticlePrevNextNav prev={prev} next={null} />)

    expect(screen.getByRole("navigation", { name: "前後の記事" })).toBeVisible()
    expect(screen.getByText("次の記事")).toBeInTheDocument()
    expect(screen.queryByText("前の記事")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /First Post/ })).toHaveAttribute(
      "href",
      "/articles/first-post",
    )
  })

  it("前後記事が両方ある場合は両方表示する", () => {
    render(<ArticlePrevNextNav prev={prev} next={next} />)

    expect(screen.getByText("次の記事")).toBeInTheDocument()
    expect(screen.getByText("前の記事")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Third Post/ })).toHaveAttribute(
      "href",
      "/articles/third-post",
    )
  })

  it("publishedAt が null の場合は createdAt を表示に使う", () => {
    render(
      <ArticlePrevNextNav
        prev={{ ...prev, publishedAt: null }}
        next={{ ...next, publishedAt: null }}
      />,
    )

    expect(screen.getByText("2026年01月01日")).toBeInTheDocument()
    expect(screen.getByText("2026年01月03日")).toBeInTheDocument()
  })
})
