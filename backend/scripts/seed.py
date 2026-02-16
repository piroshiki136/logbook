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


def get_or_create_category(
    session,
    *,
    name: str,
    slug: str,
    color: str | None,
    icon: str | None,
):
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


SEED_ARTICLES = [
    {
        "title": "FastAPI入門",
        "slug": "fastapi-intro-ja",
        "content": "# FastAPI入門\n\nFastAPI の基本ルーティングを学ぶための記事です。",
        "is_draft": False,
        "published_at": datetime(2026, 1, 10, 9, 0, tzinfo=UTC),
        "tags": ["fastapi"],
    },
    {
        "title": "Python実践Tips",
        "slug": "python-tips-ja",
        "content": "# Python実践Tips\n\n開発で役立つ小さなテクニックをまとめます。",
        "is_draft": False,
        "published_at": None,
        "tags": ["python", "backend"],
    },
    {
        "title": "テスト戦略メモ",
        "slug": "testing-strategy-ja",
        "content": "# テスト戦略メモ\n\nユニットテストと統合テストの分け方を整理します。",
        "is_draft": True,
        "published_at": datetime(2026, 1, 12, 9, 0, tzinfo=UTC),
        "tags": ["python", "fastapi", "testing", "api", "backend"],
    },
    {
        "title": "設計メモ",
        "slug": "architecture-note-ja",
        "content": "# 設計メモ\n\n画面遷移と責務分離の方針を整理します。",
        "is_draft": True,
        "published_at": None,
        "tags": ["design", "memo", "frontend"],
    },
]


def main():
    with SessionLocal.begin() as session:
        # ---- Category ----
        programming = get_or_create_category(
            session,
            name="Programming",
            slug="programming",
            color="blue",
            icon="code",
        )

        # ---- Tags ----
        seed_tags = [
            ("python", "Python"),
            ("fastapi", "FastAPI"),
            ("testing", "Testing"),
            ("api", "API"),
            ("backend", "Backend"),
            ("design", "Design"),
            ("memo", "Memo"),
            ("frontend", "Frontend"),
        ]
        tag_map: dict[str, Tag] = {}
        for slug, name in seed_tags:
            tag_map[slug] = get_or_create_tag(session, name=name, slug=slug)

        # ---- Articles ----
        for seed_article in SEED_ARTICLES:
            article = session.scalar(select(Article).where(Article.slug == seed_article["slug"]))
            article_tags = [tag_map[tag_slug] for tag_slug in seed_article["tags"]]

            if not article:
                article = Article(
                    title=seed_article["title"],
                    slug=seed_article["slug"],
                    content=seed_article["content"],
                    category=programming,
                    is_draft=seed_article["is_draft"],
                    published_at=seed_article["published_at"],
                )
                article.tags = article_tags
                session.add(article)
            else:
                article.title = seed_article["title"]
                article.content = seed_article["content"]
                article.category = programming
                article.is_draft = seed_article["is_draft"]
                article.published_at = seed_article["published_at"]
                article.tags = article_tags

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
