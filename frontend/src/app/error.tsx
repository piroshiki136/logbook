"use client"

import Link from "next/link"

type PageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Page({ reset }: PageProps) {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center px-4 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Error
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        現在エラーが発生しています
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
        しばらくしてから再度お試しください。解決しない場合は、記事一覧またはトップページからお探しください。
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          もう一度試す
        </button>
        <Link
          href="/articles"
          className="inline-flex items-center rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          記事一覧へ戻る
        </Link>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          トップへ戻る
        </Link>
      </div>
    </section>
  )
}
