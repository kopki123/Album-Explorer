FROM node:20-alpine AS build
WORKDIR /workspace

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
RUN npm install

COPY . .
RUN npx nx run @org/backend:build --configuration=production
RUN ls -la apps/backend/dist
RUN test -f apps/backend/dist/main.js

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache ca-certificates && update-ca-certificates

COPY --from=build /workspace/apps/backend/dist ./dist
COPY --from=build /workspace/node_modules ./node_modules

EXPOSE 8080
CMD ["node", "dist/main.js"]
