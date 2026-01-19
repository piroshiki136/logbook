"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { fetchAdminArticlesAction } from "./actions"

const initialState = {
  ok: false,
  message: "未実行",
}

export function TestApiClient() {
  const [state, formAction, isPending] = useActionState(
    fetchAdminArticlesAction,
    initialState,
  )

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <Button type="submit" disabled={isPending}>
          管理APIをテスト
        </Button>
      </form>
      <div className="text-sm text-gray-600">
        {state.ok ? "成功" : "失敗"}: {state.message}
      </div>
    </div>
  )
}
