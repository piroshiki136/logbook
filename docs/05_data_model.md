# 05. データモデル（Data Model / ERD）

本プロジェクト「logbook」で使用するデータモデルをまとめる。
記事・タグ・管理者の構造を中心に、MVP に必要な最小構成で設計する。

---

## 1. モデル一覧

- articles（記事）
- categories（カテゴリ。色・アイコンなど将来拡張を想定）
- tags（タグ。slug でURL安定化）
- article_tags（記事とタグの多対多中間）
- admin_users（管理者）
- images（今回は未使用のため作成しない）

---

## 2. テーブル間の関係（ER 図）

categories (1) ──── (N) articles (1) ──── (N) article_tags (N) ──── (1) tags

admin_users: 認証用。記事とは直接関連付けない（MVP では author 管理をしない）。

- 記事とタグは多対多（N:N）
- 記事はカテゴリに1:Nで属する（将来的にカテゴリに色/アイコンを持たせられる）
- 管理者は NextAuth（Google OAuth）と連携するための情報を保存する

---

## 3. テーブル定義一覧

### 3.1 categories（カテゴリ）

| フィールド | 型        | 説明 |
|------------|-----------|------|
| id         | int (PK)  | 主キー |
| name       | string    | カテゴリ名（ユニーク） |
| slug       | string    | URL 用識別子（ユニーク、小文字・英数字+ハイフン） |
| color      | string    | 任意（将来拡張用。NULL可） |
| icon       | string    | 任意（将来拡張用。NULL可） |

### 3.2 articles（記事）

| フィールド   | 型        | 説明 |
|--------------|-----------|------|
| id           | int (PK)  | 主キー |
| slug         | string    | URL 用識別子（ユニーク。自動生成＋手動修正可） |
| title        | string    | 記事タイトル |
| content      | text      | Markdown本文 |
| category_id  | int (FK → categories.id) | 1記事1カテゴリ |
| created_at   | datetime  | 作成日時 |
| updated_at   | datetime  | 更新日時 |
| is_draft     | boolean   | 下書きフラグ |

### 3.3 tags（タグ）

| フィールド | 型        | 説明 |
|------------|-----------|------|
| id         | int (PK)  | 主キー |
| name       | string    | タグ名（ユニーク） |
| slug       | string    | URL 用識別子（ユニーク、小文字・英数字+ハイフン） |

※ 将来、説明文・色などを追加できるよう拡張前提。

### 3.4 article_tags（中間テーブル：記事とタグの多対多）

| フィールド   | 型        | 説明 |
|--------------|-----------|------|
| article_id   | int (FK → articles.id) | 記事ID |
| tag_id       | int (FK → tags.id)     | タグID |

- `(article_id, tag_id)` を複合ユニークにする
  → 同じ記事に同じタグを重複登録できないようにする

### 3.5 admin_users（管理者）

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
カテゴリは categories.slug を文字列で返す想定。

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

---

## 5. slug 生成ルール
- 文字種: 小文字の英数字とハイフンのみ（スペースや記号はハイフンに置換）
- 日本語タイトル: ローマ字変換を試みる。変換できない部分は日付タイムスタンプを付けて衝突を避ける
- 重複時: 末尾に `-2`, `-3` ... の連番サフィックスを付ける
- 手動編集: 管理UIから修正可能だが、保存時に同じ重複チェックを行う

---

## 6. 保存仕様
### 6.1 マイグレーション適用手順
- 初回セットアップ時: `cd backend && uv run alembic upgrade head` を実行し、ERD と一致するテーブルを DB に作成する。
- 以降、スキーマ変更のたびに新しいバージョンを `alembic upgrade head` で適用する（docs/10 PR3 以降の計画参照）。

### 6.2 データ保存ポリシー
- 本文は Markdown のみ保存
  → Next.js の SSG/SSR で HTML へ変換するため DB に HTML を保存しない
- slug はタイトルからの自動生成＋手動修正可能（上記ルールでバリデーション）
- 画像保存: 本番は Cloudflare R2（S3 互換）に保存し、公開 read のバケットをカスタムドメイン（例: `https://assets.logbook.example`）で配信する。オブジェクトキーは `articles/{yyyy}/{mm}/{uuidv4}.{ext}`。開発環境では従来通り FastAPI が `/uploads`（Docker で永続化）を配信し、`ASSET_BASE_URL=http://localhost:8000/uploads` を想定する。
- 画像バリデーション: 許可 MIME は `image/png` / `image/jpeg` / `image/webp`、上限 5MB。フロントと API 両方でチェックする。

### 6.3 開発用サンプルデータ（seed）
- `backend/scripts/seed.py` でカテゴリ/タグ/記事/記事タグ/管理ユーザーを最小構成で投入する。
- 実行: `cd backend && uv run python -m scripts.seed`
- 例: Category=Programming、Tag=Python/FastAPI、Article=Hello LogBook、AdminUser=admin@example.com


