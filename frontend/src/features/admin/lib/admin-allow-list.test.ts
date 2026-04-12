import {
  isAllowedAdminEmail,
  parseAdminAllowedEmails,
} from "./admin-allow-list"

describe("parseAdminAllowedEmails", () => {
  it("空白と大文字小文字を正規化し、空要素を除外する", () => {
    expect(
      parseAdminAllowedEmails(" Admin@example.com, editor@example.com , ,"),
    ).toEqual(["admin@example.com", "editor@example.com"])
  })

  it("未指定時は空配列を返す", () => {
    expect(parseAdminAllowedEmails(undefined)).toEqual([])
  })
})

describe("isAllowedAdminEmail", () => {
  const allowList = ["admin@example.com", "editor@example.com"]

  it("大文字小文字を無視して許可メールを判定する", () => {
    expect(isAllowedAdminEmail("Admin@Example.com", allowList)).toBe(true)
  })

  it("未許可メールや空値は拒否する", () => {
    expect(isAllowedAdminEmail("guest@example.com", allowList)).toBe(false)
    expect(isAllowedAdminEmail(undefined, allowList)).toBe(false)
    expect(isAllowedAdminEmail(null, allowList)).toBe(false)
  })
})
