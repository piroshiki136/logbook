from collections.abc import Generator

from app.core.settings import get_settings
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # 接続が切れている場合に自動的に再接続するため
)

SessionLocal = sessionmaker(
    autocommit=False,  # トランザクションを明示的にコミットする必要がある
    autoflush=False,  # 明示的に flush() を呼び出すまで変更をデータベースに送信しない
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI の Depends 用 DB セッションを提供する。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
