# 03. 使用技術（Technology Stack）

## フロントエンド
- Next.js 15（App Router、Node.js 20 LTS 前提）
- React 18.2
- TypeScript 5.5
- Tailwind CSS 3.4
- shadcn/ui
- react-markdown + remark-gfm
- react-hook-form + zod
- next-auth v5（GitHub OAuth / beta。MVP 後に v4 もしくは Better Auth へ移行検討）
- Biome
- pnpm 9

## バックエンド
- Python 3.12
- FastAPI 0.115
- SQLAlchemy 2.0 系
- Alembic 1.13
- python-dotenv
- PyJWT
- passlib[bcrypt]
- uvicorn 0.30
- uv 0.9+
- Ruff（Python の Lint / Formatter）

## データベース
- PostgreSQL 15（ローカルは Docker Compose で起動）
- 本番はデプロイ先に合わせて PostgreSQL を利用（Railway、Render など）

## インフラ
- Docker Compose（Next.js、FastAPI、PostgreSQL の開発環境統合）
- フロントエンドデプロイ：Vercel
- バックエンドデプロイ：Railway / Render / Fly.io
- CDN/WAF/Rate Limit: Cloudflare（無料プラン）で WAF + IP ごとのレートリミットを有効化し、本番/ステージングでは FastAPI 側でも Redis + `fastapi-limiter` による 60 req/min（公開 API）・30 req/min（管理 API）の制限を二重に掛ける。ローカル開発の初期段階では `fastapi-limiter` は無効化し、将来的に Redis を起動した段階でトグルできるようにする。

### ストレージ / バックアップ方針
- 画像アップロード（本番）: Cloudflare R2（S3互換、無料枠あり）を使用。配信用カスタムドメイン（例: `https://assets.logbook.example`）を割り当て、オブジェクトキーは `articles/{yyyy}/{mm}/{uuidv4}.{ext}` に統一する。
- 画像アップロード（開発）: FastAPI が `/uploads` を静的配信し、`backend/uploads` ディレクトリを Docker ボリュームで永続化する。
- 認可/公開: バケットは public read。書き込みは管理API経由のみ許可し、NextAuth JWT を必須とする。
- 環境変数例: `S3_ENDPOINT`（R2エンドポイント）, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`（画像用）, `ASSET_BASE_URL`（公開URLベース）, `UPLOAD_IMAGE_MAX_BYTES`（例: `5242880`）。
- 容量/バリデーション: 1ファイル上限 5MB、許可 MIME は `image/png` / `image/jpeg` / `image/webp` / `image/gif`。フロントと FastAPI の双方で検証する。
- DB バックアップ（本番）: Cloudflare R2 のバックアップ専用バケットに `pg_dump` を毎日 UTC 03:00 取得し、7日保持。バックアップ用 IAM キーは専用に分離し、権限は対象バケットへの `PutObject` / `ListBucket` / `GetObject` のみに限定する。
- DB バックアップ（開発）: 自動バックアップなし。必要に応じて手動 `pg_dump` をローカル保存またはバックアップバケットへアップロード。
- 環境変数例（バックアップ用）: `DB_BACKUP_BUCKET`, `DB_BACKUP_RETENTION_DAYS=7`, `R2_BACKUP_ACCESS_KEY_ID`, `R2_BACKUP_SECRET_ACCESS_KEY`, `R2_BACKUP_ENDPOINT`, `R2_BACKUP_REGION`, `DATABASE_URL`（バックアップ元）。
- セキュリティ: バックアップ専用キーは画像用キーと分離し、公開アクセス無効。鍵は 90〜180 日でローテーションし、失効手順を `infra/backup.md` に記載予定。

## 開発ツール
- Git（バージョン管理）
- GitHub（リポジトリ管理、Issue、PR）
- GitHub Copilot（補完）
- codex CLI（コード生成・作業効率化）
- VS Code（エディタ）

## 環境変数（ローカル/本番で共通化するキー）
### フロントエンド（frontend/.env.local）
- `NEXTAUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `NEXTAUTH_URL`（例: `http://localhost:3000`）
- `BACKEND_API_BASE`（例: `http://localhost:8000`）
- `ASSET_BASE_URL`（例: `http://localhost:8000/uploads`）
- `AUTH_SECRET`（Auth.js の署名用シークレット）
- `AUTH_URL`（アプリの正しいURL。OAuthのコールバックURLやリダイレクト先生成に使用）
- `ADMIN_ALLOWED_EMAILS`
- `FRONTEND_ASSERTION_PRIVATE_KEY`
- `FRONTEND_ASSERTION_KID`

### バックエンド（backend/.env）
- 基本: `DATABASE_URL`（例: `postgresql+psycopg://user:pass@localhost:5432/logbook`）、`REDIS_URL`（例: `redis://localhost:6379/0`）、`JWT_PUBLIC_KEY`（NextAuth が RS256 で署名したトークンの公開鍵。`\n` で改行可）、`JWT_PRIVATE_KEY`（バックエンドJWTの署名用秘密鍵。`\n` で改行可）、`JWT_ALGORITHM`（省略時は `RS256`）、`JWT_ISSUER` / `JWT_AUDIENCE`、`ADMIN_ALLOWED_EMAILS`
- 認証連携: `FRONTEND_ASSERTION_PUBLIC_KEY` または `FRONTEND_ASSERTION_JWKS_URL`、`FRONTEND_ASSERTION_ISSUER`
- 画像/R2 用: `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `ASSET_BASE_URL`, `UPLOAD_IMAGE_MAX_BYTES`
- バックアップ/R2 用: `DB_BACKUP_BUCKET`, `DB_BACKUP_RETENTION_DAYS=7`, `R2_BACKUP_ENDPOINT`, `R2_BACKUP_REGION`, `R2_BACKUP_ACCESS_KEY_ID`, `R2_BACKUP_SECRET_ACCESS_KEY`

## ポート設計（ローカル/コンテナで共通化）
- Next.js (frontend): 3000
- FastAPI (backend): 8000
- PostgreSQL: 5432
- Redis: 6379

## メモ（段階的導入）
- Redis はレートリミット用に利用するが、初期ローカル開発では `fastapi-limiter` を OFF にしても API が動くようにし、将来 Redis を導入するタイミングで `REDIS_URL` と「レートリミット有効化フラグ（例: `ENABLE_RATE_LIMITER`）」を設定して切り替える。
- Docker Compose はローカルで API/DB がひと通り動いた段階で作成し、frontend/backend/db/redis、ボリューム（DB/`backend/uploads`）、ポートを整理する。
