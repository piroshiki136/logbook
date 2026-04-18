FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system app \
    && adduser --system --ingroup app --home /app app

COPY pyproject.toml uv.lock ./

RUN pip install --upgrade pip \
    && pip install uv \
    && uv export --frozen --no-dev --format requirements-txt > requirements.txt \
    && pip install -r requirements.txt

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./
COPY scripts ./scripts

RUN mkdir -p /app/uploads \
    && chown -R app:app /app

USER app

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
