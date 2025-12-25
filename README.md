# logbook

Next.js (App Router) と FastAPI で作るログブックアプリ。初期実装は docs/10_pr_plan.md の PR1（ドキュメント/環境整備）から着手する。

## 必要環境
- Node.js 20.9 以上、pnpm
- Python 3.12 系、uv
- PostgreSQL（後続 PR で接続予定）
- Git

## 環境変数
- frontend（`.env.local` など）
  - `NEXTAUTH_SECRET`（セッション暗号用）
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`（NextAuth Google）
  - `NEXTAUTH_URL`（ローカルは `http://localhost:3000` を想定）
- backend（`.env` など）
  - `DATABASE_URL`（PostgreSQL 接続）
  - `JWT_PUBLIC_KEY`（NextAuth が RS256 で署名した JWT の公開鍵。`\n` 区切り可）
  - `JWT_ALGORITHM`（省略時は `RS256`）
  - `JWT_ISSUER` / `JWT_AUDIENCE`（検証用の識別子。既定値は `logbook`）
  - `ADMIN_ALLOWED_EMAILS`（必須。カンマ区切り推奨／JSON 配列も可で許可する管理者メール）
  - `ASSET_BASE_URL`（画像配信用のベース URL。開発は `http://localhost:8000/uploads`）
- `.env.example` / `.env.local.example` にキーのみ記載し、実値は各自で設定する。

## セットアップと起動
### frontend
```bash
cd frontend
pnpm install
pnpm dev
```
Lint: `cd frontend && pnpm lint`
Format: `cd frontend && pnpm format`

### backend
```bash
cd backend
uv sync
uv run alembic upgrade head  # 初回のみ、DB にテーブルを作成する
uv run fastapi dev app.main:app
```
テスト: `cd backend && uv run pytest tests`
Lint: `cd backend && uv run ruff check app tests`
Format: `cd backend && uv run ruff format app tests`
Format check: `cd backend && uv run ruff format --check app tests`

## ディレクトリ構成メモ
- `frontend/` Next.js 15 App Router、Tailwind、shadcn/ui（予定）
- `backend/` FastAPI + SQLAlchemy、Alembic、pytest
- `docs/` 仕様/ルール（01〜10）、作業計画と未決事項
- `infra/` Docker/シード/バックアップ関連（今後追加）

## PR1 作業チェック（概要）
- README に起動手順と依存前提を追記する
- docs/todo の未決事項を整理し、関連 docs を同期する
- frontend のテンプレ UI を削除し、`globals.css` を土台スタイルにする
- `pnpm lint --filter frontend` と `uv run fastapi dev app.main:app` で起動確認する（結果を記録）
