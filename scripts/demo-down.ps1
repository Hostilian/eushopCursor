param(
  [string]$SessionFile = '.demo-session.json',
  [switch]$KeepSessionFile
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $SessionFile)) {
  Write-Host "No session file found: $SessionFile"
  exit 0
}

$session = Get-Content -Raw $SessionFile | ConvertFrom-Json
$pids = @($session.webPid, $session.apiPid) | Where-Object { $_ }

foreach ($pid in $pids) {
  try {
    Stop-Process -Id $pid -Force -ErrorAction Stop
    Write-Host "Stopped tunnel PID $pid" -ForegroundColor Green
  }
  catch {
    Write-Host "PID $pid already stopped or unavailable." -ForegroundColor Yellow
  }
}

if (-not $KeepSessionFile) {
  Remove-Item $SessionFile -Force
  Write-Host "Removed session file $SessionFile" -ForegroundColor Green
}
