# 10. プルリクエスト計画（Draft）

本ドキュメントは logbook の初期実装に向けたプルリク単位の計画を示す。各 PR は `dev` から派生した feature ブランチで作成し、完了後に dev へマージする。

## PR1: ドキュメント/環境整備
- [x] README に起動手順・依存関係を追記し、docs/todo の未決事項を整理
- [x] frontend テンプレ UI の初期表示を削除し、globals.css を土台化
- [x] `cd frontend && pnpm lint` / `cd backend && uv run fastapi dev app.main:app` で起動確認

## PR2: バックエンド基盤
- [x] FastAPI の設定層（core/settings/auth）、DB セッション、共通レスポンス/例外処理を追加
- [x] SQLAlchemy モデル（articles/categories/tags/article_tags/admin_users）と Pydantic スキーマの雛形
- [x] Alembic 初期マイグレーション、`backend/tests` の土台
- [x] docs/05, docs/07 に差分が出た場合は更新

## PR3: CI・サンプルデータ整備
- [x] GitHub Actions で backend/frontend の CI を追加（`.github/workflows/ci-backend.yml` / `ci-frontend.yml`）
- [x] テスト用 Secrets（`DATABASE_URL`, `JWT_PUBLIC_KEY` など）の扱いを決めて Team Docs に記す
- [x] サンプルデータ投入スクリプト（`backend/scripts/seed.py`）を整備する
- [x] サンプルデータ投入手順を `README` と `docs/05` にまとめる

## PR4: 記事系 API 完成
- [x] JWT 検証ミドルウェア、slug 生成/重複チェック、下書き扱い、エラーフォーマット
- [x] 記事 CRUD、タグ/カテゴリフィルタ、ページネーション、prev/next、画像アップロード（ローカル保存）を実装
- [x] タグ入力の正規化（表記ゆれ防止のため slug を正規化キーとして統一）
- [x] TestClient で `get_db` を dependency_overrides し、テスト用 DB セッションを使う
- [x] httpx + DB を用いた Pytest で 80% 目標カバー、必要に応じて docs/07 を更新
- [x] docs/07 の API 仕様を具体化（publishedAt/slug/画像/テスト項目/エラーコード）
- [x] `uv run pytest` で backend テスト全件通過

## PR5: フロント基盤
- [x] App Router のルート骨組み（`/`, `/articles`, `/articles/[slug]`, `/tags`, `/categories`, `/admin/...`）を配置
- [x] shadcn/ui 導入、Tailwind のルール適用、docs/06 の補足反映
- [x] 共通 UI（primitives, ナビ/フッタ）、テーマの整備
- [x] API クライアント/型定義を整備
- [x] 認証必須 CRUD は Server Actions、公開 GET は直叩きとする方針を明文化
- [x] Server Actions からバックエンドへ JWT 付きで呼び出す土台を実装
- [x] workflows の front の CI を設定
- [x] GitHub 側で Branch Protection の「Require status checks」の「Status checks that are required」を設定する
- [x] プルリクのコマンド見直す

## PR6: 公開画面実装
- [x] 共通部品: 記事カード
- [x] トップページ: Hero と最新記事カード、about
- [x] 共通部品: ページネーションコンポーネント
- [x] 記事一覧: 一覧表示
- [x] 記事一覧: ページネーション UI
- [x] データ取得: 詳細取得
- [x] 記事詳細: Markdown 表示
- [x] 記事詳細: タグ/カテゴリ表示（MVP: 遷移なし）
- [x] データ取得: 前後記事取得（API クライアント関数は実装済み）
- [x] 記事詳細: 前後記事ナビ
- [x] テスト: ページネーションのユースケース

### PR6 補足（MVP スコープ調整）
- フィルタバー（タグ/カテゴリ）は MVP から除外し、MVP 完成後に再導入する。
- 理由: MVP では記事閲覧の主要導線（一覧・詳細・前後記事ナビ）を優先し、UI 複雑性とテスト範囲を抑える。

### PR6 テスト実装方針（2026-03-06）
- 単体テスト（Vitest）
  - `parsePage` の入力補正（空・非数・0 以下・小数）
  - `createPageHrefBuilder` のクエリ維持（`tags` / `categories` を保持した `page` 更新）
- 結合テスト（Vitest + Testing Library）
  - `ArticlesPagination` の表示分岐（1ページ時非表示、先頭/末尾での無効化、リンク生成）
  - `ArticlePrevNextNav` の表示分岐（前後なし/片側のみ/両側）
- E2E（Playwright）
  - `/articles` のページ遷移（クエリ `?page=` と表示の一致）
  - `/articles/[slug]` の前後記事ナビ遷移
- 完了条件
  - `cd frontend && pnpm lint`
  - `cd frontend && pnpm test`
  - `cd frontend && pnpm e2e`

## PR7: 管理画面・認証
ブランチ名: `feature/pr7-admin-auth`

### 完了済み
ブランチ名: `feature/pr7-admin-foundation`

- [x] NextAuth (GitHub) 設定、`/api/auth/[...nextauth]`、`/admin/login`、`/admin/forbidden` を整備する
- [x] `/admin` 配下の認証・認可保護を middleware に集約し、`ADMIN_ALLOWED_EMAILS` と整合させる
- [x] 管理記事一覧: ページネーションとエラー表示を管理画面用 UI に整える

### 次 PR で進める候補（管理記事導線の開通）
ブランチ名: `feature/pr7-admin-article-flow`

- [x] 管理トップ: セッション表示の仮実装を置き換え、記事管理への導線を実装する
- [x] 管理記事一覧: 全記事 / 公開記事 / 非公開タブを実装し、`draft` クエリ連動で切り替えられるようにする
- [x] 管理記事: ルーティング識別子（`id` / `slug`）と取得 API の責務を統一する
- [x] 管理記事: 編集フォームを実装する

### 後続 PR で進める候補（記事編集機能の完成）
ブランチ名: `feature/pr7-admin-article-editor`

- [x] 管理記事: 新規作成フォームを実装する
- [x] 管理記事: slug 編集、ドラフト切り替えを実装する
- [x] 管理記事: クライアント側バリデーションと入力欄ごとのエラー表示を実装する
- [x] 管理記事: 記事管理 / 新規作成ページから Admin トップへ戻る導線を実装する

### 後続 PR で進める候補（品質・ドキュメント）
ブランチ名: `feature/pr7-admin-quality-docs`

- [x] Server Actions / API クライアントの認証必須ハンドラに単体テストを追加する
- [x] docs/04, docs/06, docs/07 に管理画面導線と API 差分が出た場合は更新する

### PR7 テスト実装状況
- 単体テスト（Vitest）
  - [x] `callbackUrl` の正規化（`/admin` 配下のみ許可）
  - [x] `ADMIN_ALLOWED_EMAILS` の判定
  - [x] 管理 API クライアント / Server Actions の認証エラー処理
- 結合テスト（Vitest + Testing Library）
  - [x] 管理記事一覧の公開/下書きタブ切り替え
  - [x] 新規/編集フォームのバリデーション、slug 編集、ドラフト切り替え
  - [x] 権限なし時の `forbidden` 導線
- API テスト（Pytest + httpx）
  - [x] タグ name 更新
  - [x] カテゴリ新規追加
  - [x] 管理記事取得の識別子ルール（`id` / `slug`）の整合
  - [x] 認証必須エンドポイントの 401/403
- 完了条件
  - `cd frontend && pnpm lint`
  - `cd frontend && pnpm test`
  - `cd backend && uv run pytest`

## 未決事項（着手前に確定する）
- NextAuth の callback URL / セッション戦略、`ADMIN_ALLOWED_EMAILS` の管理方法
- NextAuth v5（beta）を MVP 後に v4 もしくは Better Auth へ移行する判断基準とタイミング
- 画像保存先: 開発は FastAPI ローカル、本番は R2 バケットの固定値（バケット名/リージョンなど）
- レートリミット: Redis を使うか、一時的に無効化するか
- Docker Compose: サービス構成/ポート/環境変数のデフォルト値

## MVP 完成後に進める候補
ブランチ名: `feature/pr7-admin-taxonomy`

- [ ] 管理タグ: タグ一覧、表示名（name）編集 UI、更新 API を追加する
- [ ] 管理カテゴリ: カテゴリ新規追加 UI と作成 API を追加する
- [ ] 管理記事: 画像アップロード連携を実装する
