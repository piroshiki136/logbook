import logging
import re
import time
from collections import OrderedDict, deque
from hashlib import sha256
from typing import Any

import jwt
from fastapi import APIRouter, HTTPException, Request, status
from jwt import PyJWKClient, PyJWTError

from app.core.response import ApiResponse
from app.core.security import create_access_token
from app.core.settings import get_settings
from app.schemas.auth import TokenExchangeRequest, TokenExchangeResponse

settings = get_settings()
router = APIRouter()
logger = logging.getLogger(__name__)

SUBJECT_MAX_LENGTH = 64
SUBJECT_PATTERN = re.compile(r"^github:[0-9]+$")

ASSERTION_REQUIRED_CLAIMS = ("iss", "iat", "exp", "jti", "email")
ASSERTION_JTI_TTL_SECONDS = 180
ASSERTION_JTI_MAX_SIZE = 1000
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX = 30

_jwks_client = (
    PyJWKClient(settings.frontend_assertion_jwks_url)
    if settings.frontend_assertion_jwks_url
    else None
)


class JtiStore:
    def __init__(self, ttl_seconds: int, max_size: int) -> None:
        self._ttl_seconds = ttl_seconds
        self._max_size = max_size
        self._entries: OrderedDict[str, float] = OrderedDict()

    def _prune(self, now: float) -> None:
        expired = []
        for key, expires_at in self._entries.items():
            if expires_at > now:
                break
            expired.append(key)
        for key in expired:
            self._entries.pop(key, None)

    def seen(self, jti: str, now: float) -> bool:
        key = sha256(jti.encode("utf-8")).hexdigest()
        expires_at = self._entries.get(key)
        if expires_at is None:
            return False
        if expires_at <= now:
            self._entries.pop(key, None)
            return False
        return True

    def add(self, jti: str, now: float) -> None:
        self._prune(now)
        key = sha256(jti.encode("utf-8")).hexdigest()
        self._entries[key] = now + self._ttl_seconds
        self._entries.move_to_end(key)
        while len(self._entries) > self._max_size:
            self._entries.popitem(last=False)


class RateLimiter:
    def __init__(self, limit: int, window_seconds: int) -> None:
        self._limit = limit
        self._window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = {}

    def allow(self, key: str, now: float) -> bool:
        hits = self._hits.setdefault(key, deque())
        window_start = now - self._window_seconds
        while hits and hits[0] <= window_start:
            hits.popleft()
        if len(hits) >= self._limit:
            return False
        hits.append(now)
        return True


jti_store = JtiStore(ttl_seconds=ASSERTION_JTI_TTL_SECONDS, max_size=ASSERTION_JTI_MAX_SIZE)
rate_limiter = RateLimiter(limit=RATE_LIMIT_MAX, window_seconds=RATE_LIMIT_WINDOW_SECONDS)


def _get_assertion_key(token: str) -> str:
    if _jwks_client:
        return _jwks_client.get_signing_key_from_jwt(token).key
    if settings.frontend_assertion_public_key:
        return settings.frontend_assertion_public_key
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail={
            "code": "AUTH_CONFIG_MISSING",
            "message": "Assertion public key is not configured",
        },
    )


def _decode_assertion(token: str) -> dict[str, Any]:
    try:
        key = _get_assertion_key(token)
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=settings.frontend_assertion_issuer,
            options={
                "require": list(ASSERTION_REQUIRED_CLAIMS),
                "verify_iat": True,
            },
            leeway=5,
        )
        return payload
    except PyJWTError as exc:
        logger.warning("Assertion decode failed: %s", exc.__class__.__name__)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_INVALID_ASSERTION",
                "message": "認証に失敗しました",
            },
        ) from exc


def _rate_limit_or_429(request: Request, now: float) -> None:
    client_host = request.client.host if request.client else "unknown"
    if not rate_limiter.allow(client_host, now):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "AUTH_RATE_LIMIT",
                "message": "リクエストが多すぎます",
            },
        )


@router.post(
    "/auth/token",
    response_model=ApiResponse[TokenExchangeResponse],
)
def exchange_token(payload: TokenExchangeRequest, request: Request):
    now = time.time()
    _rate_limit_or_429(request, now)

    decoded = _decode_assertion(payload.assertion)

    email = decoded.get("email")
    if not isinstance(email, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_INVALID_ASSERTION",
                "message": "認証に失敗しました",
            },
        )

    normalized_email = email.lower()
    allowed_emails = {item.lower() for item in settings.admin_allowed_emails}
    if normalized_email not in allowed_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "AUTH_FORBIDDEN",
                "message": "権限がありません",
            },
        )

    jti = decoded.get("jti")
    if not isinstance(jti, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_INVALID_ASSERTION",
                "message": "認証に失敗しました",
            },
        )
    if jti_store.seen(jti, now):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_INVALID_ASSERTION",
                "message": "認証に失敗しました",
            },
        )
    jti_store.add(jti, now)

    token_payload: dict[str, Any] = {
        "email": normalized_email,
    }
    if "sub" in decoded:
        sub = decoded["sub"]
        if (
            not isinstance(sub, str)
            or not sub
            or len(sub) > SUBJECT_MAX_LENGTH
            or not SUBJECT_PATTERN.fullmatch(sub)
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "code": "AUTH_INVALID_ASSERTION",
                    "message": "認証に失敗しました",
                },
            )
        token_payload["sub"] = sub

    token = create_access_token(token_payload)

    return ApiResponse(
        success=True,
        data=TokenExchangeResponse(token=token),
    )
