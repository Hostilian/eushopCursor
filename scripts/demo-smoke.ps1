param(
  [string]$WebUrl,
  [string]$ApiUrl,
  [string]$SessionFile = '.demo-session.json'
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
  Write-Error 'Provide -WebUrl and -ApiUrl, or run demo-up first so .demo-session.json exists.'
}

$targets = @(
  "$WebUrl/",
  "$WebUrl/help",
  "$WebUrl/contact",
  "$WebUrl/sources",
  "$ApiUrl/health"
)

$failed = $false
foreach ($u in $targets) {
  $attemptOk = $false
  for ($attempt = 1; $attempt -le 2; $attempt++) {
    try {
      $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 5 -Uri $u
      Write-Host "OK  $($r.StatusCode)  $u" -ForegroundColor Green
      $attemptOk = $true
      break
    }
    catch {
      if ($attempt -eq 2) {
        if ($_.Exception.Response) {
          $code = [int]$_.Exception.Response.StatusCode
          Write-Host "BAD $code  $u" -ForegroundColor Red
        }
        else {
          Write-Host "ERR      $u :: $($_.Exception.Message)" -ForegroundColor Red
        }
      }
      else {
        Start-Sleep -Seconds 1
      }
    }
  }
  if (-not $attemptOk) {
    $failed = $true
  }
}

if ($failed) {
  exit 1
}
