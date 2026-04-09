import { fireEvent, render, screen } from "@testing-library/react"
import {
  ArticleEditorForm,
  type ArticleEditorFormState,
} from "./article-editor-form"

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

const article = {
  id: 42,
  slug: "sample-post",
  title: "Sample Post",
  category: "backend",
  tags: ["nextjs", "fastapi"],
  createdAt: "2026-03-01T00:00:00Z",
  updatedAt: "2026-03-02T00:00:00Z",
  publishedAt: "2026-03-02T00:00:00Z",
  isDraft: false,
  content: "Hello",
}

const categories = [
  { id: 1, name: "Backend", slug: "backend", color: null, icon: null },
  { id: 2, name: "Frontend", slug: "frontend", color: null, icon: null },
]

const action = async (
  state: ArticleEditorFormState,
  _formData: FormData,
): Promise<ArticleEditorFormState> => state

describe("ArticleEditorForm", () => {
  it("公開記事を初期表示し、hidden の isDraft に false を入れる", () => {
    render(
      <ArticleEditorForm
        article={article}
        categories={categories}
        action={action}
      />,
    )

    expect(screen.getByRole("button", { name: "公開" })).toHaveAttribute(
      "data-variant",
      "default",
    )
    expect(screen.getByDisplayValue("false")).toHaveAttribute("name", "isDraft")
  })

  it("非公開を選ぶと hidden の isDraft を true に切り替える", () => {
    render(
      <ArticleEditorForm
        article={article}
        categories={categories}
        action={action}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "非公開" }))

    expect(screen.getByRole("button", { name: "非公開" })).toHaveAttribute(
      "data-variant",
      "default",
    )
    expect(screen.getByDisplayValue("true")).toHaveAttribute("name", "isDraft")
  })

  it("下書き記事は非公開を初期選択する", () => {
    render(
      <ArticleEditorForm
        article={{ ...article, isDraft: true, publishedAt: null }}
        categories={categories}
        action={action}
      />,
    )

    expect(screen.getByRole("button", { name: "非公開" })).toHaveAttribute(
      "data-variant",
      "default",
    )
    expect(screen.getByDisplayValue("true")).toHaveAttribute("name", "isDraft")
  })

  it("空の slug を送信しようとすると slug のエラーを表示する", () => {
    render(
      <ArticleEditorForm
        article={article}
        categories={categories}
        action={action}
      />,
    )

    fireEvent.change(screen.getByLabelText("slug"), {
      target: { value: "" },
    })
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    expect(screen.getByText("slug は必須です")).toBeInTheDocument()
  })
})
