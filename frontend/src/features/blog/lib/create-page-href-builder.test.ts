import { createPageHrefBuilder } from "./create-page-href-builder"

describe("createPageHrefBuilder", () => {
  it("page 以外のクエリを保持して page を上書きする", () => {
    const href = createPageHrefBuilder(
      {
        page: "1",
        tags: ["nextjs", "fastapi"],
        categories: "frontend",
      },
      "/articles",
    )(3)

    expect(href).toBe(
      "/articles?tags=nextjs&tags=fastapi&categories=frontend&page=3",
    )
  })

  it("params が未指定でも page クエリを生成する", () => {
    const href = createPageHrefBuilder(undefined, "/articles")(2)
    expect(href).toBe("/articles?page=2")
  })
})
