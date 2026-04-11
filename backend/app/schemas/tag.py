from .base import SchemaBase


class TagRead(SchemaBase):
    id: int
    name: str
    slug: str


class TagUpdate(SchemaBase):
    name: str
