# TODO / 未決事項まとめ

各ドキュメントに散在する未決事項を集約する。解決後は該当ドキュメント側も更新し、このリストから削除する。

## ローカル開発開始前（最優先）

## 開発初期〜機能実装中
- Redis を導入するか、一時的にレートリミットを無効化するかを決める（接続先設定は残す）。
- Alembic 初期マイグレーションとサンプルデータ投入手順を用意する。

## PR2
- FastAPI の設定層（core/settings/security）、DB セッション、共通レスポンス/例外ハンドラを `app/main.py` に組み込んで認証トークン検証を行う。
- `app/main.py` に共通レスポンス/例外ハンドラを登録し、FastAPI 起動時に有効化する。
- `app/models/` に `articles/tags/article_tags/admin_users` を SQLAlchemy で定義し、対応する Pydantic スキーマを `app/schemas/` に追加して API ルータから参照可能にする。
- `backend/migrations/` に Alembic の初期マイグレーションを生成し、`backend/tests/` へ Pytest の設定と最初の smoke テストを配置して CI で動かす。
- モデル/API 仕様変更に応じて `docs/05_data_model.md` と `docs/07_api_design.md` を更新し、PR2 の完了条件を満たす。

## Docker 化直前
- `docker-compose.yml` に frontend/backend/db/redis を定義し、ポート・環境変数・ボリューム（`backend/uploads`、DB データ）を整理する。
- `ASSET_BASE_URL` / `DATABASE_URL` / `REDIS_URL` のコンテナ用値を決め、共有する env ファイルの扱い方針を決定する。

## 本番準備
- Cloudflare WAF/レートリミットの具体値を FastAPI 側と同期させる運用手順を docs に追記する。
- R2 バケット名・リージョンなど固定値と、バックアップ用ジョブの実行環境（例: GitHub Actions）の鍵管理手順を `infra/backup.md` にまとめる。
