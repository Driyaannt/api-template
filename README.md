# backend-driya

Express + TypeScript API starter in a pnpm workspace, paired with a Vite React dashboard and OpenAPI-driven API Explorer.

## Quick start

```bash
corepack enable
pnpm install
Copy-Item .env.example .env # PowerShell
pnpm docker:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

API: `http://localhost:3000/api/v1`; web: `http://localhost:5173`; Mailpit: `http://localhost:8025`.

The development administrator comes from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (the example values are `admin@example.test` / `ChangeMe123!`). Change them before deploying.

## Architecture

`route/controller → service → repository contract → adapter`. The active adapter comes from `DB_ACCESS_MODE`. The completed adapter is `raw` (`pg` pool, parameter binding, transactions, migration runner, and repeatable seed). Prisma and Sequelize are intentionally not represented as working adapters yet: their directory/schema extension point is present, but the factory rejects them rather than pretending functionality.

Raw migrations live in `database/migrations/raw`; `pnpm db:migrate`, `pnpm db:migrate:status`, and `pnpm db:migrate:rollback` manage `schema_migrations`. `pnpm setup -- --access=raw` creates `.env` and runs migration. Use a separate `DATABASE_URL` for testing.

## Modules and endpoints

Authentication endpoints available now: register, login, refresh, logout, and `GET /auth/me`, in addition to health, ready, and `/openapi.json`. Add a module by defining its entity and repository contract, implementing it once per adapter, selecting it in a factory, then mounting validated routes. Add OpenAPI path metadata in the same module: the dashboard reads it from `/openapi.json`, so endpoints do not need separate frontend registration.

## Commands

`pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm docker:up`, and `pnpm docker:down` are available from root. `db:generate` and `db:studio` are Prisma-only commands.

## Security notes

Passwords are Argon2 hashes; refresh tokens are opaque, HTTP-only cookies and only their SHA-256 hashes are stored. Raw SQL is parameterized and its pool is shut down gracefully. Production deployments must set unique, strong JWT values, `COOKIE_SECURE=true`, and a narrow `CORS_ORIGIN`.
