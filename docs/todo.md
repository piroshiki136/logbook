# TODO / 未決事項まとめ

各ドキュメントに散在する未決事項を集約する。解決後は該当ドキュメント側も更新し、このリストから削除する。

## pr5


## Docker 化直前
- `docker-compose.yml` に frontend/backend/db/redis を定義し、ポート・環境変数・ボリューム（`backend/uploads`、DB データ）を整理する。
- `ASSET_BASE_URL` / `UPLOAD_ROOT` / `DATABASE_URL` / `REDIS_URL` のコンテナ用値を決め、共有する env ファイルの扱い方針を決定する。
- テスト/開発用の `/api/health` エンドポイントを本番で残すか削除するかを決める（残す場合は公開範囲と認証要否を明記する）。


## 本番準備
- エラーハンドリングのユーザー向け表示ポリシー整理
  1. DomainError（想定内エラー）は仕様どおりの説明を返し、400/404 も UX 上必要な文言を表示できるようテンプレート化する。
  2. DB エラー詳細やスタックトレースは絶対に表示しない方針を FastAPI/Next.js 双方のエラーミドルウェアへ落とし込み、ログのみで確認する。
  3. unhandled 500 は一般的なメッセージのみ（例: 「現在エラーが発生しています」）に制限し、詳細は管理画面やログで確認できる導線を docs/07, frontend/backend 実装時に追記する。
- CORS のデフォルト許可設定
  1. 現状は `["http://localhost:3000"]` をデフォルトにしているが、本番運用前に必須項目へ変更する（Field(... )化）。
  2. 必須化したら README/docs に環境変数設定を追記し、テンプレ `.env` にサンプル値を入れておく。
- Cloudflare WAF/レートリミットの具体値を FastAPI 側と同期させる運用手順を docs に追記する。
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
- アサーションJWTに `nbf` を追加するか検討する
- jtiの仕様変更(Redis等)
- JTI ストアを永続化して再起動時のリプレイ対策を強化する（Redis 等）
- レートリミットを共有ストア（Redis 等）へ移行し、複数インスタンスでも有効化する
- `sub` の最大長と `github` 前提の形式チェックを他プロバイダ対応時に見直す
