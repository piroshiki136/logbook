import { fireEvent, render, screen } from "@testing-library/react"
import Page from "./error"

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
    children: React.ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe("app error page", () => {
  it("利用者向けのエラー文言と導線を表示する", () => {
    render(<Page error={new Error("boom")} reset={vi.fn()} />)

    expect(
      screen.getByRole("heading", { name: "現在エラーが発生しています" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "記事一覧へ戻る" }),
    ).toHaveAttribute("href", "/articles")
    expect(screen.getByRole("link", { name: "トップへ戻る" })).toHaveAttribute(
      "href",
      "/",
    )
  })

  it("再試行ボタンで reset を呼ぶ", () => {
    const reset = vi.fn()

    render(<Page error={new Error("boom")} reset={reset} />)

    fireEvent.click(screen.getByRole("button", { name: "もう一度試す" }))

    expect(reset).toHaveBeenCalledOnce()
  })
})
