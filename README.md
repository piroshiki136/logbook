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
  - `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`（NextAuth GitHub）
  - `NEXTAUTH_URL`（ローカルは `http://localhost:3000` を想定）
  - `AUTH_SECRET`（Auth.js の署名用シークレット）
  - `AUTH_URL`（アプリの正しいURL。OAuthのコールバックURLやリダイレクト先生成に使用）
  - `ADMIN_ALLOWED_EMAILS`（管理画面の許可メール。カンマ区切り）
  - `FRONTEND_ASSERTION_PRIVATE_KEY`（アサーションJWTの署名用秘密鍵）
  - `FRONTEND_ASSERTION_KID`（アサーションJWTの `kid`）
- backend（`.env` など）
  - `APP_MODE`（`local` / `dev` / `stg` / `prod`。debug/log レベル判定に利用）
  - `SETTINGS_ENV`（`.env` 読み分け用。`test` の場合は `backend/.env.test` を読む）
  - `DATABASE_URL`（PostgreSQL 接続）
  - `JWT_PUBLIC_KEY`（NextAuth が RS256 で署名した JWT の公開鍵。`\n` 区切り可）
  - `JWT_PRIVATE_KEY`（バックエンドJWTの署名用秘密鍵。`\n` 区切り可）
  - `JWT_ALGORITHM`（省略時は `RS256`）
  - `JWT_ISSUER` / `JWT_AUDIENCE`（検証用の識別子。既定値は `logbook`）
  - `ADMIN_ALLOWED_EMAILS`（必須。カンマ区切り）
  - `FRONTEND_ASSERTION_PUBLIC_KEY`（アサーションJWTの公開鍵。`\n` 区切り可）
  - `FRONTEND_ASSERTION_JWKS_URL`（アサーションJWTの JWKS URL）
  - `FRONTEND_ASSERTION_ISSUER`（アサーションJWTの `iss`。既定値は `logbook-frontend`）
  - `UPLOAD_ROOT`（画像保存先ディレクトリ。相対パスは `backend/` 配下を基準に解決）
  - `ASSET_BASE_URL`（画像配信用のベース URL。開発は `http://localhost:8000/uploads`）
  - `UPLOAD_IMAGE_MAX_BYTES`（画像アップロードの最大サイズ）
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
- Lint（修正あり）: `cd frontend && pnpm biome check --write .`
- Unit/Integration Test: `cd frontend && pnpm test`
- Coverage: `cd frontend && pnpm coverage`
- E2E Test: `cd frontend && pnpm e2e`

### backend
```bash
cd backend
uv sync
uv run alembic upgrade head  # 初回のみ、DB にテーブルを作成する
uv run fastapi dev app/main.py
```
開発用サンプルデータ（任意）:
```
uv run python -m scripts.seed
```
開発用サンプル記事を全削除して再生成する場合:
```
CONFIRM_DELETE_SEED_ARTICLES=1 uv run python -m scripts.delete_seed_articles
uv run python -m scripts.seed
```
- カテゴリ/タグ/管理ユーザーも含めて全削除する場合:
```
CONFIRM_DELETE_SEED_ARTICLES=1 CONFIRM_DELETE_SEED_ALL=1 uv run python -m scripts.delete_seed_articles
uv run python -m scripts.seed
```
- `scripts.delete_seed_articles` は事故防止のため以下を満たさないと実行できない:
  - `APP_MODE` が `local` または `dev`
  - DB 接続先がローカル安全ホスト（`localhost` / `127.0.0.1` / `db`）または sqlite
  - `CONFIRM_DELETE_SEED_ARTICLES=1` が設定されている
  - 全削除時は `CONFIRM_DELETE_SEED_ALL=1` が追加で必要
- テスト: `cd backend && uv run pytest`
- backend の API テストは httpx の AsyncClient + pytest-anyio で非同期実行する
- Lint: `cd backend && uv run ruff check .`
- Format: `cd backend && uv run ruff format .`
- Format check: `cd backend && uv run ruff format --check .`

### backend を Docker で起動する
本番は `backend/Dockerfile` を使って Cloud Run へデプロイする前提。

```bash
docker build -t logbook-backend ./backend
docker run --rm -p 8000:8000 --env-file ./backend/.env \
  -e PORT=8000 \
  logbook-backend
```

- コンテナは `uvicorn app.main:app --host 0.0.0.0 --port ${PORT}` で起動する
- Cloud Run では `PORT` はプラットフォーム側から自動で渡される
- 本番では `APP_MODE=prod` と `CORS_ALLOW_ORIGINS` を明示的に設定する

### テスト用環境変数（backend）
pytest 実行時は自動で `SETTINGS_ENV=test` を設定し、`backend/.env.test` を参照する。最低限以下を用意する。
```
DATABASE_URL=sqlite+pysqlite:///./test.db
JWT_PUBLIC_KEY=dummy
JWT_ALGORITHM=RS256
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
