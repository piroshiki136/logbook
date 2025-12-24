from pydantic import Field

from .base import SchemaBase


class ErrorBody(SchemaBase):
    code: str = Field(..., examples=["ARTICLE_NOT_FOUND"])
    message: str = Field(..., examples=["記事が見つかりません"])


class ErrorResponse(SchemaBase):
    error: ErrorBody
