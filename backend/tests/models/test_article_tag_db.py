# article_tags の多対多関係と複合主キー制約を確認するテスト

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models import Article, ArticleTag, Category, Tag


def test_article_tag_relation_and_unique_pair(db_session):
    # --- 準備：カテゴリとタグ ---
    category = Category(name="Backend", slug="backend")
    tag = Tag(name="fastapi", slug="fastapi")
    db_session.add_all([category, tag])
    db_session.flush()

    # --- 記事作成 ---
    article = Article(
        slug="fastapi-intro",
        title="FastAPI Intro",
        content="Hello",
        category_id=category.id,
    )
    db_session.add(article)
    db_session.flush()

    # --- 中間テーブル（article_tags）に 1 件登録 ---
    link = ArticleTag(article_id=article.id, tag_id=tag.id)
    db_session.add(link)
    db_session.flush()

    # --- JOIN でタグが正しく取得できることを確認 ---
    joined_tag = db_session.execute(
        select(Tag)
        .join(ArticleTag, Tag.id == ArticleTag.tag_id)
        .where(ArticleTag.article_id == article.id)
    ).scalar_one()
    assert joined_tag.name == "fastapi"

    # --- UNIQUE（複合主キー）制約の確認 ---
    # 既存の ORM インスタンスを Session から切り離す
    db_session.expunge_all()

    duplicate_link = ArticleTag(article_id=article.id, tag_id=tag.id)
    db_session.add(duplicate_link)

    with pytest.raises(IntegrityError):
        db_session.flush()
