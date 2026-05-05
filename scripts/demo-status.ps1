param(
  [string]$SessionFile = '.demo-session.json'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $SessionFile)) {
  Write-Error "Session file not found: $SessionFile. Run ./scripts/demo-up.ps1 first."
}

$session = Get-Content -Raw $SessionFile | ConvertFrom-Json

function Test-Proc($procId) {
  if (-not $procId) { return $false }
  return [bool](Get-Process -Id $procId -ErrorAction SilentlyContinue)
}

function Probe($url) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 15 -MaximumRedirection 5 -Uri $url
    return "OK $($r.StatusCode)"
  }
  catch {
    if ($_.Exception.Response) {
      return "BAD $([int]$_.Exception.Response.StatusCode)"
    }
    return "ERR"
  }
}

$webProc = Test-Proc $session.webPid
$apiProc = Test-Proc $session.apiPid
$webProbe = Probe "$($session.webUrl)/"
$apiProbe = Probe "$($session.apiUrl)/health"

Write-Host ""
Write-Host "Demo session: $SessionFile" -ForegroundColor Cyan
Write-Host "Created: $($session.createdAt)"
Write-Host ""
Write-Host "WEB URL : $($session.webUrl)"
Write-Host "WEB PID : $($session.webPid) ($([string]$webProc))"
Write-Host "WEB GET / : $webProbe"
Write-Host ""
Write-Host "API URL : $($session.apiUrl)"
Write-Host "API PID : $($session.apiPid) ($([string]$apiProc))"
Write-Host "API /health : $apiProbe"

if (-not $webProc -or -not $apiProc -or $webProbe -notmatch '^OK' -or $apiProbe -notmatch '^OK') {
  exit 1
}
