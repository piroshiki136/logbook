from .base import SchemaBase


class AdminUserRead(SchemaBase):
    """管理者情報の読み取り用スキーマ。"""

    id: int
    email: str
    provider: str
    provider_id: str
    name: str


class AdminUserCreate(SchemaBase):
    """NextAuth 同期時に管理者を登録するためのスキーマ。"""

    email: str
    provider: str
    provider_id: str
    name: str
