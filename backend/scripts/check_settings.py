import os

from app.core.settings import get_settings

settings = get_settings()

print("SETTINGS_ENV =", os.getenv("SETTINGS_ENV"))
print("DATABASE_URL =", settings.database_url)
print("DEBUG =", settings.debug)
