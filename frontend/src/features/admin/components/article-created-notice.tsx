"use client"

import { useEffect } from "react"

type ArticleCreatedNoticeProps = {
  created: boolean
}

export function ArticleCreatedNotice({ created }: ArticleCreatedNoticeProps) {
  useEffect(() => {
    if (!created) return
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [created])

  if (!created) return null

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      記事を作成しました。続けて編集できます。
    </div>
  )
}
