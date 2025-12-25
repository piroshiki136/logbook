from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):  # noqa: UP046
    success: bool
    data: T | None = None
    message: str | None = None
