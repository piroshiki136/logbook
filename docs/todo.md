# TODO / 未決事項まとめ

各ドキュメントに散在する未決事項を集約する。解決後は該当ドキュメント側も更新し、このリストから削除する。

## ローカル開発開始前（最優先）

## 開発初期〜機能実装中
- Redis を導入するか、一時的にレートリミットを無効化するかを決める（接続先設定は残す）。
- Alembic 初期マイグレーションとサンプルデータ投入手順を用意する。
- Next.js / FastAPI 起動スクリプトを pnpm / uv で統一する。

## Docker 化直前
- `docker-compose.yml` に frontend/backend/db/redis を定義し、ポート・環境変数・ボリューム（`backend/uploads`、DB データ）を整理する。
- `ASSET_BASE_URL` / `DATABASE_URL` / `REDIS_URL` のコンテナ用値を決め、共有する env ファイルの扱い方針を決定する。

## 本番準備
- Cloudflare WAF/レートリミットの具体値を FastAPI 側と同期させる運用手順を docs に追記する。
- R2 バケット名・リージョンなど固定値と、バックアップ用ジョブの実行環境（例: GitHub Actions）の鍵管理手順を `infra/backup.md` にまとめる。
