# Album Explorer (Nx Monorepo)

[繁體中文 README](README.md)

![image](./.github/preview.png)

Album Explorer is a full-stack Nx workspace with:
- Nuxt 4 frontend (`apps/frontend`)
- NestJS 11 backend (`apps/backend`)
- Playwright frontend e2e (`apps/frontend-e2e`)

The backend exposes versioned REST endpoints under `/api/v1`, and Swagger docs in non-production by default.

## Tech Stack
- Nx `22.5.x`
- Nuxt 4 + Vue 3
- NestJS 11
- TypeORM + PostgreSQL (local Postgres or Supabase Postgres)
- PrimeVue + Tailwind CSS

## Prerequisites
- Node.js 22+
- npm 10+
- PostgreSQL 13+ (or Supabase project with Postgres connection string)

## Local Development
1. Install dependencies:
```bash
npm install
```

2. Create env files:
- `apps/backend/.env`
- `apps/frontend/.env`

3. Start backend:
```bash
npx nx run backend:serve --configuration=production
```

4. Seed albums data (optional but recommended for local dev):
```bash
DATABASE_URL="DB connection string" npx tsx apps/backend/src/scripts/seed-albums.ts
```

5. Start frontend:
```bash
npx nx run frontend:serve
```

6. Open:
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api/v1/docs`

## Environment Variables

### Backend (`apps/backend/.env`)

`DATABASE_URL` is required by current backend startup.

```dotenv
NODE_ENV=development
PORT=3001
FRONTEND_ORIGIN=http://localhost:4200
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/albums-explorer-dev
DB_POOL_MAX=5
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=false

JWT_ACCESS_SECRET=replace-me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace-me

GOOGLE_CLIENT_ID=replace-me
GOOGLE_CLIENT_SECRET=replace-me
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
WEB_LOGIN_SUCCESS_REDIRECT_URL=http://localhost:4200/auth/callback

COOKIE_SECURE=false
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=localhost
CSRF_ALLOW_NO_ORIGIN=true
SWAGGER_ENABLED=true
```

Notes:
- `fake-login` endpoint is disabled in production.
- Backend CORS/CSRF checks are based on `FRONTEND_ORIGIN`.

### Frontend (`apps/frontend/.env`)

```dotenv
NUXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
NUXT_PUBLIC_SITE_URL=http://localhost:4200
NUXT_PUBLIC_GTAG_ID=
```

Notes:
- `NUXT_PUBLIC_API_BASE` should include `/api/v1`.
- Google Analytics (`nuxt-gtag`) only runs when `NODE_ENV=production`.

## Data Seed
- Seed script: `apps/backend/src/scripts/seed-albums.ts`
- Default source file: `data/albums.json`

## Nx Commands
```bash
# Serve
npx nx run backend:serve --configuration=production
npx nx run frontend:serve

# Build
npx nx run backend:build --configuration=production
npx nx run frontend:build
```

## Project Structure
- `apps/frontend/app`: Nuxt app source (`pages`, `components`, `composables`, `service`)
- `apps/backend/src`: NestJS source (`modules`, `common`, `health`, scripts)
- `data/`: album dataset JSON files
