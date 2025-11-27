export default async function Page() {
  const res = await fetch("http://localhost:8000/hello", { cache: "no-store" });
  const data = await res.json();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Next.js ⇔ FastAPI 接続テスト</h1>
      <pre className="mt-4">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
