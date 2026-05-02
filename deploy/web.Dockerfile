# Next.js web (standalone). Build from repo root: docker build -f deploy/web.Dockerfile -t eushop-web .
# Pass build-time NEXT_PUBLIC_* as --build-arg when baking public env into the client bundle.
# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

FROM base AS builder
COPY . .

ARG NEXT_PUBLIC_SITE_URL=https://eushop.eu
ARG NEXT_PUBLIC_API_URL=https://api.eushop.eu
ARG NEXT_PUBLIC_PARTYKIT_HOST=https://party.eushop.eu
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PARTYKIT_HOST=$NEXT_PUBLIC_PARTYKIT_HOST
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @eushop/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/web/server.js"]
