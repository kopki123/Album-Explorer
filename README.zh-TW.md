# Album Explorer（Nx Monorepo）

[English README](README.md)

Album Explorer 是一個全端 Nx workspace，包含：
- Nuxt 4 前端（`apps/frontend`）
- NestJS 11 後端（`apps/backend`）
- Playwright 前端 e2e（`apps/frontend-e2e`）

後端提供以 `/api/v1` 為前綴的 REST API，並且在非正式環境預設啟用 Swagger 文件。

## 技術棧
- Nx `22.5.x`
- Nuxt 4 + Vue 3
- NestJS 11
- TypeORM + PostgreSQL（本機 Postgres 或 Supabase Postgres）
- PrimeVue + Tailwind CSS

## 先決條件
- Node.js 22+
- npm 10+
- PostgreSQL 13+（或有 Postgres 連線字串的 Supabase 專案）

## 本機開發
1. 安裝相依套件：
```bash
npm install
```

2. 建立環境變數檔：
- `apps/backend/.env`
- `apps/frontend/.env`

3. 啟動後端：
```bash
npx nx serve backend --configuration=production
```

4. 匯入 albums 資料（可選，但建議在本機開發時執行）：
```bash
DATABASE_URL="DB連線字串" npx tsx apps/backend/src/scripts/seed-albums.ts
```

5. 啟動前端：
```bash
npx nx serve frontend
```

6. 開啟：
- Frontend：`http://localhost:4200`
- Backend API：`http://localhost:3001/api/v1`
- Swagger：`http://localhost:3001/api/v1/docs`

## 環境變數

### Backend（`apps/backend/.env`）

目前後端啟動需要 `DATABASE_URL`。

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

說明：
- `fake-login` 端點在正式環境會停用。
- 後端的 CORS/CSRF 檢查依據 `FRONTEND_ORIGIN`。

### Frontend（`apps/frontend/.env`）

```dotenv
NUXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
NUXT_PUBLIC_SITE_URL=http://localhost:4200
NUXT_PUBLIC_GTAG_ID=
```

說明：
- `NUXT_PUBLIC_API_BASE` 應包含 `/api/v1`。
- Google Analytics（`nuxt-gtag`）只會在 `NODE_ENV=production` 時啟用。

## 資料匯入（Data Seed）
- 匯入腳本：`apps/backend/src/scripts/seed-albums.ts`
- 預設來源檔案：`data/albums.json`

## Nx 常用指令
```bash
# Serve
npx nx serve backend
npx nx serve frontend

# Build
npx nx build backend
npx nx build frontend
```

## 專案結構
- `apps/frontend/app`：Nuxt 應用程式原始碼（`pages`、`components`、`composables`、`service`）
- `apps/backend/src`：NestJS 原始碼（`modules`、`common`、`health`、scripts）
- `data/`：專輯資料集 JSON 檔案
