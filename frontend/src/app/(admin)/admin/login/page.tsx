import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminAuthCard, SignInButton } from "@/features/admin"
import { getSafeAdminCallbackUrl } from "@/features/admin/lib/callback-url"

type PageProps = {
  searchParams?: { callbackUrl?: string }
}

export default async function Page({ searchParams }: PageProps) {
  const session = await auth()
  const safeCallbackUrl = getSafeAdminCallbackUrl(searchParams?.callbackUrl)
  if (session) {
    redirect(safeCallbackUrl)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <AdminAuthCard
        title="Admin Login"
        description="GitHub でサインインしてください。"
        footer={<SignInButton redirectTo={safeCallbackUrl} />}
      />
    </div>
  )
}
