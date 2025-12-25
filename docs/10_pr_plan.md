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
- [x] docs/05, docs/07 に差分が出た場合は更新（今回は差分なしのため追記不要）

## PR3: 記事系 API 完成
- [ ] 記事 CRUD、タグ/カテゴリフィルタ、ページネーション、prev/next、画像アップロード（ローカル保存）を実装
- [ ] JWT 検証ミドルウェア、slug 生成/重複チェック、下書き扱い、エラーフォーマット
- [ ] httpx + DB を用いた Pytest で 80% 目標カバー、必要に応じて docs/07 を更新

## PR4: フロント基盤
- [ ] App Router のルート骨組み（`/`, `/articles`, `/articles/[slug]`, `/tags`, `/categories`, `/admin/...`）を配置
- [ ] 共通 UI（primitives, ナビ/フッタ）、テーマ、API クライアント/型定義を整備
- [ ] shadcn/ui 導入、Tailwind のルール適用、docs/06 の補足反映

## PR5: 公開画面実装
- [ ] トップの Hero/最新記事カード、記事一覧のフィルタ+ページネーション、記事詳細の Markdown 表示とタグ/カテゴリリンク、前後記事ナビ
- [ ] Vitest + Testing Library でフィルタ/ページネーションのユースケーステスト

## PR6: 管理画面・認証
- [ ] NextAuth (Google) 設定、`/admin` 配下の保護、記事一覧（公開/下書きタブ）、新規/編集フォーム、画像アップロード連携
- [ ] バリデーションと slug 編集、ドラフト切り替え。主要ハンドラの単体テストを追加

## 未決事項（着手前に確定する）
- NextAuth の callback URL / セッション戦略、`ADMIN_ALLOWED_EMAILS` の管理方法
- 画像保存先: 開発は FastAPI ローカル、本番は R2 バケットの固定値（バケット名/リージョンなど）
- レートリミット: Redis を使うか、一時的に無効化するか
- Docker Compose: サービス構成/ポート/環境変数のデフォルト値
