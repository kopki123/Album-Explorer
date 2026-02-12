# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /workspace

# 先裝依賴（npm）
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
RUN npm install
RUN npm ci

# 再複製全部程式碼並 build backend
COPY . .
RUN npx nx build backend --configuration=production

# ---- runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /workspace/dist/apps/backend ./dist
COPY --from=build /workspace/node_modules ./node_modules

EXPOSE 8080
CMD ["node", "dist/main.js"]
