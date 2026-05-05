<#
.SYNOPSIS
  Expose a local HTTP port over HTTPS using Cloudflare's quick tunnel (trycloudflare.com).
  No Cloudflare account required. Your PC must stay on; URL is public — share only with people you trust.

.DESCRIPTION
  Run this script in its own window and leave it open (do not pipe cloudflared through Select-Object etc. — that closes the tunnel and may show a bogus exit code on Windows).

  Prerequisite: install cloudflared once, e.g.
    winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements
  Then start your app (from repo root), e.g. web-only:
    pnpm dev:web
  Or web + API (needs DB per README):
    pnpm dev:web-api

  Full-stack over the internet: the browser must reach BOTH origins. Run TWO tunnels in separate terminals:
    1) .\scripts\cloudflare-quick-tunnel.ps1 -Port 3001
       Copy the printed https://....trycloudflare.com URL (API).
    2) Create apps\web\.env.local with at least:
         NEXT_PUBLIC_API_URL=<API trycloudflare URL>
         BETTER_AUTH_URL=<API trycloudflare URL>
         NEXT_PUBLIC_SITE_URL=<WEB trycloudflare URL - fill after step 3>
    3) Restart Next (stop pnpm dev:web / dev:web-api, start again).
    4) .\scripts\cloudflare-quick-tunnel.ps1 -Port 3000
       Put that URL into NEXT_PUBLIC_SITE_URL in .env.local, restart web again if needed.
    5) Open the WEB trycloudflare URL in a browser.

.EXAMPLE
  .\scripts\cloudflare-quick-tunnel.ps1
  .\scripts\cloudflare-quick-tunnel.ps1 -Port 3001
#>
param(
  [int] $Port = 3000
)

$ErrorActionPreference = "Stop"
$exe = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $exe) {
  Write-Error "cloudflared not found on PATH. Install with: winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements`nThen open a new PowerShell window."
}

$url = "http://127.0.0.1:$Port"
Write-Host ""
Write-Host "Quick tunnel -> $url" -ForegroundColor Cyan
Write-Host "When cloudflared prints a https://....trycloudflare.com URL, that is your public link." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the tunnel." -ForegroundColor DarkGray
Write-Host ""

& cloudflared tunnel --url $url
