import logging
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWTError

from app.core.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Authorization: Bearer <token> を読むための仕組み
security_scheme = HTTPBearer(auto_error=False)


def verify_jwt_token(token: str) -> dict[str, Any]:
    """
    JWT を検証して payload を返す
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_public_key,
            algorithms=[settings.jwt_algorithm],
            audience=settings.jwt_audience,  # 誰向けのトークンか
            issuer=settings.jwt_issuer,  # 発行者
        )
        return payload

    except PyJWTError as e:
        # 開発・運用のためにログには詳細を残す
        logger.warning("JWT validation failed", exc_info=e)

        if settings.debug:
            # 開発環境：原因が分かるようにする
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "code": "AUTH_INVALID_TOKEN",
                    "message": f"Invalid token: {e}",
                },
            ) from None

        # 本番環境：詳細は隠す
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_INVALID_TOKEN",
                "message": "認証に失敗しました",
            },
        ) from None


def create_access_token(payload: dict[str, Any]) -> str:
    if not settings.jwt_private_key:
        raise RuntimeError("JWT_PRIVATE_KEY is required for token issuance")

    now = datetime.now(UTC)
    data = {
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "iat": int(now.timestamp()),
        **payload,
    }

    expire = now + timedelta(minutes=settings.access_token_expire_minutes)
    data["exp"] = int(expire.timestamp())

    return jwt.encode(
        data,
        settings.jwt_private_key,
        algorithm=settings.jwt_algorithm,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict[str, Any]:
    """
    認証済みユーザーを取得する Depends
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_INVALID_TOKEN",
                "message": "認証に失敗しました",
            },
        )

    token = credentials.credentials
    payload = verify_jwt_token(token)

    return payload


def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict[str, Any] | None:
    """
    任意認証の Depends（未認証なら None を返す）
    """
    if credentials is None:
        return None

    token = credentials.credentials
    try:
        return verify_jwt_token(token)
    except HTTPException:
        return None


def is_admin_user(user: dict[str, Any]) -> bool:
    email = user.get("email")
    return email is not None and email in settings.admin_allowed_emails


def require_admin(
    user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """
    管理者のみ通す Depends
    """
    if not is_admin_user(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "AUTH_FORBIDDEN",
                "message": "権限がありません",
            },
        )

    return user
