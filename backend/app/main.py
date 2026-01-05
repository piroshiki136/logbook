from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import articles, categories, health, tags, uploads
from app.core.exceptions import setup_exception_handlers
from app.core.settings import get_settings

settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
    )

    # ---- CORS ----
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---- Exception Handlers ----
    setup_exception_handlers(app)

    # ---- Routers ----
    app.include_router(
        health.router,
        prefix=settings.api_v1_prefix,
        tags=["health"],
    )
    app.include_router(
        articles.router,
        prefix=settings.api_v1_prefix,
        tags=["articles"],
    )
    app.include_router(
        tags.router,
        prefix=settings.api_v1_prefix,
        tags=["tags"],
    )
    app.include_router(
        categories.router,
        prefix=settings.api_v1_prefix,
        tags=["categories"],
    )
    app.include_router(
        uploads.router,
        prefix=settings.api_v1_prefix,
        tags=["uploads"],
    )

    return app


app = create_app()
