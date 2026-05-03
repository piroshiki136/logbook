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
- [x] 記事 CRUD、タグ/カテゴリフィルタ、ページネーション、新旧記事、画像アップロード（ローカル保存）を実装
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
- [x] データ取得: 新旧記事取得（API クライアント関数は実装済み）
- [x] 記事詳細: 新旧記事ナビ
- [x] テスト: ページネーションのユースケース

### PR6 補足（MVP スコープ調整）
- フィルタバー（タグ/カテゴリ）は MVP から除外し、MVP 完成後に再導入する。
- 理由: MVP では記事閲覧の主要導線（一覧・詳細・新旧記事ナビ）を優先し、UI 複雑性とテスト範囲を抑える。

### PR6 テスト実装方針（2026-03-06）
- 単体テスト（Vitest）
  - `parsePage` の入力補正（空・非数・0 以下・小数）
  - `createPageHrefBuilder` のクエリ維持（`tags` / `categories` を保持した `page` 更新）
- 結合テスト（Vitest + Testing Library）
  - `ArticlesPagination` の表示分岐（1ページ時非表示、先頭/末尾での無効化、リンク生成）
  - `ArticleNewerOlderNav` の表示分岐（新旧なし/片側のみ/両側）
- E2E（Playwright）
  - `/articles` のページ遷移（クエリ `?page=` と表示の一致）
  - `/articles/[slug]` の新旧記事ナビ遷移
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



## PR8: MVP リリース準備
ブランチ名: `feature/mvp-release-readiness`

### 目的
- [ ] MVP として外部公開できる状態かを、仕様・実装・運用の3観点で確認する
- [ ] docs 間の MVP 定義のズレをなくし、「何ができればリリース可か」を明文化する

### 本番前提のデプロイ構成
- [x] フロントエンドは Vercel にデプロイし、初期リリースでは `https://<project>.vercel.app` を公開 URL とする
- [x] バックエンドは Vercel にデプロイし、初期リリースでは `https://<project>.vercel.app/_/backend` を API ベース URL とする
- [x] DB は Neon を利用し、Vercel 上に PostgreSQL を自前構築しない
- [x] 独自ドメインは PR8 のスコープ外とし、OAuth / CORS / API 連携は `vercel.app` 前提で確定する
- [x] 画像保存は Vercel ローカル保存を本番利用せず、Cloudflare R2 を前提にする
- [x] 本番の配備先は Vercel / Neon に統一し、他のホスティング案は PR8 のスコープ外とする
- [x] バックエンドの本番公開は Vercel 前提とし、ローカル/検証用に `backend/Dockerfile` を維持する

### 1. MVP スコープの確定
- [x] `docs/02`, `docs/06`, `docs/07`, `docs/todo` の MVP / MVP後対応の記述を一致させる
- [x] `/tags`, `/categories` の扱いを確定する
- [x] タグ/カテゴリ一覧・フィルタを MVP 対象外にする場合は、公開しない / プレースホルダ文言を出す / 仕様から外す、のいずれかに統一する
- [x] 管理画面の「記事作成・編集・公開/下書き切り替え」までを MVP 完了条件として明文化する

### 2. リリース判定チェックリスト
#### 2-1. 自動確認で担保する項目
- [x] 公開側の記事一覧ページネーションが E2E で動作する
- [x] 公開側の記事詳細と新旧記事ナビ遷移が E2E で動作する
- [x] 公開側で下書き記事が一覧 API に含まれない
- [x] 公開側で `publishedAt=null` の記事が一覧 API に含まれない
- [x] `draft=true` を使う記事一覧 API が未認証で 401 を返す
- [x] 認証必須の作成 / 更新 / 削除 API が未認証で 401、非管理者で 403 を返す
- [x] 管理記事一覧のタブ切り替えとクエリ連動がフロントテストで担保される
- [x] 管理記事の新規作成 / 編集フォームのバリデーションと `isDraft` 切り替えがフロントテストで担保される
- [x] 管理用 Server Actions / API クライアントの認証エラー処理がテストで担保される
- [x] `callbackUrl` 正規化と `ADMIN_ALLOWED_EMAILS` 判定がテストで担保される

#### 2-1 現在の自動確認の到達点
- [x] 公開側の記事一覧ページネーションが E2E で動作する
- [x] 公開側の記事詳細と新旧記事ナビ遷移が E2E で動作する
- [x] 公開側で下書き記事が一覧 API に含まれない
- [x] 公開側で `publishedAt=null` の記事が一覧 API に含まれない
- [x] `draft=true` を使う記事一覧 API が未認証で 401 を返す
- [x] 認証必須の作成 / 更新 / 削除 API が未認証で 401、非管理者で 403 を返す
- [x] 管理記事一覧のタブ切り替えとクエリ連動がフロントテストで担保される
- [x] 管理記事の新規作成 / 編集フォームのバリデーションと `isDraft` 切り替えがフロントテストで担保される
- [x] 管理用 Server Actions / API クライアントの認証エラー処理がテストで担保される
- [x] `callbackUrl` 正規化と `ADMIN_ALLOWED_EMAILS` 判定がテストで担保される

#### 2-2. 手動確認が必要な項目
- [x] 公開側トップページ `/` の見え方と主要導線を確認する
- [x] 公開側で存在しない slug や想定外エラー時の画面表示を確認する
- [x] `/admin/login` から GitHub OAuth ログインできることを確認する
- [x] 未ログイン時に `/admin` 配下で `/admin/login` へリダイレクトされることを確認する
- [x] 非許可メール時に `/admin/forbidden` へ遷移することを確認する
- [x] `/admin` から `/admin/articles`, `/admin/articles/new` へ遷移できることを確認する
- [x] 新規作成後に編集画面へ遷移することを確認する
- [x] 編集保存後に一覧 / 編集画面の内容が更新されることを確認する
- [x] 下書き記事が公開画面の詳細 URL からも見えないことを確認する
- [x] フロント・バックエンドのエラー表示が利用者向けに過不足ない文言で、内部情報を露出しないことを確認する

#### 2-2 手動確認メモ
- [x] `/` の見え方と主要導線は確認済み
- [x] `/admin/login` の GitHub OAuth ログインは確認済み
- [x] 未ログイン時の `/admin` 配下リダイレクトは確認済み
- [x] 非許可メール時の `/admin/forbidden` 遷移は確認済み
- [x] `/admin` から `/admin/articles`, `/admin/articles/new` への遷移は確認済み
- [x] 新規作成後に `/admin/articles/[id]/edit` へ遷移することを確認済み
- [x] 新規作成後は `edit?created=1` で通知表示され、先頭へスクロールすることを確認済み
- [x] 編集保存後に内容更新が確認できることを確認済み
- [x] 存在しない `slug` で `notFound()` を使い、記事詳細専用の 404 UI を表示する実装を追加した
- [x] 公開側の `error.tsx` を利用者向け文言に差し替え、backend の 500 応答も汎用メッセージ化した
- [x] 存在しない slug 時の表示は実装済み。実機で文言と導線を確認した
- [x] エラー表示の妥当性確認は、実装ベースでは完了
- [x] JWT エラー詳細を本番で返さない前提として `debug=false` の設定確認を別途行う

### 3. 本番設定の確定
- 現在メモ（2026-05-02）
  - Vercel へのデプロイ作業は進行中
  - 本番用の環境変数は順次追加中
  - 公開 URL は `https://logbook-flame.vercel.app` で確定
  - Neon DB は作成済み
  - backend の `DATABASE_URL` は Neon 接続文字列で連携済み
  - Neon DB へ Alembic マイグレーションを `head` まで適用済み
  - 本番用 JWT 鍵は未作成
  - `CORS_ALLOW_ORIGINS` は `https://logbook-flame.vercel.app` で設定済み
- 進捗メモ（2026-05-02）
  - 本番環境で `GET /api/health` の疎通確認ができた
  - Neon / `DATABASE_URL` を含む本番 DB 設定は完了済み
- 進捗メモ（2026-05-03）
  - Vercel ビルド時の `ApiError: REQUEST_FAILED 404` は、`NEXT_PUBLIC_API_BASE_URL` の `/_/backend` パスを維持する修正で解消済み
  - 本番 GitHub OAuth 認証は、`AUTH_URL=https://logbook-flame.vercel.app/api/auth` と GitHub callback URL 設定で成立確認済み
  - 次は未設定の本番環境変数を生成し、Vercel frontend / backend へ登録する
- [x] `backend/Dockerfile` を作成し、本番用の実行条件を固定する
  - Python バージョンを固定する
  - 依存関係のインストール手順を固定する
  - `uvicorn` の起動コマンドを固定する
  - コンテナ検証時は `PORT` 環境変数で待ち受ける
- [x] Dockerfile はローカル検証用途として README / docs に残し、本番デプロイ先は Vercel に統一する
- [ ] 本番用の `CORS_ALLOW_ORIGINS` は必須設定にする方針で実装を修正する
  - 現状の `backend/app/core/settings.py` は `http://localhost:3000` をデフォルト値にしているため、本番向けには未確定
  - ローカル開発では `http://localhost:3000` を使い、本番では明示的な環境変数設定を必須にする
  - Vercel の実 URL が未確定でも、この方針までは先に実装・文書化できる
- [x] Vercel デプロイ後に確定した公開 URL を `CORS_ALLOW_ORIGINS` に設定し、少なくとも `https://<project>.vercel.app` を含める
  - `CORS_ALLOW_ORIGINS=https://logbook-flame.vercel.app` で設定済み
- [ ] Vercel に設定する必須環境変数を棚卸しする
  - `AUTH_SECRET`（本番専用に生成。`NEXTAUTH_SECRET` は互換用で新規設定はしない）
  - `AUTH_GITHUB_ID`
  - `AUTH_GITHUB_SECRET`
  - `AUTH_URL`（`https://logbook-flame.vercel.app/api/auth`。`NEXTAUTH_URL` は互換用で新規設定はしない）
  - `NEXT_PUBLIC_API_BASE_URL`（`https://logbook-flame.vercel.app/_/backend`）
  - `ASSET_BASE_URL`
  - `ADMIN_ALLOWED_EMAILS`
  - 現状: まだ未投入の項目があり、順次追加中
- [ ] Vercel backend に設定する必須環境変数を棚卸しする
  - `DATABASE_URL`（Neon 接続文字列。設定済み）
  - `CORS_ALLOW_ORIGINS`（`https://logbook-flame.vercel.app`。複数許可時はカンマ区切り。JSON 配列は使わない）
  - `JWT_PUBLIC_KEY`
  - `JWT_PRIVATE_KEY`
  - `JWT_ISSUER`
  - `JWT_AUDIENCE`
  - `ADMIN_ALLOWED_EMAILS`
  - `FRONTEND_ASSERTION_PUBLIC_KEY` または `FRONTEND_ASSERTION_JWKS_URL`
  - `FRONTEND_ASSERTION_ISSUER`
  - `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `ASSET_BASE_URL`
- [x] Neon DB に Alembic マイグレーションを `head` まで適用する
- [ ] `FRONTEND_ASSERTION_PRIVATE_KEY` / `FRONTEND_ASSERTION_PUBLIC_KEY` の生成・配布・設定手順を整理する
- [ ] 本番用 `JWT_PUBLIC_KEY` / `JWT_PRIVATE_KEY` を生成し、Vercel backend に設定する
- [x] `AUTH_URL` と GitHub OAuth callback URL を `vercel.app` 前提で確定し、ドキュメントに残す
  - `AUTH_URL=https://logbook-flame.vercel.app/api/auth`
  - GitHub OAuth callback URL: `https://logbook-flame.vercel.app/api/auth/callback/github`
- [ ] 未設定の本番環境変数を生成し、Vercel frontend / backend へ登録する
  - frontend: `FRONTEND_ASSERTION_PRIVATE_KEY`, `FRONTEND_ASSERTION_KID`
  - backend: `FRONTEND_ASSERTION_PUBLIC_KEY`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`
- [ ] `/api/health` は本番で公開してもよいが、疎通確認専用の最小レスポンスに限定し、DB 詳細や環境情報を返さない方針を決める

### 4. セキュリティ・運用上の最低条件
- [ ] FastAPI の `debug=false` を本番で強制し、エラー応答で DB エラー詳細や内部情報を出さないことを確認する
- [ ] `ADMIN_ALLOWED_EMAILS` の運用方法を決め、大小文字差異を吸収する前提を docs に反映する
- [ ] レートリミット未実装 / 暫定対応の扱いを明記する
  - 初期リリースでは特定ベンダーの WAF/レートリミットに依存しない
  - 実装しない場合は既知の制約として docs に明記し、必要時のみ配信基盤の標準機能または Redis ベースの共有レートリミットを導入する
- [ ] 画像保存先は本番で Cloudflare R2 を必須とし、Vercel 実行環境のローカル保存は不可と明記する
- [ ] Neon の復旧方針と、追加で `pg_dump` を R2 に退避する運用を採るかを決める
- [ ] Vercel の実行リージョンと Neon のリージョンを近接させる方針を docs に残す
- [ ] Vercel の利用プラン条件を確認し、継続公開時に適切なプランを判断できるようメモする

### 5. テスト・検証
- [x] `cd frontend && pnpm lint`
- [x] `cd frontend && pnpm format`
- [x] `cd frontend && pnpm test`
- [x] `NEXT_PUBLIC_API_BASE_URL` の `/_/backend` パスを維持して API URL を組み立てる単体テストを追加する
- [x] `cd frontend && pnpm e2e`
- [x] `cd backend && uv run pytest`
- [ ] `backend/Dockerfile` でローカル build が通ることを確認する
  - `docker` コマンドがこの作業環境に無いため、実ビルド確認は未実施
- [ ] `backend/Dockerfile` ベースで本番相当の起動確認を行う
  - `0.0.0.0` で待ち受ける
  - `PORT` 指定で起動できる
- [ ] 本番相当の env で最低限の手動確認項目を作成する
  - [x] `https://logbook-flame.vercel.app` から `https://logbook-flame.vercel.app/_/backend` へ公開 API が疎通する
  - [x] `/admin/login` の GitHub OAuth が `vercel.app` ドメインで成立する
  - 記事作成 / 編集 / 下書き切り替えが Vercel + Neon で成立する
  - R2 にアップロードした画像 URL が公開画面から参照できる
  - CORS エラーが発生しない
  - `vercel.app` / `/_/backend` の URL が UI 文言やOG設定に漏れて困らないか確認する
- [ ] 手動確認結果を PR に記録する

### 6. リリース可否の最終判断
- [ ] 「MVP として公開可能」の条件を docs に文章で残す
  - 独自ドメインなしでも、`vercel.app` / `/_/backend` / Neon / R2 の構成で記事閲覧と管理画面運用が成立すること
- [ ] 見送る項目がある場合は、Known Issues / MVP後対応として明記する
- [ ] `dev` → `main` へ上げる前提条件を確認する


## 未決事項（着手前に確定する）
- NextAuth のセッション戦略、`ADMIN_ALLOWED_EMAILS` の管理方法
- NextAuth v5（beta）を MVP 後に v4 もしくは Better Auth へ移行する判断基準とタイミング
- レートリミット: MVP は特定ベンダー依存を避け、必要性が出た場合のみ配信基盤の標準機能または Redis ベースの共有制御を導入する
- Docker Compose: サービス構成/ポート/環境変数のデフォルト値

## MVP 完成後に進める候補
ブランチ名: `feature/pr7-admin-taxonomy`

- [ ] 管理タグ: タグ一覧、表示名（name）編集 UI、更新 API を追加する
- [x] 管理カテゴリ: 記事作成画面からカテゴリ新規追加 UI を追加する
- [ ] 管理記事: 画像アップロード連携を実装する
