# TODO / 未決事項まとめ

各ドキュメントに散在する未決事項を集約する。解決後は該当ドキュメント側も更新し、このリストから削除する。

## ローカル開発開始前（最優先）

## 開発初期〜機能実装中
- サンプルデータ投入手順をまとめ、`README` か `docs/05` に追記する。
- GitHub Actions で backend ディレクトリを working-directory にして `uv sync` → `uv run pytest tests` を自動実行するワークフローを追加し、Secrets で必要な環境変数を渡す。

## Docker 化直前
- `docker-compose.yml` に frontend/backend/db/redis を定義し、ポート・環境変数・ボリューム（`backend/uploads`、DB データ）を整理する。
- `ASSET_BASE_URL` / `DATABASE_URL` / `REDIS_URL` のコンテナ用値を決め、共有する env ファイルの扱い方針を決定する。

## 本番準備
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
