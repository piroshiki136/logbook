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
- [ ] 共通部品: フィルタバー
- [ ] 共通部品: ページネーションコンポーネント
- [ ] 記事一覧: 一覧表示
- [ ] 記事一覧: フィルタ UI（タグ/カテゴリ）
- [ ] 記事一覧: ページネーション UI
- [ ] データ取得: 詳細取得
- [ ] 記事詳細: Markdown 表示
- [ ] 記事詳細: タグ/カテゴリリンク
- [ ] データ取得: 前後記事取得
- [ ] 記事詳細: 前後記事ナビ
- [ ] テスト: フィルタのユースケース
- [ ] テスト: ページネーションのユースケース

## PR7: 管理画面・認証
- [ ] NextAuth (GitHub) 設定、`/admin` 配下の保護、記事一覧（公開/下書きタブ）、新規/編集フォーム、画像アップロード連携
- [ ] タグの表示名（name）を編集できる管理 UI と更新 API を追加する
- [ ] タグのタイポ修正（name 更新）とカテゴリの新規追加を管理画面から行えるようにする
- [ ] バリデーションと slug 編集、ドラフト切り替え。主要ハンドラの単体テストを追加

## 未決事項（着手前に確定する）
- NextAuth の callback URL / セッション戦略、`ADMIN_ALLOWED_EMAILS` の管理方法
- NextAuth v5（beta）を MVP 後に v4 もしくは Better Auth へ移行する判断基準とタイミング
- 画像保存先: 開発は FastAPI ローカル、本番は R2 バケットの固定値（バケット名/リージョンなど）
- レートリミット: Redis を使うか、一時的に無効化するか
- Docker Compose: サービス構成/ポート/環境変数のデフォルト値
