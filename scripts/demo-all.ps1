param(
  [int]$WebPort = 3000,
  [int]$ApiPort = 3001,
  [string]$SessionFile = '.demo-session.json',
  [switch]$SkipDown
)

$ErrorActionPreference = 'Stop'

if (-not $SkipDown -and (Test-Path $SessionFile)) {
  & "$PSScriptRoot/demo-down.ps1" -SessionFile $SessionFile | Out-Null
}

& "$PSScriptRoot/demo-up.ps1" -WebPort $WebPort -ApiPort $ApiPort -SessionFile $SessionFile -SyncWebEnv
& "$PSScriptRoot/demo-status.ps1" -SessionFile $SessionFile
& "$PSScriptRoot/demo-smoke.ps1" -SessionFile $SessionFile

$session = Get-Content -Raw $SessionFile | ConvertFrom-Json
Write-Host ""
Write-Host "Share this with friends:" -ForegroundColor Green
Write-Host "$($session.webUrl)" -ForegroundColor Cyan
Write-Host ""
