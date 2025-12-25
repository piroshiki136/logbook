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
- page?: number（デフォルト: 1）
- limit?: number（デフォルト: 10、最大: 50）
- tags?: string（例: "nextjs,fastapi"）
- categories?: string
- draft?: boolean（管理APIのみ指定可。公開APIでは false 固定）

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
  "total": 42,
  "page": 1,
  "limit": 10
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

---

# 8. 前後の記事取得 GET /api/articles/{id}/prev-next
- id を基準に前後の記事を返す（公開APIでは isDraft=false のみ）
- 管理APIでは認証が必要、ドラフトも取得可能

## 200レスポンス
{
  "prev": {
    "id": 11,
    "slug": "prev-article",
    "title": "前の記事",
    "createdAt": "...",
    "isDraft": false
  },
  "next": {
    "id": 13,
    "slug": "next-article",
    "title": "次の記事",
    "createdAt": "...",
    "isDraft": false
  }
}

prev/next が存在しない場合は null を返す。

---

# 認証・権限制御（初心者向けの流れ）
- 何を検証する？  
  - フロント（NextAuth）が発行する JWT が正しいサインか、期限切れでないか、誰向けか（aud を例えば `logbook` に固定）を確認する。
- 鍵の扱い  
  - JWT の署名方式: RS256。NextAuth 側に秘密鍵（PEM）を保持し、FastAPI 側は `.env` の `JWT_PUBLIC_KEY`（公開鍵）を使って検証する。改行は `\n` で表現して良い。アルゴリズムは `JWT_ALGORITHM=RS256` を既定とする。
- 送信方法  
  - 管理系 API ではヘッダーに `Authorization: Bearer <JWT>` を必ず付ける。
- 管理者の決め方  
  - 環境変数 `ADMIN_ALLOWED_EMAILS` に、管理者として許可するメールをカンマ区切り（推奨）で列挙する。JSON 配列（例: `["admin@example.com","editor@example.com"]`）でも可。  
  - JWT の email がこの中にあり、admin_users に未登録なら初回アクセス時に自動で作成。  
  - 含まれないメールなら 403。
- エラー時の返し方  
  - JWT 不正/期限切れ → 401  
  - メールが許可されていない → 403

---

# セキュリティ対策（ブラウザ向けヘッダ）
- HSTS: 一度 HTTPS でアクセスしたら、次回以降も必ず HTTPS を使うようブラウザに指示する（盗聴や改ざんリスク低減）。
- X-Frame-Options: SAMEORIGIN で、他ドメインの iframe 埋め込みを防ぐ（クリックジャッキング対策）。
- X-Content-Type-Options: nosniff で、ブラウザが勝手にファイルタイプを推測しないようにする。
- Referrer-Policy: strict-origin-when-cross-origin で、外部サイトへ送るリファラ情報を最小限（オリジンのみ）にする。
- 実装イメージ: FastAPI/Starlette のミドルウェアで上記ヘッダをレスポンスに付与。

---

# レートリミット（目安）
- 本番/ステージング: Cloudflare（無料枠）の WAF/レートリミットを有効化した上で、FastAPI 側でも Redis + `fastapi-limiter` で二重に制御する（公開 API 60 req/min、管理 API 30 req/min）。
- ローカル開発の初期段階: Redis を起動せずに Cloudflare 相当の制御も掛からないため、`fastapi-limiter` を無効化したまま動かす。Redis を導入したタイミングで有効化フラグを切り替えられるように実装する。
- 閾値は運用状況に応じて調整し、Cloudflare とアプリ側で設定を同期する。
