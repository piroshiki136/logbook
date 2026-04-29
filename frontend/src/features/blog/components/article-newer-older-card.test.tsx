import { render, screen } from "@testing-library/react"
import type { AnchorHTMLAttributes, ReactNode } from "react"
import { vi } from "vitest"
import { ArticleNewerOlderCard } from "./article-newer-older-card"

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  },
}))

describe("ArticleNewerOlderCard", () => {
  it("dateValue がない場合は日付を表示しない", () => {
    render(
      <ArticleNewerOlderCard
        id={10}
        href="/articles/no-date"
        label="新しい記事"
        title="No Date Post"
      />,
    )

    expect(screen.getByText("No Date Post")).toBeInTheDocument()
    expect(screen.queryByText(/年\d{2}月\d{2}日/)).not.toBeInTheDocument()
  })
})
