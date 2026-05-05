# Hosting choices (Vercel-like vs this repo’s default)

## What “open source Vercel alternative” means in **this** repo

**Coolify** ([coolify.io](https://coolify.io/)) is the **MIT-licensed, self-hosted PaaS** we document as the closest analogue to Vercel: Git-connected apps, env vars, HTTPS, health checks, **without** renting Vercel’s proprietary runtime.

Important distinction:

| Layer | Open source? | Who pays? |
| ----- | -------------- | --------- |
| **Coolify (the product)** | Yes (MIT) | $0 for the software |
| **The machine it runs on** | N/A | **You** still need a **Linux host** (almost always a **VPS** or a server you keep on). Coolify does not replace compute. |

So: **“OSS + Vercel-like UX” = Coolify (or similar) on a server.** There is no honest **“fully OSS + infinitely scalable + €0 + zero server”** drop-in for a full **Next.js + long-lived Node API + Postgres** stack—someone’s hardware and bandwidth are always in the loop.

**Other self-hosted PaaS** in the same family (same idea: you bring Linux):

- [CapRover](https://caprover.com/) — MIT-style PaaS on a VPS; same build/start contract as [hosting-contract.md](./hosting-contract.md).
- [Dokku](https://dokku.com/) — Docker-powered mini-PaaS on a single host.

This repo’s runbooks assume **Coolify-first**; swapping the control plane does not change the **API / web / Postgres** architecture.

## If you **do not** want a VPS (managed “someone else’s servers”)

Then you are not using **self-hosted Coolify** as the host—you are using a **managed** provider’s runtime (often proprietary dashboards, pricing tiers, cold starts on free tiers). That can be fine for demos; it is **not** the same category as “open source Vercel alternative” above.

Typical patterns (you wire env + build commands from [hosting-contract.md](./hosting-contract.md)):

- **Web (Next.js):** e.g. Vercel, Netlify, Cloudflare Pages (static only is easy; **full** `apps/web` with SSR needs a plan that supports Node/SSR and your env).
- **API (Hono Node server):** e.g. Render, Railway, Fly.io, a small always-on container service.
- **Postgres:** e.g. Neon, Supabase, RDS, or the provider’s managed DB.

**Tradeoffs:** EU data residency, spin-down on free tiers, vendor lock-in, and splitting **web vs API** URLs (`NEXT_PUBLIC_API_URL`, `BETTER_AUTH_URL`) are your responsibility—see [environment.md](./environment.md).

This path is **not** the repo’s **recommended production** posture (see [free-preview-deploy.md](./free-preview-deploy.md) history and README), but it is a valid **“I refuse to SSH into a VPS”** escape hatch if you accept managed SaaS.

## “I truly cannot pay for a VPS” — what exists (honest)

**There is no provider that gives you an unlimited, production-scale Linux host forever for €0** with a serious SLA. “Free” here means **hobby / learning / tiny demos**, with caps, spin-down, or fragile availability.

| Option | What you get | Caveats |
| ------ | -------------- | ------- |
| **Cloud “always free” / free tier VMs** (e.g. [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/) ARM Ampere) | A real Linux VM you can SSH into and install Docker/Coolify | **Signup usually requires a payment method on file** (verification / abuse prevention)—if you cannot add one, this path is blocked. Oracle also advertises a **time-limited trial** (credits / days); that is **separate** from **Always Free** eligible resources—read [Oracle’s Free Tier FAQ](https://www.oracle.com/cloud/free/faq/) for what persists after the trial vs what gets reclaimed. Quotas, region capacity, and **terms change**. |
| **Major clouds’ introductory credit** (AWS, GCP, Azure) | Often **months** of small usage covered by credits | Usually **card on file** at signup; ends; then you pay. Good for learning, not a permanent free lunch. |
| **Student / OSS programs** | Extra credits or perks (e.g. [GitHub Student Developer Pack](https://education.github.com/pack)) | Eligibility-limited; still bounded credits. |
| **Managed PaaS free tiers** (Render, Fly.io, etc.) | Hosted containers or web services without running your own VM | **Not** self-hosted Coolify on your box; cold starts, sleep, CPU/RAM caps, **not** the same as scaling a marketplace for real traffic—see [zero-cost-stack.md](./zero-cost-stack.md). |
| **Old PC / Raspberry Pi at home** | Linux host for €0 marginal cost | Your ISP, dynamic IP, uptime, and security are on you—not “cloud scalable” without extra work. |

**Bottom line:** the closest to “free Linux in the cloud” is usually a **cloud free tier VM** (Oracle is the one most often cited for a persistent small VM) **or** **managed free tiers** split across web/API/DB—not both “fully self-hosted Coolify” and “unlimited free scale.” For anything you care about (users, data, uptime), budget **something** (even a few euros/month on a small VPS) or use managed free tiers and accept the limits.

### If you **cannot** add any billing account / card (hard stop for many “free” clouds)

Most serious cloud **VM** offers still ask for **identity + payment verification** even when the tier is €0—so “free” is not the same as “no billing details.” If that is impossible for you:

| Path | Fits Eushop “full product”? |
| ---- | --------------------------- |
| **GitHub Pages** for the repo’s **static stub** under `infra/pages/` | **No** — marketing mirror only; not `apps/web` + API + auth. |
| **Temporary public URL** while your dev machine runs (e.g. **Cloudflare Tunnel**, **ngrok**) | **Demo only** — your PC must be on during the demo; not production. |

#### Quick tunnel from Windows (Cloudflare `trycloudflare.com`, no account)

1. Install **cloudflared**: `winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements` (then **open a new terminal** so `PATH` updates).
2. From the repo root, start the app (see README): e.g. `pnpm dev:web` (web only on `:3000`) or `pnpm dev:web-api` (web `:3000` + API `:3001` when DB/env are ready).
3. In another terminal: [`scripts/cloudflare-quick-tunnel.ps1`](../../scripts/cloudflare-quick-tunnel.ps1) — default exposes `:3000`. Use `-Port 3001` for the API when you need the full stack; follow the script header for **two tunnels** + `apps/web/.env.local` (`NEXT_PUBLIC_API_URL`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`).

The printed `https://*.trycloudflare.com` link is **world-readable** while the tunnel runs — treat it like a password for demos only.
| **Linux on hardware you already own** (old PC, Raspberry Pi) at home | **Yes, in principle** — you install Coolify/Docker there; scaling and reliability are limited unless you invest time. |
| **Someone else’s server** (friend, club, university lab) | Depends on their rules — not something this repo can automate. |

There is **no reputable** “sign up with email only, get a forever free production VPS with no card” pattern for this stack—anything claiming that is usually a scam or unusable for real workloads.

## Summary

| Goal | Use |
| ---- | --- |
| **FOSS control plane, Vercel-like workflows** | **Coolify** (or CapRover / Dokku) on **Linux you control** (VPS recommended). |
| **No paid VPS, still want a Linux VM** | Cloud **free tier** VM **if** you can pass signup (often **card on file**)—see Oracle/AWS/GCP docs. |
| **No billing account at all** | Home Linux hardware, tunnel demos from your PC, or GitHub Pages static stub only—see subsection above. |
| **No VPS, click-hosted** | Managed PaaS + managed DB — **not** “the OSS alternative”; different tradeoffs. |
| **Marketing-only static site** | Optional GitHub Pages stub under `infra/pages/` — **not** the full product. |

Canonical deploy order for the real stack remains [deploy-runbook.md](./deploy-runbook.md) and [oss-self-hosted-deploy.md](./oss-self-hosted-deploy.md).
