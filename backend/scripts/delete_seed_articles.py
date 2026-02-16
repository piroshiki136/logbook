"""
記事データを全削除するスクリプト
実行:
    cd backend
    uv run python -m scripts.delete_seed_articles
"""

from sqlalchemy import delete

from app.db.session import SessionLocal
from app.models.article import Article
from app.models.article_tag import ArticleTag


def main():
    with SessionLocal.begin() as session:
        deleted_article_tags = session.execute(delete(ArticleTag)).rowcount or 0
        deleted_articles = session.execute(delete(Article)).rowcount or 0

    print(f"削除件数(article_tags): {deleted_article_tags}")
    print(f"削除件数(articles): {deleted_articles}")


if __name__ == "__main__":
    main()
