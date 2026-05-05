param(
  [string]$SessionFile = '.demo-session.json',
  [string]$WebUrl,
  [string]$ApiUrl,
  [string]$TargetPath = 'apps/web/.env.local'
)

$ErrorActionPreference = 'Stop'

if ((-not $WebUrl -or -not $ApiUrl) -and (Test-Path $SessionFile)) {
  $session = Get-Content -Raw $SessionFile | ConvertFrom-Json
  if (-not $WebUrl) {
    $WebUrl = $session.webUrl
  }
  if (-not $ApiUrl) {
    $ApiUrl = $session.apiUrl
  }
}

if (-not $WebUrl -or -not $ApiUrl) {
  Write-Error "Provide -WebUrl and -ApiUrl, or run demo-up first so $SessionFile exists."
}

$content = @(
  "NEXT_PUBLIC_SITE_URL=$WebUrl"
  "NEXT_PUBLIC_API_URL=$ApiUrl"
  "BETTER_AUTH_URL=$ApiUrl"
) -join "`r`n"

$content | Set-Content -Path $TargetPath -Encoding UTF8
Write-Host "Updated $TargetPath" -ForegroundColor Green
