# 04. URL 設計（Routing Design）

## 公開側（Next.js）

### トップページ
/
- Hero セクション（自己紹介）
- 最新記事を 3 件表示
- 「記事一覧を見る」ボタンで /articles に遷移

---

### 記事一覧（MVP: ページネーション対応）
/articles
/articles?page=2

対応パラメータ（MVP）：
- `page`（ページ番号）

#### MVP 完成後に追加するフィルタ
- タグ・カテゴリのフィルタをクエリパラメータで指定する
- 形式は repeat 方式（例: `/articles?tags=nextjs&tags=fastapi&categories=web`）

---

### 記事詳細
/articles/[slug]

- Markdown をレンダリングして表示
- タグ・カテゴリ表示あり（リンク付与）

### 新旧記事
API: GET /api/articles/{id}/newer-older  
フロントから記事詳細画面で利用し、新しい記事 / 古い記事リンクを表示する

---

### タグ一覧
/tags

### カテゴリ一覧
/categories

---

## 管理側（Next.js）

### 管理トップ
/admin
- ログイン中の管理者情報を表示する
- 記事管理（`/admin/articles`）と新規作成（`/admin/articles/new`）への導線を配置する

### ログイン（GitHub OAuth）
/admin/login
- `callbackUrl` が `/admin` 配下の場合のみ、その URL へ遷移する
- `callbackUrl` 未指定または `/admin` 配下以外の場合は `/admin` へ遷移する
- NextAuth の `basePath` は `/api/auth`。`AUTH_URL` はローカル `http://localhost:3000/api/auth`、本番 `https://logbook-flame.vercel.app/api/auth` に統一する
- GitHub OAuth App の Authorization callback URL は本番 `https://logbook-flame.vercel.app/api/auth/callback/github`、ローカル `http://localhost:3000/api/auth/callback/github` を登録する

### 権限なし
/admin/forbidden
- 許可されていないメールアドレスでログインした場合に表示する
- サインアウト導線を配置する

### 管理用の記事一覧
/admin/articles
- 管理トップ（`/admin`）へ戻る導線をヘッダーに配置する
- 公開記事 / 非公開記事 / 全記事のタブ切り替えを提供する

### 記事作成
/admin/articles/new
- 管理トップ（`/admin`）へ戻る導線をヘッダーに配置する
- 保存成功後は `/admin/articles/[id]/edit` へ遷移する

### 記事編集
/admin/articles/[id]/edit
id を使用し、slug 編集を許容する。

---

## API（FastAPI）

### 記事一覧（MVP: ページネーション）

GET /api/articles?page=&limit=

- page（ページ番号）
- limit（1ページあたり件数）
- 未認証の公開アクセスでは公開済み記事のみを返す
- `draft` は管理用途のみ指定可とし、公開側では `false` 固定とする
- 公開 API は `tags` / `categories` による絞り込みにも対応するが、MVP では公開フロントのフィルタ UI は提供しない

### 記事一覧フィルタ（API は提供済み、公開 UI は MVP 完成後に追加）
GET /api/articles?page=&limit=&tags=&categories=

- tags（複数タグ指定、repeat 方式）
- categories（複数カテゴリ指定、repeat 方式）

### 記事詳細
GET /api/articles/{slug}

### 管理用の記事詳細
GET /api/articles/by-id/{id}
- 管理画面の編集導線は `slug` ではなく `id` を使用する

### 記事作成
POST /api/articles

### 記事更新
PATCH /api/articles/{id}

### 記事削除
DELETE /api/articles/{id}
- 記事削除機能は MVP 対象外とし、運用上は非公開化で対応する

### 画像アップロード
POST /api/upload-image
- 画像アップロード機能は MVP 対象外とし、後続フェーズで有効化する

### タグ一覧
GET /api/tags

### カテゴリ一覧
GET /api/categories

---

## API 認証

### 管理系 API はバックエンド JWT を検証する
- フロントの Server Actions で NextAuth セッションからアサーション JWT を生成する
- `POST /api/auth/token` でバックエンド JWT に交換してから API を呼び出す
- フロントから API 呼び出し時に `Authorization: Bearer <backend token>` を送信する
- FastAPI 側のミドルウェアで検証し、認証失敗時は 401、権限不足時は 403 を返す

---

## URL 設計方針まとめ
- `/` はポートフォリオ兼トップページ（Hero + 最新記事）
- 記事一覧は `/articles` に配置
- 記事詳細は slug ベースになる
- タグ・カテゴリは一覧ページを提供し、記事一覧フィルタは MVP 完成後に追加する
- 管理画面は `/admin` 配下にまとめる
- API は `/api` 配下に統一する
- フィルタ（タグ・カテゴリ）はクエリパラメータの repeat 方式で対応する
