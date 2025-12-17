# TODO / 未決事項まとめ

各ドキュメントに散在する未決事項を集約する。解決後は該当ドキュメント側も更新し、このリストから削除する。

## ローカル開発開始前（最優先）

## 開発初期〜機能実装中
- Alembic 初期マイグレーションとサンプルデータ投入手順を用意する。

## PR2
- DB/Core/Security: `app/db/` 配下に Base/metadata/SessionLocal（例: `base.py`, `session.py`）をまとめ、`app/core/security.py` に NextAuth JWT（HS256, issuer/audience, `ADMIN_ALLOWED_EMAILS` 判定）の検証関数や Depends を実装。`app/main.py` / ルーターからこれらを参照できるよう構成する。
- Models/Schemas: `app/models/` に `articles`, `tags`, `article_tags`, `admin_users`（必要なら `categories`）を SQLAlchemy Declarative で定義し、カラム/制約を `docs/05` と同期。Create/Update/Response 用の Pydantic スキーマを `app/schemas/` に配置し、camelCase JSON を返すための `from_attributes=True` や別名定義を済ませる。
- Alembic/Tests: `backend/migrations/` に Alembic env/script をセットアップし、上記モデルを反映した初期リビジョンを作成。`backend/tests/` へ pytest.ini / conftest.py / DB セッションフィクスチャ / health + DB smoke テストを追加し、CI で `uv run pytest` が動く状態にする。
- Docs Sync: モデル/API 仕様の変更点は `docs/05_data_model.md` と `docs/07_api_design.md` に即時反映し、完了済みの TODO を本リストから削除する。

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
