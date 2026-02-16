import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminAuthCard, SignInButton } from "@/features/admin"

type PageProps = {
  searchParams?: { callbackUrl?: string }
}

const getSafeCallbackUrl = (callbackUrl?: string) => {
  if (!callbackUrl) return "/admin"
  return callbackUrl.startsWith("/admin") ? callbackUrl : "/admin"
}

export default async function Page({ searchParams }: PageProps) {
  const session = await auth()
  const safeCallbackUrl = getSafeCallbackUrl(searchParams?.callbackUrl)
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
