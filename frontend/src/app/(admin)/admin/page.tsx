import Link from "next/link"
import { auth } from "@/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignOutButton } from "@/features/admin"

const adminLinks = [
  {
    href: "/admin/articles",
    title: "記事管理",
    description: "公開記事と下書きを確認し、編集画面へ進みます。",
  },
  {
    href: "/admin/articles/new",
    title: "新規作成",
    description: "新しい記事を作成します。",
  },
]

export default async function Page() {
  const session = await auth()
  const displayName =
    session?.user?.name?.trim() || session?.user?.email || "Admin"

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Admin</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>ログイン情報</CardTitle>
            <CardDescription>
              現在ログインしている管理ユーザーです。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <p className="text-lg font-medium">{displayName}</p>
              {session?.user?.email ? (
                <p className="text-sm text-muted-foreground">
                  {session.user.email}
                </p>
              ) : null}
            </div>
            <div className="w-full md:w-auto">
              <SignOutButton />
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-2">
          {adminLinks.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
