# 08. コーディングガイドライン（Coding Guidelines / Minimal Version）

本ガイドラインは logbook プロジェクトのコーディング方針であり、Next.js / React / Python の公式ガイドラインに準拠しつつ、本プロジェクト特有のルールのみ最小限で追加する。必要になった場合は後から詳細を追記する。

---

# 1. 公式ガイドラインの準拠範囲

## フロントエンド（Next.js / TypeScript）
- Next.js 公式ドキュメントに準拠
  https://nextjs.org/docs/app/building-your-application
- React Hooks のルールに準拠
  https://react.dev/reference/rules
- TypeScript 公式ガイドに準拠
  https://www.typescriptlang.org/docs/
- shadcn/ui の公式ガイドに準拠
  https://ui.shadcn.com/

## バックエンド（FastAPI / Python）
- Python は PEP8 に準拠
  https://peps.python.org/pep-0008/
- FastAPI の公式スタイルに準拠
  https://fastapi.tiangolo.com/
- SQLAlchemy 2.0 スタイルに準拠
  https://docs.sqlalchemy.org/en/20/

---

# 2. ツールとフォーマッタ

## フロントエンド
- フォーマッタ: Biome
- パッケージ管理: pnpm
- 型チェック: TypeScript
- Lint: Biome（JS/TS/React/Tailwind）、コマンド例：`pnpm lint`
- Format: Biome、コマンド例：`pnpm format`
- 文字列リテラルはダブルクォートに統一する

## バックエンド
- フォーマッタと Linter: Ruff
- 依存管理: uv
- コードスタイル: PEP8 準拠
- インデントは 4 スペース、文字列リテラルはダブルクォートに統一
- import 整形も Ruff に従う

### Ruff 設定
- 設定ファイル: `backend/.ruff.toml`
- line-length: 100
- target-version: py312
- 有効ルールセット: `["E","F","I","B","UP"]`
- `alembic` ディレクトリは `exclude` により対象外とする

### コマンド例
- Lint (backend 配下の Python をチェック)
```bash
uv run ruff check .
```
※ `.ruff.toml` の `exclude` により `alembic` などは対象外
- Format (アプリケーションコードのみ整形)
```bash
uv run ruff format app tests
```
- Format チェック
```bash
uv run ruff format --check app tests
```

### 実行環境・設定ルール
- `APP_MODE` は `local` / `dev` / `stg` / `prod` を想定し、  
  debug/log レベル判定に使用する
- pytest 実行時は自動で `SETTINGS_ENV=test` を設定する  
  テスト用の環境変数は `backend/.env.test` に定義し、
  以下を含める：
  - `DATABASE_URL`
  - `JWT_PUBLIC_KEY`
  - `ADMIN_ALLOWED_EMAILS`
- backend の API テストは `httpx` の ASGITransport を使い、FastAPI アプリを直接叩く
- backend の API テストは `pytest-anyio` を使った `async def` で実装する

---

# 3. ディレクトリ構成の基本方針

## frontend（Next.js）
- app/ : ページとルーティング
- features/ : 機能単位のまとまり（blog, admin など）
- components/ : 共通コンポーネント
- hooks/ : カスタム hooks
- lib/ : util、APIクライアントなど

## backend（FastAPI）
- api/ : ルーター（エンドポイント）
- models/ : SQLAlchemy モデル
- schemas/ : Pydantic スキーマ
- services/ : ビジネスロジック
- core/ : 設定、共通レスポンス/例外、認証ミドルウェア
- db/ : DB 接続設定や Session 管理（SQLAlchemy Engine/SessionLocal など）

---

# 4. 命名規則

## フロント（TypeScript / React）
- コンポーネント名: PascalCase
- hooks: useXxx
- 変数と関数: camelCase
- 型: UpperCamelCase
- 定数: UPPER_SNAKE_CASE
- any は使わない
- ファイル名・フォルダ名: kebab-case

## バック（Python）
- 関数と変数: snake_case
- クラス: PascalCase
- ファイル名: snake_case
- Pydantic スキーマは Create / Update / Response に分ける
- モジュール名は短く意味がわかるものにする

---

# 5. Next.js / React のルール
- 基本的に Server Component を使う
- UI 操作が必要な場合のみ "use client" を付ける
- データ取得はサーバー側 fetch を使う
- JSX が長くなる場合はコンポーネントに分割する
- APIレスポンスは型を定義して扱う
- API クライアントは `frontend/src/lib/api/` に機能別で分割する
- API の共通 fetch ラッパは `frontend/src/lib/api/client.ts` に置く
- API 型定義は `frontend/src/lib/api/types.ts` に集約する
- 公開 API は直接呼び出し、管理系・秘匿情報が必要な API は Server Actions 経由で呼び出す
- API のベースURLは `NEXT_PUBLIC_API_BASE_URL` で管理する

---

# 6. Tailwind / shadcn のルール
- className は次の順で記述する
  1. レイアウト（flex, grid, width など）
  2. 見た目（color, border, background など）
  3. 余白（padding, margin）
- 長くなる場合は cn() を使う
- UI コンポーネントは基本的に shadcn/ui を使う
- 独自 CSS は必要最小限にする

---

# 7. FastAPI のルール
- router、schema、service、models を分けて管理する
- DB session は依存注入で扱う
- schema は Create、Update、Response に分離する
- API 層は薄く保ち、ドメイン処理は services に集約する
- services は AppError など HTTP を知らない例外を投げる
- 例外変換はアプリ共通のハンドラで HTTP レスポンスに統一する
- API レスポンスは camelCase に変換して返す（フロントの表記に合わせる）

---

# 9. 拡張方針
- 必要になった場合に詳細なガイドラインを追記する
- プロジェクト拡大時は詳細版への拡張を行う
