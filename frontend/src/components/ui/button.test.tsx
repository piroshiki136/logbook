import { render, screen } from "@testing-library/react"
import { Button } from "./button"

describe("Button", () => {
  it("asChild=false では button を描画する", () => {
    render(<Button>保存</Button>)
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument()
  })

  it("asChild=true では子要素に props を委譲する", () => {
    render(
      <Button asChild variant="outline" size="sm">
        <a href="/articles">記事一覧</a>
      </Button>,
    )

    const link = screen.getByRole("link", { name: "記事一覧" })
    expect(link).toHaveAttribute("href", "/articles")
    expect(link).toHaveAttribute("data-slot", "button")
    expect(link).toHaveAttribute("data-variant", "outline")
    expect(link).toHaveAttribute("data-size", "sm")
  })
})
