from .base import SchemaBase


class CategoryRead(SchemaBase):
    id: int
    name: str
    slug: str
    color: str | None = None
    icon: str | None = None


class CategoryCreate(SchemaBase):
    name: str
    slug: str | None = None
    color: str | None = None
    icon: str | None = None
