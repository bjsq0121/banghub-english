# syntax=docker/dockerfile:1.7
# Build the Fastify backend into a self-contained Cloud Run image.
# Build context MUST be the repo root so workspace packages are visible.
# Usage (from repo root):
#   docker build -f app/backend/Dockerfile -t banghub-backend .

FROM node:22-alpine AS deps
WORKDIR /repo
RUN corepack enable
COPY .npmrc pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY app/shared/package.json ./app/shared/package.json
COPY app/backend/package.json ./app/backend/package.json
COPY app/frontend/package.json ./app/frontend/package.json
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
WORKDIR /repo
COPY app/shared ./app/shared
COPY app/backend ./app/backend
RUN pnpm --filter @banghub/backend build

FROM build AS deploy
WORKDIR /repo
RUN pnpm --filter @banghub/backend --prod deploy /deploy

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=deploy /deploy ./
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/backend/src/server.js"]
