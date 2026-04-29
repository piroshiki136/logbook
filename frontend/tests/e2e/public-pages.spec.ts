import { expect, test } from "@playwright/test"

test.describe("公開画面導線", () => {
  test("記事一覧でページ遷移できる", async ({ page }) => {
    await page.goto("/articles")

    await expect(page.getByRole("heading", { name: "Articles" })).toBeVisible()
    await expect(
      page.getByRole("link", { name: "記事: Post 1", exact: true }),
    ).toBeVisible()

    await page.getByRole("link", { name: "次のページへ" }).click()

    await expect(page).toHaveURL(/\/articles\?page=2$/)
    await expect(
      page.getByRole("link", { name: "記事: Post 11", exact: true }),
    ).toBeVisible()
  })

  test("記事詳細で新旧記事ナビから遷移できる", async ({ page }) => {
    await page.goto("/articles/post-2")

    await expect(page.locator("article > h1")).toHaveText("Post 2")
    await expect(
      page.getByRole("navigation", { name: "新旧の記事" }),
    ).toBeVisible()

    await page.getByRole("link", { name: "Post 3" }).click()
    await expect(page).toHaveURL(/\/articles\/post-3$/)
    await expect(page.locator("article > h1")).toHaveText("Post 3")
  })
})
