# 04. URL 設計（Routing Design）

## 公開側（Next.js）

### トップページ
/
- Hero セクション（自己紹介）
- 最新記事を 3 件表示
- 「すべての記事を見る」ボタンで /articles に遷移

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

### 前後記事
API: GET /api/articles/{id}/prev-next  
フロントから記事詳細画面で利用し、前後記事リンクを表示する

---

### タグ一覧
/tags

### カテゴリ一覧
/categories

---

## 管理側（Next.js）

### ログイン（GitHub OAuth）
/admin/login

### 管理用の記事一覧
/admin/articles

### 記事作成
/admin/articles/new

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

### 記事一覧フィルタ（MVP 完成後に追加）
GET /api/articles?page=&limit=&tags=&categories=

- tags（複数タグ指定、repeat 方式）
- categories（複数カテゴリ指定、repeat 方式）

### 記事詳細
GET /api/articles/{slug}

### 記事作成
POST /api/articles

### 記事更新
PATCH /api/articles/{id}

### 記事削除
DELETE /api/articles/{id}

### 画像アップロード
POST /api/upload-image

### タグ一覧
GET /api/tags

### カテゴリ一覧
GET /api/categories

---

## API 認証

### 管理系 API は NextAuth で発行されるトークンを検証
- フロントから API 呼び出し時に `Authorization` ヘッダで送信
- FastAPI 側のミドルウェアで検証し、認証失敗時は 401 を返す

---

## URL 設計方針まとめ
- `/` はポートフォリオ兼トップページ（Hero + 最新記事）
- 記事一覧は `/articles` に配置
- 記事詳細は slug ベースになる
- タグ・カテゴリは一覧ページを提供し、記事一覧フィルタは MVP 完成後に追加する
- 管理画面は `/admin` 配下にまとめる
- API は `/api` 配下に統一する
- フィルタ（タグ・カテゴリ）はクエリパラメータの repeat 方式で対応する
