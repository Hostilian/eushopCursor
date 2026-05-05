param(
  [int]$WebPort = 3000,
  [int]$ApiPort = 3001,
  [string]$SessionFile = '.demo-session.json',
  [switch]$SyncWebEnv
)

$ErrorActionPreference = 'Stop'

function Assert-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "$name not found on PATH."
  }
}

function Assert-Listening($port, $label) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if (-not $conns) {
    throw "$label is not listening on port $port. Start it first, then retry."
  }
}

function Start-Tunnel($port, $name) {
  $outLogPath = Join-Path $env:TEMP "eushop-$name-tunnel.out.log"
  $errLogPath = Join-Path $env:TEMP "eushop-$name-tunnel.err.log"
  if (Test-Path $outLogPath) {
    Remove-Item $outLogPath -Force
  }
  if (Test-Path $errLogPath) {
    Remove-Item $errLogPath -Force
  }

  $proc = Start-Process -FilePath "cloudflared" -ArgumentList @("tunnel", "--url", "http://127.0.0.1:$port") -RedirectStandardOutput $outLogPath -RedirectStandardError $errLogPath -PassThru

  $url = $null
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    if (Test-Path $outLogPath) {
      $text = Get-Content -Raw $outLogPath
      if (Test-Path $errLogPath) {
        $text = $text + "`n" + (Get-Content -Raw $errLogPath)
      }
      $match = [regex]::Match($text, "https://[a-z0-9-]+\.trycloudflare\.com")
      if ($match.Success) {
        $url = $match.Value
        break
      }
    }
  }

  if (-not $url) {
    try {
      Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    catch {}
    throw "Failed to capture quick tunnel URL for $name (:${port})."
  }

  return [pscustomobject]@{
    name = $name
    port = $port
    pid = $proc.Id
    logPath = $outLogPath
    errLogPath = $errLogPath
    url = $url
  }
}

Assert-Command "cloudflared"
Assert-Listening $WebPort "Web app"
Assert-Listening $ApiPort "API"

$web = Start-Tunnel -port $WebPort -name "web"
$api = Start-Tunnel -port $ApiPort -name "api"

$session = [pscustomobject]@{
  createdAt = (Get-Date).ToString("o")
  webUrl = $web.url
  apiUrl = $api.url
  webPid = $web.pid
  apiPid = $api.pid
  webLog = $web.logPath
  webErrLog = $web.errLogPath
  apiLog = $api.logPath
  apiErrLog = $api.errLogPath
  webPort = $WebPort
  apiPort = $ApiPort
}

$session | ConvertTo-Json -Depth 5 | Set-Content -Path $SessionFile -Encoding UTF8

Write-Host ""
Write-Host "Demo tunnels are live:" -ForegroundColor Green
Write-Host "WEB: $($session.webUrl)" -ForegroundColor Cyan
Write-Host "API: $($session.apiUrl)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Session file: $SessionFile"
Write-Host "Run ./scripts/demo-status.ps1 for checks."

if ($SyncWebEnv) {
  & "$PSScriptRoot/demo-env-sync.ps1" -SessionFile $SessionFile | Out-Null
  Write-Host "Updated apps/web/.env.local from current demo URLs." -ForegroundColor Yellow
}
