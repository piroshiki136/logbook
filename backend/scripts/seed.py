"""
開発用サンプルデータ投入スクリプト
実行:
    cd backend
    uv run python -m scripts.seed
"""

from app.db.session import SessionLocal
from app.models.admin_user import AdminUser
from app.models.article import Article
from app.models.category import Category
from app.models.tag import Tag


def get_or_create_category(session, *, name: str, slug: str, color: str | None, icon: str | None):
    category = session.query(Category).filter_by(slug=slug).first()
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
    tag = session.query(Tag).filter_by(slug=slug).first()
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
        article = session.query(Article).filter_by(slug="hello-logbook").first()
        if not article:
            article = Article(
                title="Hello LogBook",
                slug="hello-logbook",
                content="# Hello LogBook\n\nこれはサンプル記事です。",
                category=programming,
                is_draft=False,
            )
            article.tags.extend([python, fastapi])
            session.add(article)

        else:
            # 既存記事にタグを追加
            for tag in (python, fastapi):
                if tag not in article.tags:
                    article.tags.append(tag)

        # ---- Admin Users ----
        admin = session.query(AdminUser).filter_by(email="admin@example.com").first()
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
