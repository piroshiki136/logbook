# 03. 使用技術（Technology Stack）

## フロントエンド
- Next.js 16（App Router、Node.js 22 前提）
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui
- react-markdown + remark-gfm
- react-hook-form + zod
- next-auth v5（GitHub OAuth / beta。MVP 後に v4 もしくは Better Auth へ移行検討）
- Biome
- Vitest + Testing Library（単体/結合テスト）
- Playwright（E2E テスト）
- pnpm 10

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
- 本番は Neon の PostgreSQL を利用する
- 本番 backend は `DATABASE_URL` で Neon に接続する
- Neon DB は作成済みで、Alembic マイグレーションを `head` まで適用済み

## インフラ
- Docker Compose（Next.js、FastAPI、PostgreSQL の開発環境統合）
- フロントエンドデプロイ：Vercel に統一する
- バックエンドデプロイ：Vercel に統一する
- 本番 DB：Neon に統一する
- 独自ドメイン：初期リリースでは未取得。`vercel.app` の標準ドメインを利用する
- 本番の公開構成は Vercel / Neon を前提とし、他のホスティング先はこの docs のスコープ外とする
- CDN/WAF/Rate Limit: 本番の配信経路は Vercel の標準構成を前提とし、Cloudflare など特定ベンダーの WAF/レートリミットには依存しない。MVP では Redis / `fastapi-limiter` による共有レートリミットは導入しない。公開 API は読み取り中心、書き込み API は管理者認証で保護し、管理者は少人数運用を前提とする。従量課金リスクが低いため、初期リリースでは Vercel / backend のログ確認で運用し、異常なアクセスや負荷が確認された場合のみ Vercel 側の保護機能または Redis 等を使った共有制御を検討する。`/api/auth/token` のアプリ内簡易制限は既存実装として維持する。

### ストレージ / バックアップ方針
- 画像アップロード（本番）: MVP 後に必要になった時点で Cloudflare R2 などの外部ストレージを検討する。Vercel 実行環境のローカル保存は永続化前提にしない。
- 画像アップロード（開発）: FastAPI が `/uploads` を静的配信し、`backend/uploads` ディレクトリを Docker ボリュームで永続化する。
- 認可/公開: 画像アップロードを本番導入する場合、書き込みは管理API経由のみ許可し、NextAuth JWT を必須とする。
- 環境変数例（MVP後の画像保存用候補）: `S3_ENDPOINT`（R2エンドポイント）, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`（画像用）, `ASSET_BASE_URL`（公開URLベース）, `UPLOAD_IMAGE_MAX_BYTES`（例: `5242880`）。
- 容量/バリデーション: 1ファイル上限 5MB、許可 MIME は `image/png` / `image/jpeg` / `image/webp` / `image/gif`。フロントと FastAPI の双方で検証する。
- DB バックアップ（本番）: MVP では Neon の標準バックアップ / 復旧機能に依存する。独自の `pg_dump` 定期バックアップや R2 退避ジョブは導入しない。
- DB バックアップ（開発）: 自動バックアップなし。必要に応じて手動 `pg_dump` をローカル保存する。
- 将来対応: 運用後に Neon 標準機能だけでは不足すると判断した場合のみ、GitHub Actions + `pg_dump` + R2 などの独自バックアップを検討する。

## 開発ツール
- Git（バージョン管理）
- GitHub（リポジトリ管理、Issue、PR）
- GitHub Copilot（補完）
- codex CLI（コード生成・作業効率化）
- VS Code（エディタ）

## 環境変数（ローカル/本番で共通化するキー）
### フロントエンド（frontend/.env.local）
- `AUTH_SECRET`（Auth.js の署名用シークレット。本番専用に生成する）
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `AUTH_URL`（例: ローカル `http://localhost:3000/api/auth` / 本番 `https://logbook-flame.vercel.app/api/auth`）
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL`（互換用。新規設定は `AUTH_SECRET` / `AUTH_URL` に統一する）
- `NEXT_PUBLIC_API_BASE_URL`（例: ローカル `http://localhost:8000` / 本番 `https://<project>.vercel.app/_/backend`）
- `ASSET_BASE_URL`（例: `http://localhost:8000/uploads`）
- `ADMIN_ALLOWED_EMAILS`（backend と同じ値を設定する）
- `FRONTEND_ASSERTION_PRIVATE_KEY`
- `FRONTEND_ASSERTION_KID`（任意）

GitHub OAuth App の Authorization callback URL は、ローカルでは `http://localhost:3000/api/auth/callback/github`、本番では `https://logbook-flame.vercel.app/api/auth/callback/github` を登録する。

### バックエンド（backend/.env）
- 基本: `DATABASE_URL`（ローカル例: `postgresql+psycopg://user:pass@localhost:5432/logbook` / 本番: Neon 接続文字列）、`JWT_PUBLIC_KEY`（バックエンドJWTの検証用公開鍵。`\n` で改行可）、`JWT_PRIVATE_KEY`（バックエンドJWTの署名用秘密鍵。`\n` で改行可）、`JWT_ALGORITHM`（省略時は `RS256`）、`JWT_ISSUER` / `JWT_AUDIENCE`、`ADMIN_ALLOWED_EMAILS`（frontend と同じ値を設定する）
- CORS: `CORS_ALLOW_ORIGINS`（単一値の例: `https://logbook-flame.vercel.app`。複数値の例: `https://logbook-flame.vercel.app,http://localhost:3000`。JSON 配列は使わない）
- 認証連携: `FRONTEND_ASSERTION_PUBLIC_KEY` または `FRONTEND_ASSERTION_JWKS_URL`、`FRONTEND_ASSERTION_ISSUER`
- 画像/R2 用: `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `ASSET_BASE_URL`, `UPLOAD_IMAGE_MAX_BYTES`
- バックアップ/R2 用: `DB_BACKUP_BUCKET`, `DB_BACKUP_RETENTION_DAYS=7`, `R2_BACKUP_ENDPOINT`, `R2_BACKUP_REGION`, `R2_BACKUP_ACCESS_KEY_ID`, `R2_BACKUP_SECRET_ACCESS_KEY`

### `ADMIN_ALLOWED_EMAILS` の運用
- 管理画面と管理 API の許可メールリストとして利用する。
- 値はカンマ区切りで指定する。例: `admin@example.com,editor@example.com`
- 登録値とログインユーザーの email は、判定時に前後空白を除去し、小文字化する。大文字小文字は区別しない。
- frontend middleware と backend API の両方で判定するため、Vercel frontend / backend に同じ値を設定する。
- 未設定または空の場合、管理画面へのアクセスは許可されない。

## ポート設計（ローカル/コンテナで共通化）
- Next.js (frontend): 3000
- FastAPI (backend): 8000
- PostgreSQL: 5432

## メモ（段階的導入）
- Redis は MVP では導入しない。複数インスタンスでの共有レートリミットや永続ストアが本当に必要になった場合のみ採用を再検討する。
- Docker Compose はローカルで API/DB がひと通り動いた段階で作成し、frontend/backend/db、必要に応じて追加サービス、ボリューム（DB/`backend/uploads`）、ポートを整理する。
- 本番 URL は独自ドメイン未取得のため、`frontend=.vercel.app`、`backend=/_/backend`、`db=Neon` を前提に CORS、OAuth コールバック URL、API ベース URL を設定する。
- 本番 DB の初期セットアップは完了済み。以降のスキーマ変更は Alembic migration を追加し、Neon に `uv run alembic upgrade head` を適用してから本番アプリを更新する。
