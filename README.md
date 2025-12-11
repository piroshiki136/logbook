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
- backend（`.env` など）
  - `DATABASE_URL`（PostgreSQL 接続）
  - `JWT_SECRET`（管理画面 API 向け）
- 秘密値は記載せず、キーだけ `.env.example` にまとめている。

## セットアップと起動
### frontend
```bash
cd frontend
pnpm install
pnpm dev
```
Lint: `cd frontend && pnpm lint`

### backend
```bash
cd backend
uv sync
uv run fastapi dev
```
テスト: `cd backend && uv run pytest backend/tests`

## ディレクトリ構成メモ
- `frontend/` Next.js 15 App Router、Tailwind、shadcn/ui（予定）
- `backend/` FastAPI + SQLAlchemy、Alembic、pytest
- `docs/` 仕様/ルール（01〜10）、作業計画と未決事項
- `infra/` Docker/シード/バックアップ関連（今後追加）

## PR1 作業チェック（概要）
- README に起動手順と依存前提を追記する
- docs/todo の未決事項を整理し、関連 docs を同期する
- frontend のテンプレ UI を削除し、`globals.css` を土台スタイルにする
- `pnpm lint --filter frontend` と `uv run fastapi dev` で起動確認する（結果を記録）
