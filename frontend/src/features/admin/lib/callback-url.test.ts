import { getSafeAdminCallbackUrl } from "./callback-url"

describe("getSafeAdminCallbackUrl", () => {
  it("/admin 配下の callbackUrl を許可する", () => {
    expect(getSafeAdminCallbackUrl("/admin")).toBe("/admin")
    expect(getSafeAdminCallbackUrl("/admin/articles/42/edit")).toBe(
      "/admin/articles/42/edit",
    )
    expect(getSafeAdminCallbackUrl("/admin/articles?tab=draft#top")).toBe(
      "/admin/articles?tab=draft#top",
    )
  })

  it("未指定時は /admin を返す", () => {
    expect(getSafeAdminCallbackUrl()).toBe("/admin")
  })

  it("/admin 配下以外の callbackUrl は /admin に正規化する", () => {
    expect(getSafeAdminCallbackUrl("/")).toBe("/admin")
    expect(getSafeAdminCallbackUrl("https://example.com/admin")).toBe("/admin")
    expect(getSafeAdminCallbackUrl("/articles")).toBe("/admin")
    expect(getSafeAdminCallbackUrl("/admin-login")).toBe("/admin")
    expect(getSafeAdminCallbackUrl("/administer")).toBe("/admin")
    expect(getSafeAdminCallbackUrl("/admin/../articles")).toBe("/admin")
    expect(getSafeAdminCallbackUrl("/admin/%2e%2e/articles")).toBe("/admin")
  })
})
