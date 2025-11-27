# 05. データモデル（Data Model / ERD）

本プロジェクト「logbook」で使用するデータモデルをまとめる。
記事・タグ・管理者の構造を中心に、MVP に必要な最小構成で設計する。

---

## 1. モデル一覧

本アプリで利用するテーブルは以下のとおり。

- articles（記事）
- tags（タグ）
- article_tags（記事とタグの多対多中間）
- admin_users（管理者）
- images（今回は未使用のため作成しない）

---

## 2. テーブル間の関係（ER 図）

articles (1) ──── (N) article_tags (N) ──── (1) tags

admin_users: 認証用。記事とは直接関連付けない（MVP では author 管理をしない）。

- 記事とタグは多対多（N:N）
- 管理者は NextAuth（Google OAuth）と連携するための情報を保存する

---

## 3. テーブル定義一覧

### 3.1 articles（記事）

| フィールド   | 型        | 説明 |
|--------------|-----------|------|
| id           | int (PK)  | 主キー |
| slug         | string    | URL 用識別子（自動生成＋手動修正） |
| title        | string    | 記事タイトル |
| content      | text      | Markdown本文 |
| category     | string    | 1記事1カテゴリ |
| created_at   | datetime  | 作成日時 |
| updated_at   | datetime  | 更新日時 |
| is_draft     | boolean   | 下書きフラグ |

---

### 3.2 tags（タグ）

| フィールド | 型        | 説明 |
|------------|-----------|------|
| id         | int (PK)  | 主キー |
| name       | string    | タグ名（ユニーク） |

タグは後から説明文・色などを追加できるよう拡張しやすい構造にしている。

---

### 3.3 article_tags（中間テーブル：記事とタグの多対多）

| フィールド   | 型        | 説明 |
|--------------|-----------|------|
| article_id   | int (FK → articles.id) | 記事ID |
| tag_id       | int (FK → tags.id)     | タグID |

- `(article_id, tag_id)` を複合ユニークにする
  → 同じ記事に同じタグを重複登録できないようにする

---

### 3.4 admin_users（管理者）

| フィールド   | 型        | 説明 |
|--------------|-----------|------|
| id           | int (PK)  | 主キー |
| email        | string    | 管理者メールアドレス（Google アカウント） |
| provider     | string    | google |
| provider_id  | string    | Google OAuth のユーザーID |
| name         | string    | 表示名 |

- NextAuth（Google OAuth）と FastAPI 側の認証連携のために保持する
- MVP では記事の author と紐付けない（必要なら追加可能）

---

## 4. API が返す構造（例）

フロントエンドが扱いやすいように、
API レスポンスは tags を配列形式に変換して返す。

例（GET /api/articles/{slug}）:

```json
{
  "id": 12,
  "slug": "fastapi-intro",
  "title": "FastAPI 入門",
  "content": "...markdown...",
  "category": "backend",
  "tags": ["fastapi", "python"],
  "createdAt": "2025-01-22T12:00:00Z",
  "updatedAt": "2025-01-22T12:00:00Z",
  "isDraft": false
}
```
内部では article_tags を使うが、
外部 API では人間が扱いやすい形で返す。

## 5. 保存仕様
- 本文は Markdown のみ保存
→ Next.js の SSG/SSR によって HTML へ変換されるため HTML をDBに保存する必要はない
- slug はタイトルからの自動生成＋手動修正可能にする
- 画像はローカル保存（/uploads）とし、記事中で直接 URL を参照する方式を使う
