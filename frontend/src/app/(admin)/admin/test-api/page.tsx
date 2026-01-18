import { TestApiClient } from "./test-api-client"

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold">Admin Test API</h1>
      <p className="mt-2 text-sm text-gray-600">
        Server Actions 経由で認証必須 API を呼び出します。
      </p>
      <div className="mt-6">
        <TestApiClient />
      </div>
    </div>
  )
}
