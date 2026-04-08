import { validateArticleForm } from "./article-form-validation"

const baseValues = {
  title: "Title",
  slug: "valid-slug",
  category: "backend",
  content: "Body",
}

describe("validateArticleForm", () => {
  it("slug の空白を個別の文言で返す", () => {
    expect(
      validateArticleForm(
        { ...baseValues, slug: "invalid slug" },
        { requireSlug: true },
      ).slug,
    ).toBe("slug に空白は使えません")
  })

  it("slug の先頭や末尾のハイフンを個別の文言で返す", () => {
    expect(
      validateArticleForm(
        { ...baseValues, slug: "-invalid" },
        { requireSlug: true },
      ).slug,
    ).toBe("slug の先頭や末尾にハイフンは使えません")

    expect(
      validateArticleForm(
        { ...baseValues, slug: "invalid-" },
        { requireSlug: true },
      ).slug,
    ).toBe("slug の先頭や末尾にハイフンは使えません")
  })

  it("slug の連続ハイフンを個別の文言で返す", () => {
    expect(
      validateArticleForm(
        { ...baseValues, slug: "invalid--slug" },
        { requireSlug: true },
      ).slug,
    ).toBe("slug に連続したハイフンは使えません")
  })

  it("slug の使用不可文字を個別の文言で返す", () => {
    expect(
      validateArticleForm(
        { ...baseValues, slug: "invalid_slug" },
        { requireSlug: true },
      ).slug,
    ).toBe("slug は英小文字・数字・日本語・ハイフンのみ使用できます")
  })
})
