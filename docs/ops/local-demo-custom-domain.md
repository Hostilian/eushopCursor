# Short, meaningful URL for local demos (Cloudflare Tunnel)

## What you cannot change

**Quick tunnels** (`cloudflared tunnel --url http://localhost:3000`) always get a **random** hostname on `trycloudflare.com`. You **cannot** pick `eushop.trycloudflare.com` or any other short fixed name there. See Cloudflare’s [Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/) documentation.

Random URLs are fine for one-off tests; they are **not** ideal for sharing or OAuth callback configuration.

## Fast local demo workflow (no custom domain, random quick URLs)

From repo root:

1. Start web + API in your usual dev flow so ports are up (`:3000`, `:3001`).
2. Run `./scripts/demo-up.ps1 -SyncWebEnv`.
3. Share the printed `WEB` URL.
4. Run `./scripts/demo-status.ps1` any time to verify both tunnels.
5. Run `./scripts/demo-smoke.ps1` for endpoint checks.
6. When done: `./scripts/demo-down.ps1`.

`demo-up` writes `.demo-session.json` (gitignored) so other scripts can reuse URLs and PIDs.

## What to do instead (short + meaningful)

Use a **hostname you control** on a domain you own (or a subdomain from a domain you buy once), plus a **named Cloudflare Tunnel** (free Cloudflare account; you pay only for the domain, typically a few dollars/euros per year).

**Suggested naming (examples):**

| Hostname pattern | Points at |
| ---------------- | --------- |
| `demo.<yourdomain>` | Next.js web (`:3000`) |
| `api-demo.<yourdomain>` | Hono API (`:3001`) |

Keep labels short: `demo`, `try`, `lab`, `share` — whatever matches your brand.

## High-level steps

1. **Register a domain** (e.g. Cloudflare Registrar, Porkbun, your EU registrar of choice) and add the zone to **Cloudflare DNS** (free plan is enough for Tunnel routing).
2. **Install `cloudflared`** (same binary as quick tunnels).
3. **Authenticate once:** `cloudflared tunnel login` (opens browser; picks the Cloudflare account + zone).
4. **Create a named tunnel:** `cloudflared tunnel create eushop-demo` (name is internal; note the printed **tunnel UUID**).
5. **DNS routes:** for each public hostname, create a **CNAME** to `<tunnel-uuid>.cfargotunnel.com` (Cloudflare dashboard → **Zero Trust** → **Networks** → **Tunnels** → your tunnel → **Public hostname**, or use `cloudflared tunnel route dns` — see [Cloudflare Tunnel docs](https://developers.cloudflare.com/cloudflare-one/connections/connectors/cloudflare-tunnel/)).
6. **Config file:** copy [`scripts/cloudflared/tunnel-config.example.yml`](../../scripts/cloudflared/tunnel-config.example.yml) to `%USERPROFILE%\.cloudflared\config.yml` (or `config.yaml`), replace placeholders (`TUNNEL_UUID`, hostnames, `credentials-file` path), and map each hostname to `http://localhost:3000` / `http://localhost:3001` as needed.
7. **Run:** `cloudflared tunnel run eushop-demo` (leave running while you demo).

**Important:** if a `config.yml` / `config.yaml` exists under `.cloudflared`, **quick tunnels** (`tunnel --url`) may be disabled for that profile — use **only** the named tunnel while that file is present, or rename it when you want random `trycloudflare.com` again.

## Align Eushop env with your new hostnames

In **`apps/web/.env.local`** (not committed), set at least:

```bash
NEXT_PUBLIC_SITE_URL=https://demo.yourdomain.com
NEXT_PUBLIC_API_URL=https://api-demo.yourdomain.com
BETTER_AUTH_URL=https://api-demo.yourdomain.com
```

Restart `pnpm dev:web` / `pnpm dev:web-api` after changes. Full matrix: [environment.md](./environment.md).

## Do not use a public URL shortener as “the domain”

A `bit.ly/…` link still loads your random `trycloudflare.com` origin under the hood. That breaks **clear URLs** for users and can break **cookies / OAuth redirects** if the browser sees mismatched origins. Prefer **real DNS hostnames** on a domain you control.

## Related

- Quick tunnel script (random URL): [`scripts/cloudflare-quick-tunnel.ps1`](../../scripts/cloudflare-quick-tunnel.ps1)
- Broader hosting tradeoffs: [hosting-alternatives.md](./hosting-alternatives.md)
