import { render, screen } from "@testing-library/react"
import { ArticleCreatedNotice } from "./article-created-notice"

describe("ArticleCreatedNotice", () => {
  it("created が false のときは表示しない", () => {
    const scrollTo = vi.fn()
    vi.stubGlobal("scrollTo", scrollTo)

    const { container } = render(<ArticleCreatedNotice created={false} />)

    expect(container).toBeEmptyDOMElement()
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it("created が true のときは通知を表示して先頭へスクロールする", () => {
    const scrollTo = vi.fn()
    vi.stubGlobal("scrollTo", scrollTo)

    render(<ArticleCreatedNotice created />)

    expect(
      screen.getByText("記事を作成しました。続けて編集できます。"),
    ).toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" })
  })
})
