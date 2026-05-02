# Production container images

Build from the **repository root** so pnpm workspaces resolve.

```bash
docker build -f deploy/api.Dockerfile -t eushop-api:latest .
docker build -f deploy/web.Dockerfile -t eushop-web:latest \
  --build-arg NEXT_PUBLIC_SITE_URL=https://eushop.eu \
  --build-arg NEXT_PUBLIC_API_URL=https://api.eushop.eu \
  --build-arg NEXT_PUBLIC_PARTYKIT_HOST=https://party.eushop.eu \
  .
docker build -f deploy/admin.Dockerfile -t eushop-admin:latest \
  --build-arg NEXT_PUBLIC_API_URL=https://api.eushop.eu \
  --build-arg BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
  .
```

Runtime: inject the full env matrix from [docs/ops/environment.md](../docs/ops/environment.md). Web and admin bake `NEXT_PUBLIC_*` at **build** time; rebuild when those change.

Optional: [`.github/workflows/docker-publish.yml`](../.github/workflows/docker-publish.yml) builds and pushes images when you run it manually with a version tag.
