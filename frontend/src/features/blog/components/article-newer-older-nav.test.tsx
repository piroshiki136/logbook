import { render, screen } from "@testing-library/react"
import type { AnchorHTMLAttributes, ReactNode } from "react"
import { vi } from "vitest"
import { ArticleNewerOlderNav } from "./article-newer-older-nav"

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

const newer = {
  id: 1,
  slug: "first-post",
  title: "First Post",
  createdAt: "2026-01-01T00:00:00Z",
  publishedAt: "2026-01-01T00:00:00Z",
  isDraft: false,
}

const older = {
  id: 3,
  slug: "third-post",
  title: "Third Post",
  createdAt: "2026-01-03T00:00:00Z",
  publishedAt: "2026-01-03T00:00:00Z",
  isDraft: false,
}

describe("ArticleNewerOlderNav", () => {
  it("新旧記事がなければ表示しない", () => {
    const { container } = render(
      <ArticleNewerOlderNav newer={null} older={null} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it("新しい記事のみを表示できる", () => {
    render(<ArticleNewerOlderNav newer={newer} older={null} />)

    expect(screen.getByRole("navigation", { name: "新旧の記事" })).toBeVisible()
    expect(screen.getByText("新しい記事")).toBeInTheDocument()
    expect(screen.queryByText("古い記事")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /First Post/ })).toHaveAttribute(
      "href",
      "/articles/first-post",
    )
  })

  it("新旧記事が両方ある場合は両方表示する", () => {
    render(<ArticleNewerOlderNav newer={newer} older={older} />)

    expect(screen.getByText("新しい記事")).toBeInTheDocument()
    expect(screen.getByText("古い記事")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Third Post/ })).toHaveAttribute(
      "href",
      "/articles/third-post",
    )
  })

  it("publishedAt が null の場合は createdAt を表示に使う", () => {
    render(
      <ArticleNewerOlderNav
        newer={{ ...newer, publishedAt: null }}
        older={{ ...older, publishedAt: null }}
      />,
    )

    expect(screen.getByText("2026年01月01日")).toBeInTheDocument()
    expect(screen.getByText("2026年01月03日")).toBeInTheDocument()
  })
})
