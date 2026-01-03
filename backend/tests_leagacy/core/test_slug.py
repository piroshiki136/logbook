from app.core.slug import ensure_unique_slug, slugify
from app.models.article import Article
from app.models.category import Category


def _create_category(db_session, *, name="Backend", slug="backend"):
    category = Category(name=name, slug=slug)
    db_session.add(category)
    db_session.flush()
    return category


def _create_article(db_session, *, category_id, slug):
    article = Article(
        title="Sample",
        slug=slug,
        content="Body",
        category_id=category_id,
        is_draft=False,
    )
    db_session.add(article)
    db_session.flush()
    return article


def test_slugify_allows_japanese_and_squashes_separators():
    value = " こんにちは World!! "
    assert slugify(value) == "こんにちは-world"


def test_ensure_unique_slug_appends_suffix(db_session):
    category = _create_category(db_session)
    _create_article(db_session, category_id=category.id, slug="hello-world")
    _create_article(db_session, category_id=category.id, slug="hello-world-2")

    assert ensure_unique_slug(db_session, "hello-world") == "hello-world-3"
