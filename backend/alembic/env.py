from logging.config import fileConfig

import app.models  # noqa: F401  # Base.metadataへモデル定義を登録する副作用目的のimport
from alembic import context
from app.core.settings import get_settings
from app.db.base import Base
from sqlalchemy import create_engine, pool

# Alembic Config オブジェクト。alembic.ini の値へアクセスするインターフェース。
config = context.config

# ログ設定を読み込み、Alembic 実行時のログ出力を初期化する。
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Alembic 実行時にも FastAPI の設定値を使えるよう読み込む。
settings = get_settings()

# autogenerate 用に Base.metadata を Alembic に渡す。
# 例: target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

# 必要があれば config.get_main_option で追加の設定値も参照できる。


def run_migrations_offline() -> None:
    """データベースへ接続せずに SQL を出力するオフラインモードを実行する。"""
    # URL だけで設定し、DB 接続を作らず SQL 文字列を生成する。
    url = settings.database_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """実際に DB へ接続してマイグレーションを流すオンラインモードを実行する。"""
    # FastAPI 本体と同じ DATABASE_URL を用いてエンジンを構築する。
    engine = create_engine(
        settings.database_url,
        poolclass=pool.NullPool,
    )

    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
