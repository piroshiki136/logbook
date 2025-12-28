import os
import pathlib

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

os.environ["ENV"] = "test"

from app.core.settings import get_settings

get_settings.cache_clear()

from app.db.base import Base  # noqa: E402  # SQLAlchemy の metadata を初期化するために必要
from app.main import app  # noqa: E402  # FastAPI アプリを初期化するために必要

TEST_DB_PATH = pathlib.Path("test.db")


@pytest.fixture(scope="session")
def engine():
    """
    テスト用 DB エンジン
    """
    settings = get_settings()

    engine = create_engine(
        settings.database_url,
        future=True,
    )

    Base.metadata.create_all(bind=engine)

    yield engine

    engine.dispose()
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()


@pytest.fixture(scope="function")
def db_session(engine):
    """
    各テスト用 DB セッション（テストごとにトランザクションを張り rollback で元に戻す）
    """
    connection = engine.connect()
    transaction = connection.begin()

    TestingSessionLocal = sessionmaker(
        bind=connection,
        autocommit=False,
        autoflush=False,
    )

    session = TestingSessionLocal()

    session.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(sess, trans):
        if trans.nested and not trans._parent.nested:
            sess.begin_nested()

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client():
    """
    FastAPI の TestClient
    """
    return TestClient(app)
