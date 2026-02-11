# Album Explorer (Nx Monorepo)

Album Explorer is a full-stack Nx workspace with a Nuxt 4 frontend and a NestJS backend. The backend exposes a versioned REST API and Swagger docs, and the frontend consumes it via a configurable API base URL.

**Tech Stack**
- Nx 22
- Nuxt 4 + Vue 3
- NestJS 11
- TypeORM + PostgreSQL
- PrimeVue + Tailwind
- Playwright (frontend e2e)
- Jest (backend e2e)

**Apps**
- `apps/frontend`: Nuxt 4 web app (dev server on `http://localhost:4200`)
- `apps/backend`: NestJS API (dev server on `http://localhost:3001`, base path `/api/v1`)
- `apps/frontend-e2e`: Playwright tests
- `apps/backend-e2e`: Jest e2e tests

**Requirements**
- Node.js 20+ (matches `@types/node` in the workspace)
- PostgreSQL 13+

**Quick Start (Local Dev)**
1. Install dependencies: `npm install`
2. Create required environment files:
   - `apps/backend/.env`
   - `apps/frontend/.env`
3. Start backend: `npx nx serve backend`
4. Start frontend: `npx nx serve frontend`

**Environment Variables**
Backend (`apps/backend/.env`):

| Key | Example | Notes |
| --- | --- | --- |
| `NODE_ENV` | `development` | Controls dev/prod behavior |
| `PORT` | `3001` | API port |
| `FRONTEND_ORIGIN` | `http://localhost:4200` | CORS allowed origin(s) |
| `GOOGLE_CLIENT_ID` | `...` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | `...` | Google OAuth |
| `GOOGLE_CALLBACK_URL` | `http://localhost:3001/api/v1/auth/google/callback` | Google OAuth callback |
| `WEB_LOGIN_SUCCESS_REDIRECT_URL` | `http://localhost:4200/auth/callback` | OAuth redirect |
| `JWT_ACCESS_SECRET` | `...` | JWT access secret |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_SECRET` | `...` | Refresh token secret |
| `REFRESH_TOKEN_EXPIRES_DAYS` | `30` | Refresh token TTL |
| `COOKIE_DOMAIN` | `localhost` | Cookie domain |
| `COOKIE_SECURE` | `false` | Set `true` in HTTPS |
| `COOKIE_SAMESITE` | `lax` | Cookie SameSite |
| `DB_HOST` | `localhost` | DB host |
| `DB_PORT` | `5432` | DB port |
| `DB_USERNAME` | `postgres` | DB user |
| `DB_PASSWORD` | `postgres` | DB password |
| `DB_NAME` | `albums-explorer-dev` | DB name |
| `DATABASE_URL` | `postgresql://...` | Optional connection URL |

Frontend (`apps/frontend/.env`):

| Key | Example | Notes |
| --- | --- | --- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001/api/v1` | API base URL |

**API Docs**
- Swagger UI: `http://localhost:3001/api/v1/docs` (enabled by default in non-production)

**Common Nx Commands**
- Serve frontend: `npx nx serve frontend`
- Serve backend: `npx nx serve backend`
- Build frontend: `npx nx build frontend`
- Build backend: `npx nx build backend`
- Frontend e2e: `npx nx e2e frontend-e2e`
- Backend e2e: `npx nx e2e backend-e2e`

**Project Structure**
- `apps/frontend/app`: Nuxt app source (`pages`, `components`, `composables`, etc.)
- `apps/backend/src`: NestJS app source (`modules`, `common`, `health`, etc.)
- `apps/*-e2e`: End-to-end test projects
- `packages/`: Shared libraries (currently empty)
