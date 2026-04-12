import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminAuthCard, SignOutButton } from "@/features/admin"
import {
  isAllowedAdminEmail,
  parseAdminAllowedEmails,
} from "@/features/admin/lib/admin-allow-list"

export default async function Page() {
  const session = await auth()
  if (!session) {
    redirect("/admin/login")
  }

  const allowList = parseAdminAllowedEmails(process.env.ADMIN_ALLOWED_EMAILS)
  const isAllowed = isAllowedAdminEmail(session.user?.email, allowList)

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
