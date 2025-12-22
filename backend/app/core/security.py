import logging
from typing import Any

from app.core.settings import get_settings
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

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
            settings.nextauth_secret,
            algorithms=["HS256"],
            audience=settings.nextauth_audience,  # 誰向けのトークンか
            issuer=settings.nextauth_issuer,  # 発行者
        )
        return payload

    except JWTError as e:
        # 開発・運用のためにログには詳細を残す
        logger.warning("JWT validation failed", exc_info=e)

        if settings.debug:
            # 開発環境：原因が分かるようにする
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {e}",
            ) from None

        # 本番環境：詳細は隠す
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),  # noqa: B008
) -> dict[str, Any]:
    """
    認証済みユーザーを取得する Depends
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )

    token = credentials.credentials
    payload = verify_jwt_token(token)

    return payload


def require_admin(
    user: dict[str, Any] = Depends(get_current_user),  # noqa: B008
) -> dict[str, Any]:
    """
    管理者のみ通す Depends
    """
    email = user.get("email")

    if email not in settings.admin_allowed_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permission required",
        )

    return user
