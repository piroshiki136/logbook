from .base import SchemaBase


class TagRead(SchemaBase):
    id: int
    name: str
    slug: str
