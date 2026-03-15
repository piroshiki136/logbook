"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import type { ArticleDetail, Category } from "@/lib/api/types"
import { type EditArticleFormState, updateArticleAction } from "./actions"

type EditArticleFormProps = {
  article: ArticleDetail
  categories: Category[]
}

const initialState: EditArticleFormState = {
  ok: false,
  message: "",
}

export function EditArticleForm({ article, categories }: EditArticleFormProps) {
  const [visibility, setVisibility] = useState<"published" | "draft">(
    article.isDraft ? "draft" : "published",
  )
  const [state, formAction, isPending] = useActionState(
    updateArticleAction,
    initialState,
  )

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={String(article.id)} />
      <input
        type="hidden"
        name="isDraft"
        value={visibility === "draft" ? "true" : "false"}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium">
            タイトル
          </label>
          <Input
            id="title"
            name="title"
            defaultValue={article.title}
            disabled={isPending}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="slug" className="text-sm font-medium">
            slug
          </label>
          <Input
            id="slug"
            name="slug"
            defaultValue={article.slug}
            disabled={isPending}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium">
          カテゴリ
        </label>
        <select
          id="category"
          name="category"
          defaultValue={article.category}
          disabled={isPending}
          className="border-input dark:bg-input/30 h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="tags" className="text-sm font-medium">
          タグ
        </label>
        <Input
          id="tags"
          name="tags"
          defaultValue={article.tags.join(", ")}
          disabled={isPending}
          placeholder="nextjs, fastapi"
        />
        <span className="text-muted-foreground text-xs">
          カンマ区切りで入力します。
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="content" className="text-sm font-medium">
          本文
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={article.content}
          disabled={isPending}
          required
          rows={18}
          className="border-input placeholder:text-muted-foreground dark:bg-input/30 min-h-72 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">公開状態</span>
        <ButtonGroup className="w-full md:w-fit">
          <Button
            type="button"
            variant={visibility === "published" ? "default" : "outline"}
            className={
              visibility === "published" ? "text-primary-foreground" : undefined
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
        <span className="text-muted-foreground text-xs">
          公開または非公開のどちらかを必ず選択します。
        </span>
      </div>

      {state.message ? (
        <p
          className={
            state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : "保存"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/articles">記事管理へ戻る</Link>
        </Button>
      </div>
    </form>
  )
}
