"""
記事データを全削除するスクリプト
実行:
    cd backend
    CONFIRM_DELETE_SEED_ARTICLES=1 uv run python -m scripts.delete_seed_articles
    # カテゴリ/タグ/管理ユーザーも含めて全削除する場合:
    CONFIRM_DELETE_SEED_ARTICLES=1 CONFIRM_DELETE_SEED_ALL=1 \
    uv run python -m scripts.delete_seed_articles
"""

import os

from sqlalchemy import delete
from sqlalchemy.engine import make_url

from app.core.settings import get_settings
from app.db.session import SessionLocal
from app.models.admin_user import AdminUser
from app.models.article import Article
from app.models.article_tag import ArticleTag
from app.models.category import Category
from app.models.tag import Tag

SAFE_ENVS = {"local", "dev"}
SAFE_DB_HOSTS = {"localhost", "127.0.0.1", "db"}


def ensure_safe_to_delete() -> None:
    settings = get_settings()

    if settings.env not in SAFE_ENVS:
        raise RuntimeError(
            "実行環境が許可されていません。"
            f" 現在の APP_MODE={settings.env!r}。"
            " `local` または `dev` でのみ実行できます。"
        )

    db_url = make_url(settings.database_url)
    backend_name = db_url.get_backend_name()
    db_host = (db_url.host or "").lower()

    if backend_name != "sqlite" and db_host not in SAFE_DB_HOSTS:
        raise RuntimeError(
            "DB接続先がローカル向けではないため中止しました。"
            f" 現在の host={db_host!r}。"
            " `localhost` / `127.0.0.1` / `db` / `sqlite` のみ許可しています。"
        )

    if os.getenv("CONFIRM_DELETE_SEED_ARTICLES") != "1":
        raise RuntimeError(
            "確認フラグがありません。"
            " 先頭に `CONFIRM_DELETE_SEED_ARTICLES=1` を付けて実行してください。"
        )


def main():
    ensure_safe_to_delete()
    delete_all = os.getenv("CONFIRM_DELETE_SEED_ALL") == "1"

    with SessionLocal.begin() as session:
        deleted_article_tags = session.execute(delete(ArticleTag)).rowcount or 0
        deleted_articles = session.execute(delete(Article)).rowcount or 0
        deleted_tags = 0
        deleted_categories = 0
        deleted_admin_users = 0

        if delete_all:
            deleted_tags = session.execute(delete(Tag)).rowcount or 0
            deleted_categories = session.execute(delete(Category)).rowcount or 0
            deleted_admin_users = session.execute(delete(AdminUser)).rowcount or 0

    print(f"削除件数(article_tags): {deleted_article_tags}")
    print(f"削除件数(articles): {deleted_articles}")
    if delete_all:
        print(f"削除件数(tags): {deleted_tags}")
        print(f"削除件数(categories): {deleted_categories}")
        print(f"削除件数(admin_users): {deleted_admin_users}")
    else:
        print(
            "全削除ではありません。"
            " 全削除する場合は `CONFIRM_DELETE_SEED_ALL=1` を追加してください。"
        )


if __name__ == "__main__":
    main()
