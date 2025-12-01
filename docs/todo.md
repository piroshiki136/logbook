# TODO / 未決事項まとめ

各ドキュメントに散在する未決事項を集約する。解決後は該当ドキュメント側も更新し、このリストから削除する。

## Git運用・リリース（docs/09_git_workflow.md）
- リリースタグの命名規則と付与タイミング（例: `vYYYY.MM.DD` / リリース候補タグの有無）。
- ホットフィックスのブランチ運用（mainから切るか、devへもマージするか、テスト手順）。
- PRテンプレート/チェック項目（実行コマンド、スクリーンショット、Known Issues記載）をどう運用するか。

## 認証・セキュリティ（docs/07_api_design.md, docs/04_url_design.md）
- NextAuth JWTをFastAPIで検証する方法（署名鍵共有 or JWKSなど）、検証ミドルウェアの具体仕様。
- admin_usersとの同期タイミング（初回ログイン時に作成するか、手動でseedするか）。
- レートリミット、セキュリティヘッダ、監査ログのポリシー。

## API仕様・挙動（docs/07_api_design.md, docs/04_url_design.md）
- 公開記事一覧のページネーション方針（pageベースかlimit/offsetか）とデフォルト/最大件数、ソート順（投稿日降順想定）。
- ドラフト除外条件の明記（公開APIはisDraft=false固定、管理APIのみisDraft指定可など）。
- 前後記事取得エンドポイントを `/api/articles/{id}/prev-next` と `articles?around=ID` のどちらにするか。

## データモデル・スラッグ（docs/05_data_model.md）
- カテゴリの候補リスト化や正規化の要否（テーブル分割か文字列運用か）。
- タグページやAPIでnameそのまま使うか、slugを別管理するか。
- slug生成ルール（日本語タイトルの変換、重複時サフィックス付与）、ユニーク制約の範囲（記事全体で一意か）。

## ストレージ・バックアップ・インフラ（docs/03_technology_stack.md, docs/05_data_model.md）
- 画像アップロードの保存先をローカル`/uploads`継続か、外部ストレージ（S3等）へ移行するか。公開パス/認可/容量制限の方針。
- DBバックアップの方法とスケジュール（本番/開発）、復元手順の記載場所。
- レートリミット/防御策の導入有無（API Gateway, middlewareなど）。
