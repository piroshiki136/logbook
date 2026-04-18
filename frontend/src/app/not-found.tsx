import Link from "next/link"

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center px-4 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        404 Page Not Found
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        お探しのページは見つかりませんでした
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
        URL
        が間違っているか、ページが移動または削除された可能性があります。記事一覧やトップページから目的のページを探してください。
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          トップへ戻る
        </Link>
        <Link
          href="/articles"
          className="inline-flex items-center rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          記事一覧へ戻る
        </Link>
      </div>
    </section>
  )
}
