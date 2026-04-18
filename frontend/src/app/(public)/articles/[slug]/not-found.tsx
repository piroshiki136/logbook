import Link from "next/link"

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center px-4 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        404 Not Found
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        記事が見つかりません
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
        URLが間違っているか、記事が削除または非公開になった可能性があります。
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-full mt-8 px-5 py-2 text-sm font-medium bg-foreground text-background transition-opacity hover:opacity-90"
      >
        トップへ戻る
      </Link>
    </section>
  )
}
