# TODO / 未決事項まとめ

各ドキュメントに散在する未決事項を集約する。解決後は該当ドキュメント側も更新し、このリストから削除する。

# PR4
- GitHub 側で Branch Protection の「Require status checks」を設定する（PR3 時点では CI ワークフローがコミットされていないため未設定）

## Docker 化直前
- `docker-compose.yml` に frontend/backend/db/redis を定義し、ポート・環境変数・ボリューム（`backend/uploads`、DB データ）を整理する。
- `ASSET_BASE_URL` / `DATABASE_URL` / `REDIS_URL` のコンテナ用値を決め、共有する env ファイルの扱い方針を決定する。

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
