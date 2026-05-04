import { revalidatePath, revalidateTag } from "next/cache"

import {
  getPublicArticleTag,
  PUBLIC_ARTICLE_NEIGHBORS_TAG,
  PUBLIC_ARTICLES_TAG,
} from "./public-articles"

const IMMEDIATE_REVALIDATE = { expire: 0 }

type RevalidatePublicArticleOptions = {
  slug?: string
  previousSlug?: string
}

export const revalidatePublicArticleCache = ({
  slug,
  previousSlug,
}: RevalidatePublicArticleOptions = {}) => {
  const slugs = new Set(
    [slug, previousSlug].filter((value): value is string => Boolean(value)),
  )

  revalidatePath("/", "page")
  revalidatePath("/articles", "page")
  revalidateTag(PUBLIC_ARTICLES_TAG, IMMEDIATE_REVALIDATE)
  revalidateTag(PUBLIC_ARTICLE_NEIGHBORS_TAG, IMMEDIATE_REVALIDATE)

  for (const articleSlug of slugs) {
    revalidatePath(`/articles/${articleSlug}`, "page")
    revalidateTag(getPublicArticleTag(articleSlug), IMMEDIATE_REVALIDATE)
  }
}
