import Link from "next/link"
import { auth } from "@/auth"

export default async function Page() {
  const session = await auth()
  const allowed = process.env.ADMIN_ALLOWED_EMAILS ?? ""
  const allowList = new Set(
    allowed
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
  const email = session?.user?.email?.toLowerCase()
  const isAllowed = !!email && allowList.has(email)

  return (
    <div className="p-6">
      <div>Admin Page</div>
      {session ? (
        <pre className="mt-4 whitespace-pre-wrap text-xs text-gray-600">
          {JSON.stringify(session, null, 2)}
        </pre>
      ) : (
        <div className="mt-2 text-sm text-gray-600">未ログイン</div>
      )}
      {session && !isAllowed ? (
        <div className="mt-4 text-sm text-red-600">
          権限がありません。<Link href="/admin/forbidden">詳細を見る</Link>
        </div>
      ) : null}
    </div>
  )
}
