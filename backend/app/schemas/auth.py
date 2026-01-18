from .base import SchemaBase


class TokenExchangeRequest(SchemaBase):
    assertion: str


class TokenExchangeResponse(SchemaBase):
    token: str
