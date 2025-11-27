# 03. 使用技術（Technology Stack）

## フロントエンド
- Next.js 15（App Router、Node.js 20 LTS 前提）
- React 18.2
- TypeScript 5.5
- Tailwind CSS 3.4
- shadcn/ui
- react-markdown + remark-gfm
- react-hook-form + zod
- next-auth v5（Google OAuth）
- Biome
- pnpm 9

## バックエンド
- Python 3.12
- FastAPI 0.115
- SQLAlchemy 2.0 系
- Alembic 1.13
- python-dotenv
- python-jose
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

## 開発ツール
- Git（バージョン管理）
- GitHub（リポジトリ管理、Issue、PR）
- GitHub Copilot（補完）
- codex CLI（コード生成・作業効率化）
- VS Code（エディタ）
