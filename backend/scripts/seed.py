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
        return category, False

    category = Category(
        name=name,
        slug=slug,
        color=color,
        icon=icon,
    )
    session.add(category)
    return category, True


def get_or_create_tag(session, *, name: str, slug: str):
    tag = session.scalar(select(Tag).where(Tag.slug == slug))
    if tag:
        return tag, False

    tag = Tag(
        name=name,
        slug=slug,
    )
    session.add(tag)
    return tag, True


SEED_CATEGORIES = [
    {
        "name": "Programming",
        "slug": "programming",
        "color": "blue",
        "icon": "code",
    },
    {
        "name": "Frontend",
        "slug": "frontend",
        "color": "green",
        "icon": "monitor",
    },
    {
        "name": "DevOps",
        "slug": "devops",
        "color": "orange",
        "icon": "server",
    },
]

SEED_TAGS = [
    ("python", "Python"),
    ("fastapi", "FastAPI"),
    ("testing", "Testing"),
    ("api", "API"),
    ("backend", "Backend"),
    ("design", "Design"),
    ("memo", "Memo"),
    ("frontend", "Frontend"),
    ("nextjs", "Next.js"),
    ("database", "Database"),
    ("security", "Security"),
    ("devops", "DevOps"),
    ("docker", "Docker"),
    ("auth", "Auth"),
]

SEED_ARTICLES = [
    {
        "title": "FastAPI入門",
        "slug": "fastapi-intro-ja",
        "content": "# FastAPI入門\n\nFastAPI の基本ルーティングを学ぶための記事です。",
        "category_slug": "programming",
        "is_draft": False,
        "published_at": datetime(2026, 1, 10, 9, 0, tzinfo=UTC),
        "tags": ["fastapi"],
    },
    {
        "title": "Python実践Tips",
        "slug": "python-tips-ja",
        "content": "# Python実践Tips\n\n開発で役立つ小さなテクニックをまとめます。",
        "category_slug": "programming",
        "is_draft": False,
        "published_at": datetime(2026, 1, 15, 10, 30, tzinfo=UTC),
        "tags": ["python", "backend"],
    },
    {
        "title": "テスト戦略メモ",
        "slug": "testing-strategy-ja",
        "content": "# テスト戦略メモ\n\nユニットテストと統合テストの分け方を整理します。",
        "category_slug": "programming",
        "is_draft": True,
        "published_at": datetime(2026, 1, 12, 9, 0, tzinfo=UTC),
        "tags": ["python", "fastapi", "testing", "api", "backend"],
    },
    {
        "title": "設計メモ",
        "slug": "architecture-note-ja",
        "content": "# 設計メモ\n\n画面遷移と責務分離の方針を整理します。",
        "category_slug": "frontend",
        "is_draft": True,
        "published_at": None,
        "tags": ["design", "memo", "frontend"],
    },
    {
        "title": "Next.js App Router実装メモ",
        "slug": "nextjs-app-router-note-ja",
        "content": "# Next.js App Router実装メモ\n\nレイアウト設計とデータ取得戦略を整理します。",
        "category_slug": "frontend",
        "is_draft": False,
        "published_at": datetime(2026, 1, 20, 8, 0, tzinfo=UTC),
        "tags": ["nextjs", "frontend", "design"],
    },
    {
        "title": "Docker Compose 開発環境",
        "slug": "docker-compose-dev-env-ja",
        "content": "# Docker Compose 開発環境\n\n開発用コンテナ構成と運用ルールのメモです。",
        "category_slug": "devops",
        "is_draft": True,
        "published_at": None,
        "tags": ["docker", "devops", "backend"],
    },
    {
        "title": "APIバージョニング方針",
        "slug": "api-versioning-policy-ja",
        "content": "# APIバージョニング方針\n\n互換性維持のための設計ルールをまとめます。",
        "category_slug": "programming",
        "is_draft": True,
        "published_at": datetime(2026, 1, 8, 15, 0, tzinfo=UTC),
        "tags": ["api", "backend", "design"],
    },
    {
        "title": "PostgreSQL インデックス設計",
        "slug": "postgres-indexing-ja",
        "content": "# PostgreSQL インデックス設計\n\n検索速度改善のための基本パターンを整理します。",
        "category_slug": "programming",
        "is_draft": False,
        "published_at": datetime(2026, 1, 22, 11, 0, tzinfo=UTC),
        "tags": ["database", "backend", "testing"],
    },
    {
        "title": "運用障害ポストモーテム雛形",
        "slug": "incident-postmortem-template-ja",
        "content": "# 運用障害ポストモーテム雛形\n\n原因分析と再発防止の記録テンプレートです。",
        "category_slug": "devops",
        "is_draft": True,
        "published_at": None,
        "tags": ["devops", "memo", "testing"],
    },
    {
        "title": "RS256 認証運用ガイド",
        "slug": "rs256-auth-ops-ja",
        "content": "# RS256 認証運用ガイド\n\n鍵ローテーションと検証観点を整理します。",
        "category_slug": "devops",
        "is_draft": False,
        "published_at": datetime(2026, 1, 25, 13, 0, tzinfo=UTC),
        "tags": ["security", "auth", "backend", "devops"],
    },
]


def validate_seed_articles(
    *,
    seed_articles: list[dict],
    category_map: dict[str, Category],
    tag_map: dict[str, Tag],
) -> None:
    for article in seed_articles:
        if article["category_slug"] not in category_map:
            raise ValueError(f"unknown category_slug: {article['category_slug']}")
        for tag_slug in article["tags"]:
            if tag_slug not in tag_map:
                raise ValueError(f"unknown tag slug: {tag_slug}")

        # 仕様: is_draft=false の記事は published_at を必須にする。
        if article["is_draft"] is False and article["published_at"] is None:
            raise ValueError(
                f"published_at is required when is_draft=false (slug={article['slug']})"
            )


def main():
    with SessionLocal.begin() as session:
        created_categories = 0
        created_tags = 0
        created_articles = 0
        updated_articles = 0
        created_admin_users = 0

        # ---- Category ----
        category_map: dict[str, Category] = {}
        for category in SEED_CATEGORIES:
            category_obj, created = get_or_create_category(
                session,
                name=category["name"],
                slug=category["slug"],
                color=category["color"],
                icon=category["icon"],
            )
            category_map[category["slug"]] = category_obj
            if created:
                created_categories += 1

        # ---- Tags ----
        tag_map: dict[str, Tag] = {}
        for slug, name in SEED_TAGS:
            tag_obj, created = get_or_create_tag(session, name=name, slug=slug)
            tag_map[slug] = tag_obj
            if created:
                created_tags += 1

        validate_seed_articles(
            seed_articles=SEED_ARTICLES,
            category_map=category_map,
            tag_map=tag_map,
        )

        # ---- Articles ----
        for seed_article in SEED_ARTICLES:
            article = session.scalar(select(Article).where(Article.slug == seed_article["slug"]))
            article_tags = [tag_map[tag_slug] for tag_slug in seed_article["tags"]]
            article_category = category_map[seed_article["category_slug"]]

            if not article:
                article = Article(
                    title=seed_article["title"],
                    slug=seed_article["slug"],
                    content=seed_article["content"],
                    category=article_category,
                    is_draft=seed_article["is_draft"],
                    published_at=seed_article["published_at"],
                )
                article.tags = article_tags
                session.add(article)
                created_articles += 1
            else:
                article.title = seed_article["title"]
                article.content = seed_article["content"]
                article.category = article_category
                article.is_draft = seed_article["is_draft"]
                article.published_at = seed_article["published_at"]
                article.tags = article_tags
                updated_articles += 1

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
            created_admin_users += 1

    print("✅ seed data inserted successfully")
    print(f"作成件数(categories): {created_categories}")
    print(f"作成件数(tags): {created_tags}")
    print(f"作成件数(articles): {created_articles}")
    print(f"更新件数(articles): {updated_articles}")
    print(f"作成件数(admin_users): {created_admin_users}")


if __name__ == "__main__":
    main()
