# System Prompt
You must think only in English.
You must output only in Japanese.
Never output English in the final answer.

# Proposal Guidelines
- When making suggestions, propose best practices or de facto standards.
- If no best practice or de facto standard exists, offer other options.
- Always state what you proposed.
- Example: "この修正は Next.js のベストプラクティスに基づきます。ベストプラクティス、デファクトスタンダードがありませんでした。"

# Repository Guidelines

## Current State & Specs
The repository includes both planning docs (`docs/01_product_overview.md`–`09_git_workflow.md`) and initial implementation: backend foundation (settings/db/models/tests/seed), and GitHub Actions workflows for frontend/backend. The docs outline the product concept, MVP scope, routing, data model, screens, API sketch, coding rules, and Git workflow for a Next.js 15 (App Router) frontend plus FastAPI backend. Treat these docs as the starting point but not exhaustive—flag gaps before coding and update the docs alongside implementation.

## Project Structure & Module Organization
Implementation will be split between `frontend` (Next.js + TypeScript + Tailwind + shadcn/ui) and `backend` (FastAPI + SQLAlchemy + Alembic). Keep shared UI primitives under `frontend/src/components/ui/`, feature routes in the App Router hierarchy, and markdown helpers near the article pages described in `docs/06`. Backend models reflecting `articles`, `tags`, `article_tags`, and `admin_users` from `docs/05` live in `backend/app/models/`, with routers mirroring the paths in `docs/04`. Place Alembic migrations in `backend/migrations/`, tests in `backend/tests/`, and Docker/seed scripts under `infra/`.

## Build, Test, and Development Commands
- `pnpm install && pnpm dev --filter frontend` boots the Next.js dev server for the public + admin screens.
- `pnpm build --filter frontend` outputs the bundle for Vercel deployments.
- `pnpm lint --filter frontend` runs Biome formatting/linting across TS/TSX files.
- `cd backend && uv sync && uv run fastapi dev app.main:app` installs Python deps and serves FastAPI routes (`/api/articles`, `/api/tags`, `/api/upload-image`, etc.).
- `cd backend && uv run pytest` executes backend tests (tests set `SETTINGS_ENV=test` automatically).
- `docker compose up frontend backend db` (planned) should align local PostgreSQL with the ERD in `docs/05`.

## Coding Style & Naming Conventions
Use Biome defaults (2-space indent, single quotes, trailing commas) and PascalCase filenames for React components, camelCase for hooks, kebab-case for slugs as stored in `articles.slug`. Tailwind classes should be grouped layout → spacing → color to stay consistent with `docs/06`. Python relies on Ruff for lint/format, with 4-space indents, snake_case functions, PascalCase Pydantic schemas, and double-quoted strings. Use SQLAlchemy 2.0 style APIs consistently. Keep API JSON fields camelCase (`createdAt`, `isDraft`) even though DB columns are snake_case per `docs/05`.

## Testing Guidelines
Front-end tests (Vitest + Testing Library) belong near the relevant routes/components (e.g., article listing filters described in `docs/02` and `docs/04`). Backend tests (Pytest + httpx) must assert slug generation, tag/category filtering, draft separation, and auth protection of admin endpoints. Target ≥80% statement coverage and run Alembic migrations before DB-dependent suites. Capture assumptions in tests/docstrings whenever specs are incomplete.

## Git Workflow & Collaboration
Follow the branching model from `docs/09_git_workflow.md`: keep `main` production-ready, use a single `dev` branch for integration, and create short-lived feature branches (e.g., `feature/article-edit`) off `dev`, merging back via PR and deleting afterward. Commits use the prefixes `feat`, `fix`, `refactor`, `docs`, `chore` (Japanese body allowed). Open PRs from feature → `dev`, then promote `dev` → `main` after verification. Add missing details (release tags, hotfix flow) to `docs/09` as they emerge.

## Commit & Pull Request Guidelines
Beyond the prefixes above, follow Conventional Commits with ≤72-character subjects referencing the related spec (e.g., `feat: add /articles pagination per doc04`). PRs must outline scope, link the relevant doc section, include screenshots for UI changes, and confirm `pnpm lint`, front-end tests, and `uv run pytest` were executed. Highlight unresolved spec gaps in a "Known Issues" block.
Provide commit message examples and suggestions only when the user explicitly asks, and when responding include the Conventional Commit prefix (feat/fix/refactor/docs/chore) followed by Japanese text for the subject/body.

## Security & Configuration
Store secrets in `.env.local` (frontend) and `.env` (backend); required keys include `NEXTAUTH_SECRET`, Google OAuth credentials, `DATABASE_URL`, `ADMIN_ALLOWED_EMAILS`, and the RS256 `JWT_PUBLIC_KEY`. Enforce NextAuth session checks on every `/admin` and article mutation endpoint, ensuring draft content (`is_draft=true`) never leaks via unauthenticated queries. Database backups, media storage, and rate limiting policies are still undecided—document decisions in `docs/` once defined.
