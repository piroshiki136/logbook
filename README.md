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
  - `APP_MODE`（`local` / `dev` / `stg` / `prod`。debug/log レベル判定に利用）
  - `SETTINGS_ENV`（`.env` 読み分け用。`test` の場合は `backend/.env.test` を読む）
  - `DATABASE_URL`（PostgreSQL 接続）
  - `JWT_PUBLIC_KEY`（NextAuth が RS256 で署名した JWT の公開鍵。`\n` 区切り可）
  - `JWT_ALGORITHM`（省略時は `RS256`）
  - `JWT_ISSUER` / `JWT_AUDIENCE`（検証用の識別子。既定値は `logbook`）
  - `ADMIN_ALLOWED_EMAILS`（必須。カンマ区切り）
  - `UPLOAD_ROOT`（画像保存先ディレクトリ。相対パスは `backend/` 配下を基準に解決）
  - `ASSET_BASE_URL`（画像配信用のベース URL。開発は `http://localhost:8000/uploads`）
- `.env.example` / `.env.local.example` にキーのみ記載し、実値は各自で設定する。

## セットアップと起動
### frontend
```bash
cd frontend
pnpm install
pnpm dev
```
- Lint: `cd frontend && pnpm lint`
- Format: `cd frontend && pnpm format`

### backend
```bash
cd backend
uv sync
uv run alembic upgrade head  # 初回のみ、DB にテーブルを作成する
uv run fastapi dev app.main:app
```
開発用サンプルデータ（任意）:
```
uv run python -m scripts.seed
```
- テスト: `cd backend && uv run pytest`
- backend の API テストは httpx の AsyncClient + pytest-anyio で非同期実行する
- Lint: `cd backend && uv run ruff check .`
- Format: `cd backend && uv run ruff format .`
- Format check: `cd backend && uv run ruff format --check .`

### テスト用環境変数（backend）
pytest 実行時は自動で `SETTINGS_ENV=test` を設定し、`backend/.env.test` を参照する。最低限以下を用意する。
```
DATABASE_URL=sqlite+pysqlite:///./test.db
JWT_PUBLIC_KEY=dummy
ADMIN_ALLOWED_EMAILS=test@example.com
```

## CI（GitHub Actions）
backend の CI では以下の Repository Secrets を参照する。
- `DATABASE_URL`
- `JWT_PUBLIC_KEY`
- `ADMIN_ALLOWED_EMAILS`

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

## PR2 作業チェック（概要）
- FastAPI の設定層（core/settings/auth）、DB セッション、共通レスポンス/例外処理を追加
- SQLAlchemy モデル（articles/categories/tags/article_tags/admin_users）と Pydantic スキーマの雛形
- Alembic 初期マイグレーション、`backend/tests` の土台
- docs/05, docs/07 に差分が出た場合は更新

## PR3 作業チェック（概要）
- GitHub Actions で backend/frontend の CI を追加（`.github/workflows/ci-backend.yml` / `ci-frontend.yml`）
- テスト用 Secrets（`DATABASE_URL`, `JWT_PUBLIC_KEY` など）の扱いを決めて Team Docs に記す
- サンプルデータ投入スクリプト（`backend/scripts/seed.py`）を整備する
- サンプルデータ投入手順を `README` と `docs/05` にまとめる
