# TODO / 未決事項まとめ

各ドキュメントに散在する未決事項を集約する。解決後は該当ドキュメント側も更新し、このリストから削除する。
todo

## Docker 化直前
- `docker-compose.yml` に frontend/backend/db を定義し、必要なら追加サービスも含めてポート・環境変数・ボリューム（`backend/uploads`、DB データ）を整理する。
- `ASSET_BASE_URL` / `UPLOAD_ROOT` / `DATABASE_URL` のコンテナ用値を決め、共有する env ファイルの扱い方針を決定する。
- テスト/開発用の `/api/health` エンドポイントを本番で残すか削除するかを決める（残す場合は公開範囲と認証要否を明記する）。


## 本番準備
- エラーハンドリングのユーザー向け表示ポリシー整理
  1. DomainError（想定内エラー）は仕様どおりの説明を返し、400/404 も UX 上必要な文言を表示できるようテンプレート化する。
  2. DB エラー詳細やスタックトレースは絶対に表示しない方針を FastAPI/Next.js 双方のエラーミドルウェアへ落とし込み、ログのみで確認する。
  3. unhandled 500 は一般的なメッセージのみ（例: 「現在エラーが発生しています」）に制限し、詳細は管理画面やログで確認できる導線を docs/07, frontend/backend 実装時に追記する。
- CORS のデフォルト許可設定
  1. 現状は `["http://localhost:3000"]` をデフォルトにしているが、本番運用前に必須項目へ変更する（Field(... )化）。
  2. 必須化したら README/docs に環境変数設定を追記し、テンプレ `.env` にサンプル値を入れておく。
- Cloudflare WAF/レートリミットの具体値と運用手順を docs に追記する。
- R2 バケット名・リージョンなど固定値と、バックアップ用ジョブの実行環境（例: GitHub Actions）の鍵管理手順を `infra/backup.md` にまとめる。
- allow_methods, allow_headersを絞る
例:
```py
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
    ],
)
```
- Renovateの導入
## MVP 完成後
- 公開タグ一覧・カテゴリ一覧・フィルタを実装する
  - 対象画面: `/tags`, `/categories`, `/articles`
  - 内容: タグ一覧、カテゴリ一覧、タグ/カテゴリフィルタ UI
  - 背景: MVP では記事閲覧の主要導線を優先し、taxonomy 関連の公開導線は後続対応にする
- 管理タグ・カテゴリ管理を実装する
  - ブランチ名: `feature/pr7-admin-taxonomy`
  - タグ name 更新 API / UI
  - カテゴリ新規追加 API / UI
- taxonomy 実装時は以下を満たす
  - 現状: [tags/page.tsx](frontend/src/app/(public)/tags/page.tsx) と [categories/page.tsx](frontend/src/app/(public)/categories/page.tsx) は placeholder のみ
  - URL 連動: フィルタ状態をクエリパラメータへ反映し、リロード/共有時に復元できること
  - API 仕様: `docs/07` のクエリ形式（repeat 方式）と `docs/04`, `docs/06` の表記を一致させてから実装する
  - テスト観点: フィルタ適用、解除、複数選択、ページネーション併用時の挙動
- アサーションJWTに `nbf` を追加するか検討する
- jti の仕様変更（必要になった場合の永続ストア導入を含む）
- JTI ストアを永続化して再起動時のリプレイ対策を強化する必要があるかを運用後に判断する
- レートリミットを共有ストアへ移行する必要があるかを、運用実績を見て判断する
- `sub` の最大長と `github` 前提の形式チェックを他プロバイダ対応時に見直す
