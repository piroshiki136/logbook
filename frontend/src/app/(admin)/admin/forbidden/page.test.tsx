import { render, screen } from "@testing-library/react"
import Page from "./page"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}))

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}))

vi.mock("@/features/admin", () => ({
  AdminAuthCard: ({
    title,
    description,
    footer,
  }: {
    title: string
    description: string
    footer: React.ReactNode
  }) => (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>
      <div>{footer}</div>
    </section>
  ),
  SignOutButton: () => <button type="button">Sign out</button>,
}))

describe("/admin/forbidden page", () => {
  const env = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...env }
    process.env.ADMIN_ALLOWED_EMAILS = "admin@example.com"
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`NEXT_REDIRECT:${path}`)
    })
  })

  afterAll(() => {
    process.env = env
  })

  it("未ログイン時は /admin/login にリダイレクトする", async () => {
    mocks.auth.mockResolvedValue(null)

    await expect(Page()).rejects.toThrow("NEXT_REDIRECT:/admin/login")
  })

  it("許可済みメールは /admin にリダイレクトする", async () => {
    mocks.auth.mockResolvedValue({
      user: { email: "admin@example.com" },
    })

    await expect(Page()).rejects.toThrow("NEXT_REDIRECT:/admin")
  })

  it("非許可メールは forbidden 画面を表示する", async () => {
    mocks.auth.mockResolvedValue({
      user: { email: "guest@example.com" },
    })

    render(await Page())

    expect(
      screen.getByRole("heading", { name: "権限がありません" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "管理画面へのアクセス権限がありません。サインアウトして別のアカウントでログインしてください。",
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument()
  })
})
