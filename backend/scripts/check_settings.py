import os
from urllib.parse import urlsplit, urlunsplit

from app.core.settings import get_settings

settings = get_settings()


def mask_database_url(database_url: str) -> str:
    parsed = urlsplit(database_url)
    if not parsed.scheme or not parsed.netloc:
        return database_url

    host = parsed.hostname or ""
    port = f":{parsed.port}" if parsed.port else ""
    if parsed.username or parsed.password:
        netloc = f"***:***@{host}{port}"
    else:
        netloc = f"{host}{port}"
    return urlunsplit((parsed.scheme, netloc, parsed.path, parsed.query, parsed.fragment))


print("SETTINGS_ENV =", os.getenv("SETTINGS_ENV"))
print("DATABASE_URL =", mask_database_url(settings.database_url))
print("DEBUG =", settings.debug)
