import { render, screen } from "@testing-library/react"
import type { AnchorHTMLAttributes, ReactNode } from "react"
import { vi } from "vitest"
import { ArticlePrevNextCard } from "./article-prev-next-card"

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string | { pathname?: string }
    children: ReactNode
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const resolvedHref = typeof href === "string" ? href : (href.pathname ?? "")
    return (
      <a href={resolvedHref} {...props}>
        {children}
      </a>
    )
  },
}))

describe("ArticlePrevNextCard", () => {
  it("dateValue がない場合は日付を表示しない", () => {
    render(
      <ArticlePrevNextCard
        id={10}
        href="/articles/no-date"
        label="次の記事"
        title="No Date Post"
      />,
    )

    expect(screen.getByText("No Date Post")).toBeInTheDocument()
    expect(screen.queryByText(/年\d{2}月\d{2}日/)).not.toBeInTheDocument()
  })
})
