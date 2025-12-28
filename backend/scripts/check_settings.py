import os

from app.core.settings import get_settings

settings = get_settings()

print("ENV =", os.getenv("ENV"))
print("DATABASE_URL =", settings.database_url)
print("DEBUG =", settings.debug)
