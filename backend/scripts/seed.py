"""
開発用サンプルデータ投入スクリプト
実行:
    cd backend
    uv run python -m scripts.seed
"""

from datetime import UTC, datetime

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.admin_user import AdminUser
from app.models.article import Article
from app.models.category import Category
from app.models.tag import Tag


def get_or_create_category(session, *, name: str, slug: str, color: str | None, icon: str | None):
    category = session.scalar(select(Category).where(Category.slug == slug))
    if category:
        return category

    category = Category(
        name=name,
        slug=slug,
        color=color,
        icon=icon,
    )
    session.add(category)
    return category


def get_or_create_tag(session, *, name: str, slug: str):
    tag = session.scalar(select(Tag).where(Tag.slug == slug))
    if tag:
        return tag

    tag = Tag(
        name=name,
        slug=slug,
    )
    session.add(tag)
    return tag


def main():
    with SessionLocal.begin() as session:
        # ---- Categories ----
        programming = get_or_create_category(
            session,
            name="Programming",
            slug="programming",
            color="blue",
            icon="code",
        )
        # ---- Tags ----
        python = get_or_create_tag(
            session,
            name="Python",
            slug="python",
        )
        fastapi = get_or_create_tag(
            session,
            name="FastAPI",
            slug="fastapi",
        )

        # ---- Articles ----
        article = session.scalar(select(Article).where(Article.slug == "hello-logbook"))
        if not article:
            article = Article(
                title="Hello LogBook",
                slug="hello-logbook",
                content="# Hello LogBook\n\nこれはサンプル記事です。",
                category=programming,
                is_draft=False,
                published_at=datetime.now(UTC),
            )
            article.tags.extend([python, fastapi])
            session.add(article)

        else:
            # 既存記事にタグを追加
            for tag in (python, fastapi):
                if tag not in article.tags:
                    article.tags.append(tag)

        # ---- Admin Users ----
        admin = session.scalar(select(AdminUser).where(AdminUser.email == "admin@example.com"))
        if not admin:
            session.add(
                AdminUser(
                    email="admin@example.com",
                    provider="google",
                    provider_id="seed-admin-001",
                    name="Admin User",
                )
            )

    print("✅ seed data inserted successfully")


if __name__ == "__main__":
    main()
