# 04. URL 設計（Routing Design）

## 公開側（Next.js）

### トップページ
/
- Hero セクション（自己紹介）
- 最新記事を複数件表示（例：3〜5件）
- 「すべての記事を見る」ボタンで /articles に遷移

---

### 記事一覧（ページネーション・フィルタ対応）
/articles
/articles?page=2

#### 複数タグ・複数カテゴリのフィルタ
クエリパラメータで指定する。
例：
/articles?tags=nextjs,fastapi&categories=web,backend
または複数クエリとして：
/articles?tag=nextjs&tag=fastapi&category=web
対応パラメータ：
- `page`（ページ番号）
- `tags`（カンマ区切り or 複数パラメータ）
- `categories`（カンマ区切り or 複数パラメータ）

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

### ログイン（Google OAuth）
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

### 記事一覧（フィルタ・ページネーション）

GET /api/articles?page=&limit=&tags=&categories=

- page（ページ番号）
- limit（1ページあたり件数）
- tags（複数タグ指定）
- categories（複数カテゴリ指定）

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
- タグ・カテゴリは一覧ページとフィルタをサポート
- 管理画面は `/admin` 配下にまとめる
- API は `/api` 配下に統一する
- フィルタ（タグ・カテゴリ）はクエリパラメータ方式で対応する
