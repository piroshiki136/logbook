import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminAuthCard } from "@/features/admin/admin-auth-card"
import { SignInButton } from "@/features/admin/signin-button"

export default async function Page() {
  const session = await auth()
  if (session) {
    redirect("/admin")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <AdminAuthCard
        title="Admin Login"
        description="GitHub でサインインしてください。"
        footer={<SignInButton />}
      />
    </div>
  )
}
