# API仕様（MVP）

## 共通事項
- ベースURL: https://api.example.com
- 認証: Bearer Token（NextAuth セッション JWT）
- 認証必須のエンドポイント: POST / PATCH / DELETE 系
- ヘッダー例:
  - Authorization: Bearer <token>
  - Content-Type: application/json
- ページング: limit / offset（デフォルト: limit=10, offset=0）
- エラー形式:
  {
    "error": {
      "code": "ARTICLE_NOT_FOUND",
      "message": "記事が見つかりません"
    }
  }

---

# 1. 記事一覧 GET /api/articles
## クエリ
- limit?: number
- offset?: number
- tags?: string（例: "nextjs,fastapi"）
- categories?: string
- draft?: boolean（true の場合は認証必須）

## 200レスポンス
{
  "items": [
    {
      "id": 12,
      "slug": "fastapi-intro",
      "title": "FastAPI 入門",
      "category": "backend",
      "tags": ["fastapi", "python"],
      "createdAt": "2025-01-22T12:00:00Z",
      "updatedAt": "2025-01-25T12:00:00Z",
      "isDraft": false
    }
  ],
  "total": 42
}

---

# 2. 記事詳細 GET /api/articles/{slug}
## パス
- slug（string）

## 200レスポンス
{
  "id": 12,
  "slug": "fastapi-intro",
  "title": "FastAPI 入門",
  "content": "Markdown ...",
  "category": "backend",
  "tags": ["fastapi", "python"],
  "createdAt": "...",
  "updatedAt": "...",
  "isDraft": false
}

---

# 3. 記事作成 POST /api/articles
- 認証必須

## ボディ
{
  "title": "新記事",
  "slug": "new-article",
  "content": "...",
  "category": "frontend",
  "tags": ["nextjs"],
  "isDraft": true
}

## 201レスポンス
作成済み記事オブジェクト

---

# 4. 記事更新 PATCH /api/articles/{id}
- 認証必須
- slug が変更される可能性に対応するため id を使用

## ボディ
更新したいフィールドのみ（title, slug, content など）

## 200レスポンス
更新後記事

---

# 5. 記事削除 DELETE /api/articles/{id}
- 認証必須
- 204レスポンス

---

# 6. タグ一覧 GET /api/tags
## 200レスポンス
[
  { "id": 1, "name": "fastapi" }
]

---

# 7. 画像アップロード POST /api/upload-image
- 認証必須

## Multipart FormData
file: image/png など

## 201レスポンス
{
  "url": "/uploads/abc.png"
}

