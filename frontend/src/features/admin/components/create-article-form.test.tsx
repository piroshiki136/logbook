import { fireEvent, render, screen } from "@testing-library/react"
import {
  CreateArticleForm,
  type CreateArticleFormState,
} from "./create-article-form"

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

const categories = [
  { id: 1, name: "Backend", slug: "backend", color: null, icon: null },
  { id: 2, name: "Frontend", slug: "frontend", color: null, icon: null },
]

const action = async (
  state: CreateArticleFormState,
  _formData: FormData,
): Promise<CreateArticleFormState> => state

describe("CreateArticleForm", () => {
  it("初期状態は非公開で、isDraft に true を入れる", () => {
    render(<CreateArticleForm categories={categories} action={action} />)

    expect(screen.getByRole("button", { name: "非公開" })).toHaveAttribute(
      "data-variant",
      "default",
    )
    expect(screen.getByDisplayValue("true")).toHaveAttribute("name", "isDraft")
  })

  it("公開を選ぶと hidden の isDraft を false に切り替える", () => {
    render(<CreateArticleForm categories={categories} action={action} />)

    fireEvent.click(screen.getByRole("button", { name: "公開" }))

    expect(screen.getByRole("button", { name: "公開" })).toHaveAttribute(
      "data-variant",
      "default",
    )
    expect(screen.getByDisplayValue("false")).toHaveAttribute("name", "isDraft")
  })

  it("slug 入力欄は任意で、自動生成の説明を表示する", () => {
    render(<CreateArticleForm categories={categories} action={action} />)

    expect(screen.getByLabelText("slug")).not.toBeRequired()
    expect(
      screen.getByText("空欄の場合はタイトルから自動生成されます。"),
    ).toBeInTheDocument()
  })

  it("未入力のまま送信すると項目ごとのエラーを表示する", () => {
    render(<CreateArticleForm categories={categories} action={action} />)

    fireEvent.change(screen.getByLabelText("カテゴリ"), {
      target: { value: "" },
    })
    fireEvent.click(screen.getByRole("button", { name: "記事を作成" }))

    expect(screen.getByText("タイトルは必須です")).toBeInTheDocument()
    expect(screen.getByText("カテゴリは必須です")).toBeInTheDocument()
    expect(screen.getByText("本文は必須です")).toBeInTheDocument()
  })

  it("不正な slug を入力すると slug のエラーを表示する", () => {
    render(<CreateArticleForm categories={categories} action={action} />)

    fireEvent.change(screen.getByLabelText("slug"), {
      target: { value: "Invalid Slug" },
    })
    fireEvent.blur(screen.getByLabelText("slug"))

    expect(screen.getByText("slug に空白は使えません")).toBeInTheDocument()
  })

  it("先頭ハイフンの slug を入力すると個別のエラーを表示する", () => {
    render(<CreateArticleForm categories={categories} action={action} />)

    fireEvent.change(screen.getByLabelText("slug"), {
      target: { value: "-invalid" },
    })
    fireEvent.blur(screen.getByLabelText("slug"))

    expect(
      screen.getByText("slug の先頭や末尾にハイフンは使えません"),
    ).toBeInTheDocument()
  })
})
