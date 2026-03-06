import { parsePage } from "./parse-page"

describe("parsePage", () => {
  it("空文字と非数を 1 に補正する", () => {
    expect(parsePage()).toBe(1)
    expect(parsePage("")).toBe(1)
    expect(parsePage("abc")).toBe(1)
  })

  it("0 以下を 1 に補正する", () => {
    expect(parsePage("0")).toBe(1)
    expect(parsePage("-3")).toBe(1)
  })

  it("小数は切り捨てる", () => {
    expect(parsePage("2.9")).toBe(2)
  })

  it("正の整数はそのまま返す", () => {
    expect(parsePage("5")).toBe(5)
  })
})
