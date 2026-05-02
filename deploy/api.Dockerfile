# API (Hono + tRPC). Build from repo root: docker build -f deploy/api.Dockerfile -t eushop-api .
# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

FROM base AS runner
ENV NODE_ENV=production

COPY . .
RUN pnpm install --frozen-lockfile

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs apiuser \
  && chown -R apiuser:nodejs /app
USER apiuser

EXPOSE 3001
ENV PORT=3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["pnpm", "--filter", "@eushop/api-server", "start"]
