const SLUG_CHAR_CLASS = "0-9a-zぁ-んァ-ヶ一-龯ー々ゝゞ"
const SLUG_VALIDATE_RE = new RegExp(
  `^[${SLUG_CHAR_CLASS}]+(?:-[${SLUG_CHAR_CLASS}]+)*$`,
)
const SLUG_ALLOWED_CHARS_RE = new RegExp(`^[${SLUG_CHAR_CLASS}-]+$`)

export type ArticleFormFieldName = "title" | "slug" | "category" | "content"

export type ArticleFormErrors = Partial<Record<ArticleFormFieldName, string>>

export type ArticleFormValues = {
  title: string
  slug: string
  category: string
  content: string
}

type ValidateArticleFormOptions = {
  requireSlug: boolean
}

const trim = (value: string) => value.trim()

export const getArticleFormValues = (
  formData: FormData,
): ArticleFormValues => ({
  title:
    typeof formData.get("title") === "string"
      ? String(formData.get("title"))
      : "",
  slug:
    typeof formData.get("slug") === "string"
      ? String(formData.get("slug"))
      : "",
  category:
    typeof formData.get("category") === "string"
      ? String(formData.get("category"))
      : "",
  content:
    typeof formData.get("content") === "string"
      ? String(formData.get("content"))
      : "",
})

export const validateArticleForm = (
  values: ArticleFormValues,
  options: ValidateArticleFormOptions,
): ArticleFormErrors => {
  const errors: ArticleFormErrors = {}

  if (!trim(values.title)) {
    errors.title = "タイトルは必須です"
  }

  if (!trim(values.category)) {
    errors.category = "カテゴリは必須です"
  }

  if (!trim(values.content)) {
    errors.content = "本文は必須です"
  }

  const normalizedSlug = trim(values.slug).toLowerCase()
  if (options.requireSlug || normalizedSlug) {
    if (!normalizedSlug) {
      errors.slug = "slug は必須です"
    } else if (normalizedSlug.includes(" ")) {
      errors.slug = "slug に空白は使えません"
    } else if (normalizedSlug.length > 150) {
      errors.slug = "slug は150文字以内で指定してください"
    } else if (!SLUG_ALLOWED_CHARS_RE.test(normalizedSlug)) {
      errors.slug = "slug は英小文字・数字・日本語・ハイフンのみ使用できます"
    } else if (normalizedSlug.startsWith("-") || normalizedSlug.endsWith("-")) {
      errors.slug = "slug の先頭や末尾にハイフンは使えません"
    } else if (normalizedSlug.includes("--")) {
      errors.slug = "slug に連続したハイフンは使えません"
    } else if (!SLUG_VALIDATE_RE.test(normalizedSlug)) {
      errors.slug = "slug の形式が正しくありません"
    }
  }

  return errors
}
