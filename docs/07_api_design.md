# API仕様（MVP）

## 共通事項
- ベースURL: https://api.example.com
- 認証: Bearer Token（バックエンド JWT）
- 認証必須のエンドポイント: POST / PATCH / DELETE 系
- GET でも draft を取得したい場合は認証が必要
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

# 0. ヘルスチェック
## 0.1 GET /api/health
## 補足
- テスト/開発用途のエンドポイント。公開運用時は削除/無効化を検討する。

## 200レスポンス
{
  "success": true,
  "data": {
    "status": "ok"
  }
}

## 0.2 GET /api/health/db
## 補足
- DB に接続できるかを確認する

## 200レスポンス
{
  "success": true,
  "data": {
    "status": "ok"
  }
}

---

# 1. 記事一覧 GET /api/articles
## クエリ
- page?: number（デフォルト: 1）
- limit?: number（デフォルト: 10、最大: 50）
- draft?: boolean（管理APIのみ指定可。公開APIでは false 固定）

## 補足
- 記事は 1 記事 1 カテゴリ
- 公開APIの並び順は publishedAt の降順（公開が新しい順）
- 管理APIの並び順は、全記事が updatedAt の降順、公開記事が publishedAt の降順、draft=true が updatedAt の降順
- draft を指定した場合は管理者認証が必要（未認証は 401）
- tags / categories による公開記事フィルタは MVP では未提供とし、一覧 API は page / limit を基本とする

## MVP 完成後に追加するクエリ
- tags?: string（repeat 方式。例: `?tags=nextjs&tags=fastapi`）
- categories?: string（repeat 方式。例: `?categories=web&categories=backend`）

## MVP 完成後の補足
- tags / categories は同名パラメータの複数指定（repeat）のみ許可する
- tags の複数指定は OR 条件（いずれかを含む記事を返す）
- tags は NFKC 正規化 + 小文字化して slug として扱う（表記ゆれ防止）

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

## 補足
- 未認証の公開アクセスでは `isDraft=false` かつ `publishedAt != null` の記事のみ取得できる
- 管理APIでは認証が必要、ドラフトや未公開記事も取得可能

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

# 2.1 管理用記事詳細 GET /api/articles/by-id/{id}
## パス
- id（number）

## 補足
- 管理画面の編集導線で使用する
- 認証必須
- draft / 未公開記事も取得できる

## 200レスポンス
`GET /api/articles/{slug}` と同一のレスポンス形式を返す。

---

# 公開日時（publishedAt）の扱い
- isDraft=false に変更したタイミングで publishedAt に現在時刻をセットする
- publishedAt は「最終公開日時」として扱う（未公開記事のみ null）
- 非公開（isDraft=true）に戻した場合も publishedAt は保持する
- 再公開時は publishedAt を現在時刻で上書きする

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
- 自動生成は title を小文字化し、許可文字以外をハイフンに置換、連続ハイフンは1つに圧縮、前後のハイフンは除去する
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
- MVP 対象外。公開停止は `isDraft=true` による非公開化で対応する

---

# 6. タグ一覧 GET /api/tags
## 位置づけ
- MVP では公開画面から利用しない
- 管理タグ機能や公開タグ一覧を実装する後続フェーズ向け API として扱う

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

# 6.1 タグ更新 PATCH /api/tags/{tagId}
- 認証必須

## パス
- tagId（number）

## ボディ
{
  "name": "FastAPI Web"
}

## 補足
- 管理画面ではタグの表示名（`name`）のみ更新する
- `slug` はタグの正規化キーとして維持する

## 200レスポンス
{
  "success": true,
  "data": {
    "id": 1,
    "name": "FastAPI Web",
    "slug": "fastapi"
  }
}

---

# 7. カテゴリ一覧 GET /api/categories
## 位置づけ
- MVP では公開画面から利用しない
- 管理カテゴリ機能や公開カテゴリ一覧を実装する後続フェーズ向け API として扱う

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

# 7.1 カテゴリ作成 POST /api/categories
- 認証必須

## ボディ
{
  "name": "Frontend Platform",
  "slug": "frontend-platform",
  "color": "#123456",
  "icon": "layers"
}

## 補足
- `slug` が未指定の場合は `name` から自動生成する

## 201レスポンス
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Frontend Platform",
    "slug": "frontend-platform",
    "color": "#123456",
    "icon": "layers"
  }
}

---

# 8. 画像アップロード POST /api/upload-image
- MVP 対象外。後続フェーズで有効化する将来 API として扱う
- 認証必須

## Multipart FormData
file: `image/png` / `image/jpeg` / `image/webp` / `image/gif`

## 保存ルール
- 画像は `UPLOAD_ROOT` で指定したディレクトリ配下に保存する（デフォルトは `backend/uploads`）
- 保存先は `{UPLOAD_ROOT}/articles/{YYYY}/{MM}/`
- ファイル名は UUID を用いる
- 元ファイル名は URL やパスに使用しない
- 1ファイル上限は 5MB（`UPLOAD_IMAGE_MAX_BYTES` で変更可能）

## エラーレスポンス（サイズ超過）
ステータス: 413
{
  "success": false,
  "error": {
    "code": "REQUEST_FAILED",
    "message": "画像ファイルのサイズが上限を超えています"
  }
}

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
- id で対象記事を指定し、その記事の前後を返す（公開APIでは `isDraft=false` かつ `publishedAt!=null` のみ）
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
- 交換エンドポイント  
  - `POST /api/auth/token`
  - フロントは Server Actions で NextAuth セッションを取得し、アサーションJWTを生成して送信する。
  - 交換後のバックエンド JWT を管理 API 呼び出しに利用する。
- アサーションJWT（フロント発行）  
  - 署名方式: RS256（非対称）
  - 有効期限: 2分
  - 必須クレーム: `iss=logbook-frontend`, `email`, `iat`, `exp`, `jti`
  - `/api/auth/token` は 1分あたり10回まで
- バックエンドの検証  
  - 署名検証（`alg` 固定、`kid` → JWKS/公開鍵）
  - `iss` / `exp` / `iat` を検証
  - `jti` を短時間（例: 3分）再利用拒否
  - `ADMIN_ALLOWED_EMAILS` で管理者判定
- バックエンドJWT  
  - 署名方式: RS256（既存設定）
  - 有効期限: 60分
  - 管理APIはバックエンドJWTを検証する
  - 可能な限り httpOnly Cookie かサーバー保持で運用し、ブラウザJSから触れない
  - 署名には `JWT_PRIVATE_KEY` を使用する
- 鍵配布  
  - フロントのみ保持: `FRONTEND_ASSERTION_PRIVATE_KEY`（署名用秘密鍵）
  - バックエンド側: `FRONTEND_ASSERTION_JWKS_URL`（推奨）または `FRONTEND_ASSERTION_PUBLIC_KEY`
  - `kid` を使ってローテーション（JWKSに複数鍵を掲載し短期併用）
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
- MVP: Cloudflare（無料枠）の WAF/レートリミットを有効化する。アプリ内の Redis + `fastapi-limiter` は導入しない。
- 将来対応: Cloudflare だけでは不足し、複数インスタンスで共有したアプリ内制御が必要になった場合のみ Redis 等の共有ストア導入を検討する。
- 閾値は運用状況に応じて調整し、Cloudflare とアプリ側で設定を同期する。

---

# テスト対象（PR4 で最低限）
- slug 生成/重複（自動生成は連番、明示指定は 409）
- 公開/下書きの分離（公開 API は下書きを返さない、管理 API は draft 指定で切り替え可能）
- publishedAt の挙動（公開時セット、非公開でも保持、再公開で更新）
- タグ/カテゴリの複数フィルタ
- タグ/カテゴリの複数指定は repeat のみ（カンマ区切りは不可）
- prev/next（publishedAt の降順、公開 API は公開のみ）
- 認証保護（401/403 の挙動）
- 画像アップロード（保存先・UUID・返却 URL）

## 注記
- タグ/カテゴリの複数フィルタは API としては実装・検証対象とする。
- ただし公開フロントのフィルタバー UI は MVP 完成後に再導入する。
