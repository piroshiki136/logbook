import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminAuthCard } from "@/features/admin/admin-auth-card"
import { SignOutButton } from "@/features/admin/signout-button"

export default async function Page() {
  const session = await auth()
  if (!session) {
    redirect("/admin/login")
  }

  const allowed = process.env.ADMIN_ALLOWED_EMAILS ?? ""
  const allowList = new Set(
    allowed
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
  const email = session.user?.email?.toLowerCase()
  const isAllowed = !!email && allowList.has(email)

  if (isAllowed) {
    redirect("/admin")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <AdminAuthCard
        title="権限がありません"
        description="管理画面へのアクセス権限がありません。サインアウトして別のアカウントでログインしてください。"
        footer={<SignOutButton />}
      />
    </div>
  )
}
