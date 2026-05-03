"use client"

import Link from "next/link"
import { useActionState, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Category } from "@/lib/api/types"
import type { CreateCategoryActionState } from "../actions/create-category-action"
import {
  type ArticleFormErrors,
  type ArticleFormFieldName,
  getArticleFormValues,
  validateArticleForm,
} from "../lib/article-form-validation"

export type CreateArticleFormState = {
  ok: boolean
  message: string
}

type CreateArticleFormProps = {
  categories: Category[]
  action: (
    state: CreateArticleFormState,
    formData: FormData,
  ) => Promise<CreateArticleFormState>
  createCategoryAction: (
    formData: FormData,
  ) => Promise<CreateCategoryActionState>
}

const initialState: CreateArticleFormState = {
  ok: false,
  message: "",
}

export function CreateArticleForm({
  categories,
  action,
  createCategoryAction,
}: CreateArticleFormProps) {
  const [categoryOptions, setCategoryOptions] = useState(categories)
  const [visibility, setVisibility] = useState<"published" | "draft">("draft")
  const [isCategoryCreatorOpen, setIsCategoryCreatorOpen] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryState, setCategoryState] = useState<CreateCategoryActionState>(
    {
      ok: false,
      message: "",
      category: null,
    },
  )
  const [isCategoryPending, startCategoryTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<ArticleFormErrors>({})
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<ArticleFormFieldName, boolean>>
  >({})
  const [state, formAction, isPending] = useActionState(action, initialState)

  const syncErrors = (
    form: HTMLFormElement,
    nextTouchedFields: Partial<Record<ArticleFormFieldName, boolean>>,
  ) => {
    const values = getArticleFormValues(new FormData(form))
    const nextErrors = validateArticleForm(values, { requireSlug: false })

    setFieldErrors(
      Object.fromEntries(
        Object.entries(nextErrors).filter(
          ([fieldName]) => nextTouchedFields[fieldName as ArticleFormFieldName],
        ),
      ) as ArticleFormErrors,
    )

    return nextErrors
  }

  const handleFieldBlur = (
    event: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const fieldName = event.target.name as ArticleFormFieldName
    if (!fieldName) return
    const form = event.currentTarget.form
    if (!form) return

    const nextTouchedFields = { ...touchedFields, [fieldName]: true }
    setTouchedFields(nextTouchedFields)
    syncErrors(form, nextTouchedFields)
  }

  const handleFieldChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const fieldName = event.target.name as ArticleFormFieldName
    if (!fieldName || !touchedFields[fieldName]) return
    const form = event.currentTarget.form
    if (!form) return

    syncErrors(form, touchedFields)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const nextTouchedFields = {
      title: true,
      slug: true,
      category: true,
      content: true,
    } satisfies Partial<Record<ArticleFormFieldName, boolean>>
    setTouchedFields(nextTouchedFields)

    const nextErrors = syncErrors(event.currentTarget, nextTouchedFields)
    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault()
    }
  }

  const handleCategoryCreate = () => {
    const formData = new FormData()
    formData.set("name", categoryName)

    startCategoryTransition(async () => {
      const nextState = await createCategoryAction(formData)
      setCategoryState(nextState)

      if (nextState.ok && nextState.category) {
        const createdCategory = nextState.category
        setCategoryOptions((currentCategories) => {
          if (
            currentCategories.some(
              (category) => category.id === createdCategory.id,
            )
          ) {
            return currentCategories
          }

          return [...currentCategories, createdCategory].sort((a, b) =>
            a.name.localeCompare(b.name),
          )
        })
        setCategoryName("")
        setIsCategoryCreatorOpen(false)
      }
    })
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-6"
      noValidate
      onSubmit={handleSubmit}
    >
      <input
        type="hidden"
        name="isDraft"
        value={visibility === "draft" ? "true" : "false"}
      />

      <FieldGroup className="grid gap-6 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="title">タイトル</FieldLabel>
          <FieldContent>
            <Input
              id="title"
              name="title"
              disabled={isPending}
              aria-invalid={fieldErrors.title ? "true" : "false"}
              onBlur={handleFieldBlur}
              onChange={handleFieldChange}
            />
            <FieldError>{fieldErrors.title}</FieldError>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="slug">slug</FieldLabel>
          <FieldContent>
            <Input
              id="slug"
              name="slug"
              disabled={isPending}
              placeholder="未入力なら自動生成"
              aria-invalid={fieldErrors.slug ? "true" : "false"}
              onBlur={handleFieldBlur}
              onChange={handleFieldChange}
            />
            <FieldDescription>
              空欄の場合はタイトルから自動生成されます。
            </FieldDescription>
            <FieldError>{fieldErrors.slug}</FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>

      <Field>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <FieldLabel htmlFor="category">カテゴリ</FieldLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => {
              setIsCategoryCreatorOpen((isOpen) => !isOpen)
              setCategoryState({ ok: false, message: "", category: null })
            }}
          >
            新しいカテゴリを追加
          </Button>
        </div>
        <FieldContent>
          {isCategoryCreatorOpen ? (
            <div className="flex flex-col gap-3 rounded-md border p-3">
              <FieldLabel htmlFor="new-category-name">カテゴリ名</FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="new-category-name"
                  value={categoryName}
                  disabled={isPending || isCategoryPending}
                  maxLength={100}
                  onChange={(event) => {
                    setCategoryName(event.target.value)
                    if (categoryState.message) {
                      setCategoryState({
                        ok: false,
                        message: "",
                        category: null,
                      })
                    }
                  }}
                />
                <Button
                  type="button"
                  disabled={isPending || isCategoryPending}
                  onClick={handleCategoryCreate}
                >
                  {isCategoryPending ? "追加中..." : "追加"}
                </Button>
              </div>
              <FieldDescription>
                slug はカテゴリ名から自動生成されます。
              </FieldDescription>
              {categoryState.message ? (
                categoryState.ok ? (
                  <p className="text-sm text-emerald-600">
                    {categoryState.message}
                  </p>
                ) : (
                  <FieldError>{categoryState.message}</FieldError>
                )
              ) : null}
            </div>
          ) : null}

          <select
            id="category"
            name="category"
            disabled={isPending}
            defaultValue={categoryOptions[0]?.slug ?? ""}
            aria-invalid={fieldErrors.category ? "true" : "false"}
            onBlur={handleFieldBlur}
            onChange={handleFieldChange}
            className="border-input dark:bg-input/30 h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError>{fieldErrors.category}</FieldError>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="tags">タグ</FieldLabel>
        <FieldContent>
          <Input
            id="tags"
            name="tags"
            disabled={isPending}
            placeholder="nextjs, fastapi"
          />
          <FieldDescription>カンマ区切りで入力します。</FieldDescription>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="content">本文</FieldLabel>
        <FieldContent>
          <Textarea
            id="content"
            name="content"
            disabled={isPending}
            rows={18}
            className="min-h-72"
            aria-invalid={fieldErrors.content ? "true" : "false"}
            onBlur={handleFieldBlur}
            onChange={handleFieldChange}
          />
          <FieldError>{fieldErrors.content}</FieldError>
        </FieldContent>
      </Field>

      <Field>
        <FieldTitle>公開状態</FieldTitle>
        <FieldContent>
          <ButtonGroup className="w-full md:w-fit">
            <Button
              type="button"
              variant={visibility === "published" ? "default" : "outline"}
              className={
                visibility === "published"
                  ? "text-primary-foreground"
                  : undefined
              }
              disabled={isPending}
              onClick={() => setVisibility("published")}
            >
              公開
            </Button>
            <Button
              type="button"
              variant={visibility === "draft" ? "default" : "outline"}
              className={
                visibility === "draft" ? "text-primary-foreground" : undefined
              }
              disabled={isPending}
              onClick={() => setVisibility("draft")}
            >
              非公開
            </Button>
          </ButtonGroup>
          <FieldDescription>
            作成時は非公開が初期選択です。必要なら公開に切り替えます。
          </FieldDescription>
        </FieldContent>
      </Field>

      {state.message ? (
        state.ok ? (
          <p className="text-sm text-emerald-600">{state.message}</p>
        ) : (
          <FieldError>{state.message}</FieldError>
        )
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isPending}>
          {isPending ? "作成中..." : "記事を作成"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/articles">記事管理へ戻る</Link>
        </Button>
      </div>
    </form>
  )
}
