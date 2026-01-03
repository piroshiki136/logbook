# API仕様（MVP）

## 共通事項
- ベースURL: https://api.example.com
- 認証: Bearer Token（NextAuth セッション JWT）
- 認証必須のエンドポイント: POST / PATCH / DELETE 系
- ヘッダー例:
  - Authorization: Bearer <token>
  - Content-Type: application/json
- 成功レスポンスは共通形式（`{ "success": true, "data": ... }`）
- ページング: page / limit（デフォルト: page=1, limit=10）
- エラー形式:
  {
    "error": {
      "code": "ARTICLE_NOT_FOUND",
      "message": "記事が見つかりません"
    }
  }
  - code の一覧（例）:
    - AUTH_INVALID_TOKEN（401）
    - AUTH_FORBIDDEN（403）
    - ARTICLE_NOT_FOUND（404）
    - SLUG_ALREADY_EXISTS（409）
    - REQUEST_VALIDATION_ERROR（422）

---

# 1. 記事一覧 GET /api/articles
## クエリ
- page?: number（デフォルト: 1）
- limit?: number（デフォルト: 10、最大: 50）
- tags?: string（例: "nextjs,fastapi"）
- categories?: string
- draft?: boolean（管理APIのみ指定可。公開APIでは false 固定）

## 補足
- tags / categories はカンマ区切りで複数指定できる
- tags の複数指定は OR 条件（いずれかを含む記事を返す）
- tags は NFKC 正規化 + 小文字化して slug として扱う（表記ゆれ防止）
- 記事は 1 記事 1 カテゴリ
- 公開APIの並び順は publishedAt の降順（公開が新しい順）
- 管理APIの並び順は publishedAt の降順（draft=true の場合は publishedAt が null になるため createdAt の降順を優先）

## 200レスポンス
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 12,
        "slug": "fastapi-intro",
        "title": "FastAPI 入門",
        "category": "backend",
        "tags": ["fastapi", "python"],
        "createdAt": "2025-01-22T12:00:00Z",
        "publishedAt": "2025-01-25T12:00:00Z",
        "updatedAt": "2025-01-25T12:00:00Z",
        "isDraft": false
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 10
  }
}

---

# 2. 記事詳細 GET /api/articles/{slug}
## パス
- slug（string）

## 200レスポンス
{
  "success": true,
  "data": {
    "id": 12,
    "slug": "fastapi-intro",
    "title": "FastAPI 入門",
    "content": "Markdown ...",
    "category": "backend",
    "tags": ["fastapi", "python"],
    "createdAt": "...",
    "publishedAt": "...",
    "updatedAt": "...",
    "isDraft": false
  }
}

---

# 公開日時（publishedAt）の扱い
- isDraft=false に変更したタイミングで publishedAt に現在時刻をセットする
- isDraft=true の間は publishedAt=null
- 非公開に戻した場合も publishedAt は保持する（再公開時に現在時刻で上書きする）

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

## 補足
- slug 未指定の場合は title から自動生成し、重複時は `-2` のように連番を付与する
- slug を明示指定した場合は重複を許可せず、重複時は 409 を返す
- slug は日本語を許可する（英小文字・数字・日本語・ハイフン、先頭や連続ハイフンは不可）
- tags は NFKC 正規化 + 小文字化した値を slug として保存する

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
## 補足
- name の昇順で返す

## 200レスポンス
{
  "success": true,
  "data": [
    { "id": 1, "name": "fastapi", "slug": "fastapi" }
  ]
}

---

# 7. カテゴリ一覧 GET /api/categories
## 補足
- name の昇順で返す

## 200レスポンス
{
  "success": true,
  "data": [
    { "id": 1, "name": "Backend", "slug": "backend", "color": "#0EA5E9", "icon": "code" }
  ]
}

---

# 8. 画像アップロード POST /api/upload-image
- 認証必須

## Multipart FormData
file: image/png など

## 保存ルール
- 画像は `UPLOAD_ROOT` で指定したディレクトリ配下に保存する（デフォルトは `backend/uploads`）
- 保存先は `{UPLOAD_ROOT}/articles/{YYYY}/{MM}/`
- ファイル名は UUID を用いる
- 元ファイル名は URL やパスに使用しない

## 201レスポンス
{
  "success": true,
  "data": {
    "url": "/uploads/abc.png"
  }
}

## 補足
- url は `ASSET_BASE_URL` を先頭にした絶対URLを返す

---

# 9. 前後の記事取得 GET /api/articles/{id}/prev-next
- id を基準に前後の記事を返す（公開APIでは isDraft=false のみ）
- 管理APIでは認証が必要、ドラフトも取得可能
- prev/next の判定は publishedAt の降順を基準にする
- publishedAt が同一、または null の場合は createdAt の降順、さらに id の降順で決める

## 200レスポンス
{
  "success": true,
  "data": {
    "prev": {
      "id": 11,
      "slug": "prev-article",
      "title": "前の記事",
      "createdAt": "...",
      "publishedAt": "...",
      "isDraft": false
    },
    "next": {
      "id": 13,
      "slug": "next-article",
      "title": "次の記事",
      "createdAt": "...",
      "publishedAt": "...",
      "isDraft": false
    }
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
  - 環境変数 `ADMIN_ALLOWED_EMAILS` に、管理者として許可するメールをカンマ区切りで列挙する。  
  - JWT の email がこの中にあり、admin_users に未登録なら初回アクセス時に自動で作成。  
  - 含まれないメールなら 403。
- エラー時の返し方  
  - JWT 不正/期限切れ → 401  
  - メールが許可されていない → 403
  - バリデーションエラー（クエリ/ボディの不正） → 422  
    - 統一エラー形式で `REQUEST_VALIDATION_ERROR` を返す  
    - message は固定文言（例: `入力内容が正しくありません`）

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

---

# テスト対象（PR4 で最低限）
- slug 生成/重複（自動生成は連番、明示指定は 409）
- 公開/下書きの分離（公開 API は下書きを返さない、管理 API は draft 指定で切り替え可能）
- publishedAt の挙動（公開時セット、非公開でも保持、再公開で更新）
- タグ/カテゴリの複数フィルタ
- prev/next（publishedAt の降順、公開 API は公開のみ）
- 認証保護（401/403 の挙動）
- 画像アップロード（保存先・UUID・返却 URL）
